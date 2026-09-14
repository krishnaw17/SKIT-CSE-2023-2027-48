import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BookOpen, ArrowLeft, Loader2, Mail } from 'lucide-react';
import { useForgotPassword } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const schema = z.object({ email: z.string().email('Enter a valid email') });
type Form = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const { mutate, isPending, isSuccess } = useForgotPassword();
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = (data: Form) => mutate(data.email);

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 mb-8">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-white" />
          </div>
          <span className="font-heading font-bold text-lg text-ink">RDIS</span>
        </Link>

        {isSuccess ? (
          <div className="text-center space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <Mail className="h-7 w-7 text-primary" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-ink">Check your email</h2>
            <p className="text-ink-muted text-sm leading-relaxed">
              If an account exists for <strong>{getValues('email')}</strong>, we've sent a
              password reset link. Check your inbox and spam folder.
            </p>
            <Link
              to="/auth/login"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-700 transition-colors mt-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="font-heading text-2xl font-bold text-ink mb-1">Forgot password?</h2>
              <p className="text-ink-muted text-sm">
                Enter your email and we'll send you a reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <label htmlFor="fp-email" className="block text-sm font-medium text-ink">
                  Email address
                </label>
                <input
                  id="fp-email"
                  type="email"
                  autoFocus
                  placeholder="you@xyzschool.edu"
                  className={cn('input-base', errors.email && 'border-danger')}
                  {...register('email')}
                />
                {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isPending}
                id="forgot-password-btn"
                className="w-full h-10 flex items-center justify-center gap-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-60 focus-ring"
              >
                {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : 'Send reset link'}
              </button>
            </form>

            <div className="mt-5 text-center">
              <Link
                to="/auth/login"
                className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
