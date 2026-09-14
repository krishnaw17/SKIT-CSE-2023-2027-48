import { useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BookOpen, Loader2, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useResetPassword } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const schema = z
  .object({
    password: z
      .string()
      .min(8)
      .regex(/[A-Z]/)
      .regex(/[0-9]/)
      .regex(/[^A-Za-z0-9]/),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
type Form = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const { mutate, isPending, error } = useResetPassword();
  const [show, setShow] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  if (!token) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <p className="text-ink font-medium">Invalid reset link.</p>
          <Link to="/auth/forgot-password" className="text-primary text-sm hover:underline">
            Request a new one
          </Link>
        </div>
      </div>
    );
  }

  const apiError = error
    ? ((error as { response?: { data?: { error?: { message?: string } } } })
        .response?.data?.error?.message ?? 'Reset failed. The link may have expired.')
    : null;

  const onSubmit = (data: Form) => mutate({ ...data, token });

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 mb-8">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-white" />
          </div>
          <span className="font-heading font-bold text-lg text-ink">RDIS</span>
        </Link>

        <div className="mb-6">
          <h2 className="font-heading text-2xl font-bold text-ink mb-1">Set new password</h2>
          <p className="text-ink-muted text-sm">Choose a strong password for your account.</p>
        </div>

        {apiError && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm" role="alert">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <label htmlFor="new-password" className="block text-sm font-medium text-ink">
              New password
            </label>
            <div className="relative">
              <input
                id="new-password"
                type={show ? 'text' : 'password'}
                placeholder="Create a strong password"
                className={cn('input-base pr-10', errors.password && 'border-danger')}
                {...register('password')}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-light hover:text-ink-muted"
                onClick={() => setShow((v) => !v)}
                aria-label="Toggle"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-danger">Must be 8+ chars with uppercase, number & symbol</p>}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirm-password" className="block text-sm font-medium text-ink">
              Confirm new password
            </label>
            <input
              id="confirm-password"
              type="password"
              placeholder="Repeat your password"
              className={cn('input-base', errors.confirmPassword && 'border-danger')}
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-danger">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            id="reset-password-btn"
            className="w-full h-10 flex items-center justify-center gap-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-60 focus-ring"
          >
            {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Resetting…</> : 'Reset password'}
          </button>
        </form>
      </div>
    </div>
  );
}
