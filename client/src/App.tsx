import axios from "axios";
import { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import LoginForm from "./components/LoginForm";
import StudentForm from "./components/StudentForm";
import StudentList from "./components/StudentList";
import {
  normalizeStudentFormValues,
  type LoginValues,
  type StudentFormValues,
  type StudentRecord,
} from "./types/student";
import {
  decryptStudentPayload,
  encryptStudentPayload,
  type EncryptedStudentPayload,
} from "./utils/crypto";

interface ApiStudent {
  _id: string;
  data: EncryptedStudentPayload;
  createdAt?: string;
  updatedAt?: string;
}

interface PaginatedStudentsResponse {
  students: ApiStudent[];
  pagination: {
    page: number;
    limit: number;
    totalStudents: number;
    totalPages: number;
  };
}

const DEFAULT_ADMIN = {
  email: "admin@example.com",
  password: "Admin@123",
};
const STUDENT_PAGE_SIZE = 4;

const rawApiBaseUrl =
  import.meta.env.VITE_API_URL ?? "http://localhost:9000/api";

const API_BASE_URL = rawApiBaseUrl.endsWith("/api")
  ? rawApiBaseUrl
  : `${rawApiBaseUrl.replace(/\/+$/, "")}/api`;

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
};

const App = () => {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loggedInEmail, setLoggedInEmail] = useState<string | null>(null);
  const [studentBeingEdited, setStudentBeingEdited] =
    useState<StudentRecord | null>(null);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isSavingStudent, setIsSavingStudent] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);

  const fetchStudents = async (page: number) => {
    const response = await axios.get<PaginatedStudentsResponse>(
      `${API_BASE_URL}/students`,
      {
        params: {
          page,
          limit: STUDENT_PAGE_SIZE,
        },
      },
    );

    return {
      students: response.data.students.map((student) => {
        const decryptedStudent = normalizeStudentFormValues(
          decryptStudentPayload(student.data),
        );

        return {
          ...decryptedStudent,
          id: student._id,
          createdAt: student.createdAt,
          updatedAt: student.updatedAt,
        };
      }),
      pagination: response.data.pagination,
    };
  };

  const loadStudents = async (page = currentPage) => {
    setIsLoadingStudents(true);

    try {
      const { students: nextStudents, pagination } = await fetchStudents(page);
      setStudents(nextStudents);
      setCurrentPage(pagination.page);
      setTotalPages(pagination.totalPages);
      setTotalStudents(pagination.totalStudents);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoadingStudents(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setStudents([]);
      setStudentBeingEdited(null);
      setIsLoadingStudents(false);
      setCurrentPage(1);
      setTotalPages(1);
      setTotalStudents(0);
      return;
    }

    void loadStudents(currentPage);
  }, [currentPage, isAuthenticated]);

  const handleLogin = async (values: LoginValues) => {
    setIsLoggingIn(true);

    try {
      const email = values.email.trim().toLowerCase();
      const password = values.password;

      if (
        email !== DEFAULT_ADMIN.email.toLowerCase() ||
        password !== DEFAULT_ADMIN.password
      ) {
        throw new Error("Invalid admin credentials.");
      }

      setIsAuthenticated(true);
      setLoggedInEmail(email);
      toast.success("Admin login successful.");
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw new Error(message, { cause: error });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setLoggedInEmail(null);
    setStudentBeingEdited(null);
    setStudents([]);
    setCurrentPage(1);
    setTotalPages(1);
    setTotalStudents(0);
    toast.success("Logged out successfully.");
  };

  const createStudent = async (values: StudentFormValues) => {
    setIsSavingStudent(true);

    try {
      await axios.post(`${API_BASE_URL}/register`, {
        ...encryptStudentPayload(values),
      });

      toast.success("Student registered successfully.");

      if (currentPage === 1) {
        await loadStudents(1);
      } else {
        setCurrentPage(1);
      }
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw new Error(message, { cause: error });
    } finally {
      setIsSavingStudent(false);
    }
  };

  const updateStudent = async (values: StudentFormValues) => {
    if (!studentBeingEdited) {
      return;
    }

    setIsSavingStudent(true);

    try {
      await axios.put(`${API_BASE_URL}/student/${studentBeingEdited.id}`, {
        ...encryptStudentPayload(values),
      });

      toast.success("Student updated successfully.");
      setStudentBeingEdited(null);

      if (currentPage === 1) {
        await loadStudents(1);
      } else {
        setCurrentPage(1);
      }
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw new Error(message, { cause: error });
    } finally {
      setIsSavingStudent(false);
    }
  };

  const handleDelete = async (student: StudentRecord) => {
    const shouldDelete = window.confirm(
      `Delete ${student.fullName}'s record? This action cannot be undone.`,
    );

    if (!shouldDelete) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/student/${student.id}`);

      if (studentBeingEdited?.id === student.id) {
        setStudentBeingEdited(null);
      }

      toast.success("Student deleted successfully.");

      const nextTotalStudents = Math.max(totalStudents - 1, 0);
      const nextTotalPages = Math.max(
        1,
        Math.ceil(nextTotalStudents / STUDENT_PAGE_SIZE),
      );
      const nextPage = Math.min(currentPage, nextTotalPages);

      if (nextPage === currentPage) {
        await loadStudents(nextPage);
      } else {
        setCurrentPage(nextPage);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="min-h-screen">
      <Toaster position="top-right" />

      <div className="mx-auto flex w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-slate-950 px-6 py-8 text-white shadow-2xl shadow-slate-900/10 sm:px-8 sm:py-10 lg:px-10 animate-fade-up">
          <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-sky-400/20 blur-3xl animate-float-slow" />
          <div className="absolute bottom-0 right-0 h-44 w-44 rounded-full bg-indigo-300/10 blur-3xl animate-float-delayed" />

          <div className="relative z-10">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">
              Student Registry
            </p>
            <h1 className="mt-4 max-w-4xl font-display text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              Responsive student registration dashboard with secure CRUD
              handling
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              The backend exposes only the required student CRUD APIs. Admin
              access is handled through the default login form in the frontend.
            </p>
          </div>
        </header>

        <main className="mt-6 space-y-6">
          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-5 shadow-xl shadow-slate-200/50 backdrop-blur sm:p-6 animate-fade-up">
              <LoginForm
                isAuthenticated={isAuthenticated}
                isSubmitting={isLoggingIn}
                loggedInEmail={loggedInEmail}
                onLogin={handleLogin}
                onLogout={handleLogout}
              />
            </section>

            {isAuthenticated ? (
              <section className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-5 shadow-xl shadow-slate-200/50 backdrop-blur sm:p-6 animate-fade-up">
                <StudentForm
                  initialValues={studentBeingEdited}
                  mode={studentBeingEdited ? "edit" : "create"}
                  isSubmitting={isSavingStudent}
                  onCancel={() => setStudentBeingEdited(null)}
                  onSubmit={studentBeingEdited ? updateStudent : createStudent}
                />
              </section>
            ) : (
              <section className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-xl shadow-slate-200/50 backdrop-blur animate-fade-up">
                <div className="flex min-h-64 items-center justify-center rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50/70 px-6 py-12 text-center">
                  <div className="max-w-xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
                      Locked Workspace
                    </p>
                    <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-slate-950">
                      Sign in with the default admin account
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-slate-500">
                      After login, the student registration form and encrypted
                      CRUD directory will be available here.
                    </p>
                  </div>
                </div>
              </section>
            )}
          </div>

          {isAuthenticated ? (
            <section className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-5 shadow-xl shadow-slate-200/50 backdrop-blur sm:p-6 animate-fade-up">
              <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
                    Student Directory
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-slate-950">
                    Saved Students
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Review, update, and delete student records from one place.
                  </p>
                </div>

                <button
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                  type="button"
                  onClick={() => void loadStudents()}
                  disabled={isLoadingStudents}
                >
                  Refresh List
                </button>
              </div>

              <StudentList
                activeStudentId={studentBeingEdited?.id}
                currentPage={currentPage}
                isLoading={isLoadingStudents}
                onDelete={handleDelete}
                onEdit={setStudentBeingEdited}
                onPageChange={setCurrentPage}
                students={students}
                totalPages={totalPages}
                totalStudents={totalStudents}
                pageSize={STUDENT_PAGE_SIZE}
              />
            </section>
          ) : null}
        </main>
      </div>
    </div>
  );
};

export default App;
