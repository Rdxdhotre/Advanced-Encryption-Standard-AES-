export interface StudentFormValues {
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  courseEnrolled: string;
  password: string;
}

export interface LoginValues {
  email: string;
  password: string;
}

export interface StudentRecord extends StudentFormValues {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

export const emptyStudentForm: StudentFormValues = {
  fullName: "",
  email: "",
  phoneNumber: "",
  dateOfBirth: "",
  gender: "",
  address: "",
  courseEnrolled: "",
  password: "",
};

type LegacyStudentShape = Partial<
  StudentFormValues & {
    phone?: string;
    dob?: string;
    course?: string;
  }
>;

export const normalizeStudentFormValues = (
  values: LegacyStudentShape,
): StudentFormValues => ({
  fullName: values.fullName ?? "",
  email: values.email ?? "",
  phoneNumber: values.phoneNumber ?? values.phone ?? "",
  dateOfBirth: values.dateOfBirth ?? values.dob ?? "",
  gender: values.gender ?? "",
  address: values.address ?? "",
  courseEnrolled: values.courseEnrolled ?? values.course ?? "",
  password: values.password ?? "",
});
