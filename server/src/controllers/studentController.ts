import { Request, Response } from "express";
import Student from "../models/Student";
import {
  buildEmailIndex,
  decryptClientLayer,
  decryptClientValue,
  decryptServerLayer,
  decryptServerValue,
  encryptClientValue,
  encryptServerValue,
} from "../utils/crypto";

interface StudentPayload {
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  courseEnrolled: string;
  password: string;
}

interface EncryptedStudentPayload {
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  courseEnrolled: string;
  password: string;
}

type StoredStudentData =
  | string
  | EncryptedStudentPayload
  | Map<string, string>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[0-9+() -]{7,20}$/;
const passwordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
const DEFAULT_PAGE_SIZE = 6;
const MAX_PAGE_SIZE = 24;
const studentFieldNames: Array<keyof StudentPayload> = [
  "fullName",
  "email",
  "phoneNumber",
  "dateOfBirth",
  "gender",
  "address",
  "courseEnrolled",
  "password",
];

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
};

const normalizeStudentPayload = (payload: StudentPayload): StudentPayload => ({
  fullName: payload.fullName.trim(),
  email: payload.email.trim().toLowerCase(),
  phoneNumber: payload.phoneNumber.trim(),
  dateOfBirth: payload.dateOfBirth,
  gender: payload.gender.trim(),
  address: payload.address.trim(),
  courseEnrolled: payload.courseEnrolled.trim(),
  password: payload.password,
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const getObjectRecord = (value: unknown) => {
  if (value instanceof Map) {
    return Object.fromEntries(value.entries());
  }

  if (isRecord(value)) {
    return value;
  }

  return null;
};

const getEncryptedStudentPayload = (
  value: unknown,
  label: string,
): EncryptedStudentPayload => {
  const record = getObjectRecord(value);

  if (!record) {
    throw new Error(`${label} is required.`);
  }

  for (const field of studentFieldNames) {
    if (typeof record[field] !== "string" || !record[field]) {
      throw new Error(`Encrypted ${field} is required.`);
    }
  }

  return {
    fullName: record.fullName as string,
    email: record.email as string,
    phoneNumber: record.phoneNumber as string,
    dateOfBirth: record.dateOfBirth as string,
    gender: record.gender as string,
    address: record.address as string,
    courseEnrolled: record.courseEnrolled as string,
    password: record.password as string,
  };
};

const encryptClientPayloadByField = (
  payload: StudentPayload,
): EncryptedStudentPayload => ({
  fullName: encryptClientValue(payload.fullName),
  email: encryptClientValue(payload.email),
  phoneNumber: encryptClientValue(payload.phoneNumber),
  dateOfBirth: encryptClientValue(payload.dateOfBirth),
  gender: encryptClientValue(payload.gender),
  address: encryptClientValue(payload.address),
  courseEnrolled: encryptClientValue(payload.courseEnrolled),
  password: encryptClientValue(payload.password),
});

const decryptClientPayloadByField = (
  payload: EncryptedStudentPayload,
): StudentPayload => ({
  fullName: decryptClientValue(payload.fullName, "the student's full name"),
  email: decryptClientValue(payload.email, "the student's email"),
  phoneNumber: decryptClientValue(
    payload.phoneNumber,
    "the student's phone number",
  ),
  dateOfBirth: decryptClientValue(
    payload.dateOfBirth,
    "the student's date of birth",
  ),
  gender: decryptClientValue(payload.gender, "the student's gender"),
  address: decryptClientValue(payload.address, "the student's address"),
  courseEnrolled: decryptClientValue(
    payload.courseEnrolled,
    "the student's course enrollment",
  ),
  password: decryptClientValue(payload.password, "the student's password"),
});

const encryptServerPayloadByField = (
  payload: EncryptedStudentPayload,
): EncryptedStudentPayload => ({
  fullName: encryptServerValue(payload.fullName),
  email: encryptServerValue(payload.email),
  phoneNumber: encryptServerValue(payload.phoneNumber),
  dateOfBirth: encryptServerValue(payload.dateOfBirth),
  gender: encryptServerValue(payload.gender),
  address: encryptServerValue(payload.address),
  courseEnrolled: encryptServerValue(payload.courseEnrolled),
  password: encryptServerValue(payload.password),
});

const decryptServerPayloadByField = (
  payload: EncryptedStudentPayload,
): EncryptedStudentPayload => ({
  fullName: decryptServerValue(payload.fullName, "the stored full name"),
  email: decryptServerValue(payload.email, "the stored email"),
  phoneNumber: decryptServerValue(
    payload.phoneNumber,
    "the stored phone number",
  ),
  dateOfBirth: decryptServerValue(
    payload.dateOfBirth,
    "the stored date of birth",
  ),
  gender: decryptServerValue(payload.gender, "the stored gender"),
  address: decryptServerValue(payload.address, "the stored address"),
  courseEnrolled: decryptServerValue(
    payload.courseEnrolled,
    "the stored course enrollment",
  ),
  password: decryptServerValue(payload.password, "the stored password"),
});

const validateStudentPayload = (payload: StudentPayload) => {
  if (!payload.fullName || payload.fullName.length < 3) {
    return "Full name must be at least 3 characters long.";
  }

  if (!emailPattern.test(payload.email)) {
    return "Please enter a valid email address.";
  }

  if (!phonePattern.test(payload.phoneNumber)) {
    return "Please enter a valid phone number.";
  }

  if (!payload.dateOfBirth || Number.isNaN(Date.parse(payload.dateOfBirth))) {
    return "Please provide a valid date of birth.";
  }

  if (!["Male", "Female", "Other"].includes(payload.gender)) {
    return "Please select a valid gender.";
  }

  if (!payload.address || payload.address.length < 10) {
    return "Address must be at least 10 characters long.";
  }

  if (!payload.courseEnrolled || payload.courseEnrolled.length < 2) {
    return "Course enrolled is required.";
  }

  if (!payload.password || payload.password.length < 8) {
    return "Password must be at least 8 characters long.";
  }

  if (!passwordPattern.test(payload.password)) {
    return "Password must include uppercase, lowercase, number, and special character.";
  }

  return null;
};

const getStudentPayloadFromRequest = (req: Request) => {
  const body = isRecord(req.body) ? req.body : {};
  const nestedData = body.data;

  if (typeof nestedData === "string") {
    return normalizeStudentPayload(
      decryptClientLayer<StudentPayload>(nestedData),
    );
  }

  if (nestedData !== undefined) {
    return normalizeStudentPayload(
      decryptClientPayloadByField(
        getEncryptedStudentPayload(nestedData, "Encrypted student data"),
      ),
    );
  }

  return normalizeStudentPayload(
    decryptClientPayloadByField(
      getEncryptedStudentPayload(body, "Encrypted student data"),
    ),
  );
};

const parsePositiveInteger = (value: unknown, fallback: number) => {
  const parsedValue = Number.parseInt(String(value ?? ""), 10);

  if (Number.isNaN(parsedValue) || parsedValue < 1) {
    return fallback;
  }

  return parsedValue;
};

const buildStoredStudentPayload = (payload: StudentPayload) =>
  encryptServerPayloadByField(encryptClientPayloadByField(payload));

const serializeStudentData = (data: StoredStudentData) => {
  if (typeof data === "string") {
    return encryptClientPayloadByField(
      normalizeStudentPayload(
        decryptClientLayer<StudentPayload>(decryptServerLayer(data)),
      ),
    );
  }

  return decryptServerPayloadByField(
    getEncryptedStudentPayload(data, "Stored student data"),
  );
};

const serializeStudent = (student: {
  _id: { toString: () => string };
  data: StoredStudentData;
  createdAt?: Date;
  updatedAt?: Date;
}) => ({
  _id: student._id.toString(),
  data: serializeStudentData(student.data),
  createdAt: student.createdAt,
  updatedAt: student.updatedAt,
});

export const registerStudent = async (req: Request, res: Response) => {
  try {
    const payload = getStudentPayloadFromRequest(req);
    const validationMessage = validateStudentPayload(payload);

    if (validationMessage) {
      res.status(400).json({
        success: false,
        message: validationMessage,
      });
      return;
    }

    const emailIndex = buildEmailIndex(payload.email);
    const existingStudent = await Student.findOne({ emailIndex });

    if (existingStudent) {
      res.status(409).json({
        success: false,
        message: "A student with this email already exists.",
      });
      return;
    }

    const student = await Student.create({
      data: buildStoredStudentPayload(payload),
      emailIndex,
    });

    res.status(201).json({
      success: true,
      message: "Student registered successfully.",
      student: serializeStudent(student),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

export const getStudents = async (req: Request, res: Response) => {
  try {
    const requestedPage = parsePositiveInteger(req.query.page, 1);
    const requestedLimit = parsePositiveInteger(
      req.query.limit,
      DEFAULT_PAGE_SIZE,
    );
    const limit = Math.min(requestedLimit, MAX_PAGE_SIZE);
    const totalStudents = await Student.countDocuments();
    const totalPages = Math.max(1, Math.ceil(totalStudents / limit));
    const page = Math.min(requestedPage, totalPages);
    const students = await Student.find()
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      students: students.map((student) => serializeStudent(student)),
      pagination: {
        page,
        limit,
        totalStudents,
        totalPages,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

export const updateStudent = async (req: Request, res: Response) => {
  try {
    const payload = getStudentPayloadFromRequest(req);
    const validationMessage = validateStudentPayload(payload);

    if (validationMessage) {
      res.status(400).json({
        success: false,
        message: validationMessage,
      });
      return;
    }

    const emailIndex = buildEmailIndex(payload.email);
    const existingStudent = await Student.findOne({
      _id: { $ne: req.params.id },
      emailIndex,
    });

    if (existingStudent) {
      res.status(409).json({
        success: false,
        message: "Another student already uses this email address.",
      });
      return;
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      {
        data: buildStoredStudentPayload(payload),
        emailIndex,
      },
      {
        new: true,
      },
    );

    if (!updatedStudent) {
      res.status(404).json({
        success: false,
        message: "Student not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Student updated successfully.",
      student: serializeStudent(updatedStudent),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id);

    if (!deletedStudent) {
      res.status(404).json({
        success: false,
        message: "Student not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Student deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};
