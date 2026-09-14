import { useEffect, useRef } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, BookOpen, ArrowRight, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useLogin, useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { gsap } from '@/lib/gsap';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { isAuthenticated, user } = useAuth();
  const { mutate: login, isPending, error } = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  // GSAP entrance animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.auth-panel', { x: 40, opacity: 0, duration: 0.8, ease: 'power3.out' });
      gsap.from('.auth-field', {
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
        stagger: 0.08,
        delay: 0.2,
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  // Redirect if already logged in
  if (isAuthenticated && user) {
    const routes: Record<string, string> = { ADMIN: '/admin', TEACHER: '/teacher', STUDENT: '/student' };
    return <Navigate to={routes[user.role] ?? '/student'} replace />;
  }

  const onSubmit = (data: LoginForm) => login(data);

  // Extract error message from API error
  const apiError = error
    ? ((error as { response?: { data?: { error?: { message?: string } } } })
        .response?.data?.error?.message ?? 'Login failed. Please try again.')
    : null;

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-surface flex"
      aria-label="Login page"
    >
      {/* Left — Decorative panel */}
      <div className="hidden lg:flex flex-1 bg-primary relative overflow-hidden items-center justify-center p-12">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-white"
              style={{
                width: `${(i + 2) * 120}px`,
                height: `${(i + 2) * 120}px`,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-sm text-white">
          <div className="flex items-center gap-3 mb-10">
            <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="font-heading font-bold text-xl tracking-tight">RDIS</span>
          </div>
          <h1 className="font-heading text-4xl font-bold leading-tight mb-4">
            Learn. Earn. Level Up.
          </h1>
          <p className="text-white/75 text-lg leading-relaxed">
            Rukmani Devi International School's gamified learning platform. Earn XP, unlock badges, and compete on
            the leaderboard — all while mastering your subjects.
          </p>

          {/* Feature list */}
          <ul className="mt-8 space-y-3">
            {[
              '🎯  Earn XP for every activity',
              '🏅  Unlock badges & achievements',
              '📊  Track your progress in real-time',
              '🏆  Compete on class leaderboards',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-white/80 text-sm">
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right — Auth form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div ref={formRef} className="auth-panel w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <span className="font-heading font-bold text-lg text-ink">RDIS</span>
          </div>

          <div className="mb-8 auth-field">
            <h2 className="font-heading text-2xl font-bold text-ink mb-1.5">
              Welcome back
            </h2>
            <p className="text-ink-muted text-sm">
              Sign in to your account to continue learning.
            </p>
          </div>

          {/* Error banner */}
          {apiError && (
            <div
              className="auth-field mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
              role="alert"
            >
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Email */}
            <div className="auth-field space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-ink">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                autoFocus
                placeholder="you@xyzschool.edu"
                className={cn(
                  'input-base',
                  errors.email && 'border-danger focus:ring-danger/20 focus:border-danger',
                )}
                {...register('email')}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && (
                <p id="email-error" className="text-xs text-danger">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="auth-field space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-ink">
                  Password
                </label>
                <Link
                  to="/auth/forgot-password"
                  className="text-xs font-medium text-primary hover:text-primary-700 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={cn(
                    'input-base pr-10',
                    errors.password && 'border-danger focus:ring-danger/20 focus:border-danger',
                  )}
                  {...register('password')}
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-light hover:text-ink-muted transition-colors"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-danger">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <div className="auth-field pt-1">
              <button
                type="submit"
                disabled={isPending}
                id="login-submit-btn"
                className={cn(
                  'w-full h-10 flex items-center justify-center gap-2 rounded-lg',
                  'bg-primary text-white text-sm font-semibold',
                  'hover:bg-primary-700 active:scale-[0.98]',
                  'transition-all duration-200',
                  'disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none',
                  'focus-ring',
                )}
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <p className="auth-field mt-6 text-center text-sm text-ink-muted">
            Don't have an account?{' '}
            <Link
              to="/auth/register"
              className="font-medium text-primary hover:text-primary-700 transition-colors"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
