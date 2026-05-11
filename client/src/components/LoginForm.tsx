import { useForm } from "react-hook-form";
import type { LoginValues } from "../types/student";

interface LoginFormProps {
  isAuthenticated: boolean;
  isSubmitting: boolean;
  loggedInEmail: string | null;
  onLogin: (values: LoginValues) => Promise<void>;
  onLogout: () => void;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

const LoginForm = ({
  isAuthenticated,
  isSubmitting,
  loggedInEmail,
  onLogin,
  onLogout,
}: LoginFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    defaultValues: {
      email: "admin@example.com",
      password: "Admin@123",
    },
  });

  if (isAuthenticated) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
            Access
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-slate-950">
            Admin Session Active
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Signed in as <span className="font-semibold text-slate-700">{loggedInEmail}</span>.
            Student CRUD actions are now enabled.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
          Default admin login is handled in the frontend only, while student
          records continue to use the required backend CRUD APIs.
        </div>

        <button
          className="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
          onClick={onLogout}
          disabled={isSubmitting}
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onLogin)}>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
          Admin Login
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-slate-950">
          Secure Access
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Use the default admin credentials to access the student registration
          dashboard.
        </p>
      </div>

      <div className="grid gap-5">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <input
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            type="email"
            placeholder="admin@example.com"
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
          <span className="text-sm font-medium text-slate-700">Password</span>
          <input
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            type="password"
            placeholder="Admin@123"
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

      <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
        Default credentials:
        {" "}
        <span className="font-semibold text-slate-800">admin@example.com</span>
        {" / "}
        <span className="font-semibold text-slate-800">Admin@123</span>
      </div>

      <button
        className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Checking..." : "Login as Admin"}
      </button>
    </form>
  );
};

export default LoginForm;
