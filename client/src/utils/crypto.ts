import CryptoJS from "crypto-js";
import type { StudentFormValues } from "../types/student";

const SECRET_KEY =
  import.meta.env.VITE_FRONTEND_SECRET_KEY ?? "frontend_secret_key";

export interface EncryptedStudentPayload {
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  courseEnrolled: string;
  password: string;
}

const encryptValue = (value: string) =>
  CryptoJS.AES.encrypt(value, SECRET_KEY).toString();

const decryptValue = (cipherText: string, label: string) => {
  const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
  let utf8Value = "";

  try {
    utf8Value = bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    throw new Error(
      `Unable to decrypt ${label}. Check the frontend secret key.`,
    );
  }

  if (!utf8Value) {
    throw new Error(
      `Unable to decrypt ${label}. Check the frontend secret key.`,
    );
  }

  return utf8Value;
};

export const encryptStudentPayload = (
  data: StudentFormValues,
): EncryptedStudentPayload => ({
  fullName: encryptValue(data.fullName),
  email: encryptValue(data.email),
  phoneNumber: encryptValue(data.phoneNumber),
  dateOfBirth: encryptValue(data.dateOfBirth),
  gender: encryptValue(data.gender),
  address: encryptValue(data.address),
  courseEnrolled: encryptValue(data.courseEnrolled),
  password: encryptValue(data.password),
});

export const decryptStudentPayload = (
  data: EncryptedStudentPayload,
): StudentFormValues => ({
  fullName: decryptValue(data.fullName, "the student's full name"),
  email: decryptValue(data.email, "the student's email"),
  phoneNumber: decryptValue(data.phoneNumber, "the student's phone number"),
  dateOfBirth: decryptValue(data.dateOfBirth, "the student's date of birth"),
  gender: decryptValue(data.gender, "the student's gender"),
  address: decryptValue(data.address, "the student's address"),
  courseEnrolled: decryptValue(
    data.courseEnrolled,
    "the student's course enrollment",
  ),
  password: decryptValue(data.password, "the student's password"),
});

export const decryptLegacyPayload = <T>(cipherText: string): T => {
  const utf8Value = decryptValue(cipherText, "the server response");

  return JSON.parse(utf8Value) as T;
};
