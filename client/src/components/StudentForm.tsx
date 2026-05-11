import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { emptyStudentForm, type StudentFormValues } from "../types/student";

interface StudentFormProps {
  initialValues?: StudentFormValues | null;
  mode: "create" | "edit";
  isSubmitting: boolean;
  onCancel?: () => void;
  onSubmit: (values: StudentFormValues) => Promise<void>;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

const StudentForm = ({
  initialValues,
  mode,
  isSubmitting,
  onCancel,
  onSubmit,
}: StudentFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StudentFormValues>({
    defaultValues: initialValues ?? emptyStudentForm,
  });

  useEffect(() => {
    reset(initialValues ?? emptyStudentForm);
  }, [initialValues, reset]);

  const handleFormSubmit = async (values: StudentFormValues) => {
    const nextValues: StudentFormValues = {
      ...values,
      fullName: values.fullName.trim(),
      email: values.email.trim().toLowerCase(),
      phoneNumber: values.phoneNumber.trim(),
      gender: values.gender.trim(),
      address: values.address.trim(),
      courseEnrolled: values.courseEnrolled.trim(),
    };

    try {
      await onSubmit(nextValues);

      if (mode === "create") {
        reset(emptyStudentForm);
      }
    } catch {
      // Parent component surfaces request errors.
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(handleFormSubmit)}>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
          Student Form
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-slate-950">
          {mode === "edit" ? "Update Student" : "Register Student"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Enter the full student profile and save it using the encrypted CRUD
          workflow.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Full name</span>
          <input
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            placeholder="Aarav Deshmukh"
            {...register("fullName", {
              required: "Full name is required.",
              minLength: {
                value: 3,
                message: "Full name must be at least 3 characters long.",
              },
            })}
          />
          {errors.fullName ? (
            <small className="text-sm text-rose-600">{errors.fullName.message}</small>
          ) : null}
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <input
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            type="email"
            placeholder="aarav@example.com"
            {...register("email", {
              required: "Email is required.",
              pattern: {
                value: emailPattern,
                message: "Enter a valid email address.",
              },
              setValueAs: (value: string) => value.trim().toLowerCase(),
            })}
          />
          {errors.email ? (
            <small className="text-sm text-rose-600">{errors.email.message}</small>
          ) : null}
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Phone number</span>
          <input
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            placeholder="+91 98765 43210"
            {...register("phoneNumber", {
              required: "Phone number is required.",
              pattern: {
                value: /^[0-9+() -]{7,20}$/,
                message: "Enter a valid phone number.",
              },
            })}
          />
          {errors.phoneNumber ? (
            <small className="text-sm text-rose-600">{errors.phoneNumber.message}</small>
          ) : null}
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Date of birth</span>
          <input
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            type="date"
            {...register("dateOfBirth", {
              required: "Date of birth is required.",
            })}
          />
          {errors.dateOfBirth ? (
            <small className="text-sm text-rose-600">{errors.dateOfBirth.message}</small>
          ) : null}
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Gender</span>
          <select
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            {...register("gender", { required: "Gender is required." })}
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          {errors.gender ? (
            <small className="text-sm text-rose-600">{errors.gender.message}</small>
          ) : null}
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Course enrolled</span>
          <input
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            placeholder="B.Sc Computer Science"
            {...register("courseEnrolled", {
              required: "Course enrolled is required.",
            })}
          />
          {errors.courseEnrolled ? (
            <small className="text-sm text-rose-600">
              {errors.courseEnrolled.message}
            </small>
          ) : null}
        </label>

        <label className="space-y-2 sm:col-span-2">
          <span className="text-sm font-medium text-slate-700">Address</span>
          <textarea
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            placeholder="Current residential address"
            rows={3}
            {...register("address", {
              required: "Address is required.",
              minLength: {
                value: 10,
                message: "Address must be at least 10 characters long.",
              },
            })}
          />
          {errors.address ? (
            <small className="text-sm text-rose-600">{errors.address.message}</small>
          ) : null}
        </label>

        <label className="space-y-2 sm:col-span-2">
          <span className="text-sm font-medium text-slate-700">Password</span>
          <input
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            type="password"
            placeholder="Use 8+ characters with mixed strength"
            {...register("password", {
              required: "Password is required.",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters long.",
              },
              pattern: {
                value: passwordPattern,
                message:
                  "Use 8+ characters with uppercase, lowercase, number, and special character.",
              },
            })}
          />
          {errors.password ? (
            <small className="text-sm text-rose-600">{errors.password.message}</small>
          ) : null}
        </label>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          className="inline-flex min-h-12 items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Saving..."
            : mode === "edit"
              ? "Save Changes"
              : "Register Student"}
        </button>

        {mode === "edit" && onCancel ? (
          <button
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
};

export default StudentForm;
