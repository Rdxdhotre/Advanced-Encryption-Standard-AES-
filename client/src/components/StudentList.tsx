import type { StudentRecord } from "../types/student";

interface StudentListProps {
  activeStudentId?: string | null;
  currentPage: number;
  isLoading: boolean;
  onDelete: (student: StudentRecord) => void;
  onEdit: (student: StudentRecord) => void;
  onPageChange: (page: number) => void;
  pageSize: number;
  students: StudentRecord[];
  totalPages: number;
  totalStudents: number;
}

const formatDate = (dateValue: string) => {
  if (!dateValue) {
    return "Not provided";
  }

  return new Date(dateValue).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const StudentList = ({
  activeStudentId,
  currentPage,
  isLoading,
  onDelete,
  onEdit,
  onPageChange,
  pageSize,
  students,
  totalPages,
  totalStudents,
}: StudentListProps) => {
  if (isLoading) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/70 px-6 py-12 text-center text-sm text-slate-500">
        Loading student records...
      </div>
    );
  }

  if (!students.length) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/70 px-6 py-12 text-center text-sm text-slate-500">
        No students yet. Add the first record from the form.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {students.map((student) => (
          <article
            key={student.id}
            className={
              student.id === activeStudentId
                ? "animate-fade-up rounded-3xl border border-sky-300 bg-sky-50/70 p-5 shadow-lg shadow-sky-100/60"
                : "animate-fade-up rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            }
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-lg font-semibold text-slate-950">
                  {student.fullName}
                </h3>
                <p className="mt-1 text-sm text-slate-500">{student.courseEnrolled}</p>
              </div>
              <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
                {student.gender}
              </span>
            </div>

            <div className="mt-5 grid gap-4 text-sm text-slate-600">
              <p className="grid gap-1">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Email
                </span>
                <span className="break-words text-slate-700">{student.email}</span>
              </p>
              <p className="grid gap-1">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Phone
                </span>
                <span className="text-slate-700">{student.phoneNumber}</span>
              </p>
              <p className="grid gap-1">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Date of birth
                </span>
                <span className="text-slate-700">{formatDate(student.dateOfBirth)}</span>
              </p>
              <p className="grid gap-1">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Address
                </span>
                <span className="break-words text-slate-700">{student.address}</span>
              </p>
              <p className="grid gap-1">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Last updated
                </span>
                <span className="text-slate-700">{formatDate(student.updatedAt ?? "")}</span>
              </p>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
                type="button"
                onClick={() => onEdit(student)}
              >
                Edit
              </button>
              <button
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-rose-500"
                type="button"
                onClick={() => onDelete(student)}
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-3xl border border-slate-200/80 bg-slate-50/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          Showing {(currentPage - 1) * pageSize + 1}
          {" - "}
          {(currentPage - 1) * pageSize + students.length} of {totalStudents} students
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <button
            className="inline-flex min-h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={isLoading || currentPage === 1}
          >
            Previous
          </button>

          <span className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
            Page {currentPage} of {totalPages}
          </span>

          <button
            className="inline-flex min-h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={isLoading || currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentList;
