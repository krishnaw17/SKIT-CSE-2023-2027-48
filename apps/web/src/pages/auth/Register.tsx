import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, BookOpen, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { useRegister } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { gsap } from '@/lib/gsap';

const registerSchema = z
  .object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email'),
    role: z.enum(['STUDENT', 'TEACHER']),
    password: z
      .string()
      .min(8, 'Must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain uppercase letter')
      .regex(/[0-9]/, 'Must contain a number')
      .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterForm = z.infer<typeof registerSchema>;

const PASSWORD_RULES = [
  { label: '8+ characters', test: (p: string) => p.length >= 8 },
  { label: 'Uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Number', test: (p: string) => /[0-9]/.test(p) },
  { label: 'Special character', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export default function RegisterPage() {
  const { mutate: register, isPending, error } = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    register: formRegister,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'STUDENT' },
  });

  const password = watch('password', '');

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.auth-panel', { y: 30, opacity: 0, duration: 0.8, ease: 'power3.out' });
      gsap.from('.auth-field', {
        y: 16,
        opacity: 0,
        duration: 0.5,
        stagger: 0.07,
        ease: 'power3.out',
        delay: 0.2,
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const onSubmit = (data: RegisterForm) => register(data);

  const apiError = error
    ? ((error as { response?: { data?: { error?: { message?: string } } } })
        .response?.data?.error?.message ?? 'Registration failed. Please try again.')
    : null;

  return (
    <div ref={containerRef} className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="auth-panel w-full max-w-lg">
        {/* Logo */}
        <Link to="/" className="auth-field flex items-center gap-2 mb-8">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-white" />
          </div>
          <span className="font-heading font-bold text-lg text-ink">RDIS</span>
        </Link>

        <div className="auth-field mb-6">
          <h2 className="font-heading text-2xl font-bold text-ink mb-1">
            Create your account
          </h2>
          <p className="text-ink-muted text-sm">
            Join Rukmani Devi International School's gamified learning platform.
          </p>
        </div>

        {apiError && (
          <div className="auth-field mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm" role="alert">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Role toggle */}
          <div className="auth-field space-y-1.5">
            <label className="block text-sm font-medium text-ink">I am a</label>
            <div className="grid grid-cols-2 gap-2">
              {(['STUDENT', 'TEACHER'] as const).map((role) => (
                <label
                  key={role}
                  className={cn(
                    'flex items-center justify-center h-10 rounded-lg border cursor-pointer text-sm font-medium transition-all',
                    watch('role') === role
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border bg-white text-ink-muted hover:border-primary/50',
                  )}
                >
                  <input
                    type="radio"
                    value={role}
                    className="sr-only"
                    {...formRegister('role')}
                  />
                  {role === 'STUDENT' ? '🎓 Student' : '👨‍🏫 Teacher'}
                </label>
              ))}
            </div>
          </div>

          {/* Name fields */}
          <div className="auth-field grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="firstName" className="block text-sm font-medium text-ink">
                First name
              </label>
              <input
                id="firstName"
                type="text"
                autoComplete="given-name"
                placeholder="Alex"
                className={cn('input-base', errors.firstName && 'border-danger')}
                {...formRegister('firstName')}
              />
              {errors.firstName && (
                <p className="text-xs text-danger">{errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="lastName" className="block text-sm font-medium text-ink">
                Last name
              </label>
              <input
                id="lastName"
                type="text"
                autoComplete="family-name"
                placeholder="Johnson"
                className={cn('input-base', errors.lastName && 'border-danger')}
                {...formRegister('lastName')}
              />
              {errors.lastName && (
                <p className="text-xs text-danger">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="auth-field space-y-1.5">
            <label htmlFor="reg-email" className="block text-sm font-medium text-ink">
              Email address
            </label>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              placeholder="you@xyzschool.edu"
              className={cn('input-base', errors.email && 'border-danger')}
              {...formRegister('email')}
            />
            {errors.email && (
              <p className="text-xs text-danger">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="auth-field space-y-1.5">
            <label htmlFor="reg-password" className="block text-sm font-medium text-ink">
              Password
            </label>
            <div className="relative">
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Create a strong password"
                className={cn('input-base pr-10', errors.password && 'border-danger')}
                {...formRegister('password')}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-light hover:text-ink-muted transition-colors"
                onClick={() => setShowPassword((v) => !v)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Password strength indicators */}
            {password && (
              <div className="grid grid-cols-2 gap-1.5 mt-2">
                {PASSWORD_RULES.map(({ label, test }) => {
                  const met = test(password);
                  return (
                    <div
                      key={label}
                      className={cn(
                        'flex items-center gap-1.5 text-xs transition-colors',
                        met ? 'text-success' : 'text-ink-light',
                      )}
                    >
                      <CheckCircle2 className={cn('h-3 w-3', met ? 'opacity-100' : 'opacity-30')} />
                      {label}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div className="auth-field space-y-1.5">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-ink">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat your password"
              className={cn('input-base', errors.confirmPassword && 'border-danger')}
              {...formRegister('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-danger">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Submit */}
          <div className="auth-field pt-1">
            <button
              type="submit"
              disabled={isPending}
              id="register-submit-btn"
              className={cn(
                'w-full h-10 flex items-center justify-center gap-2 rounded-lg',
                'bg-primary text-white text-sm font-semibold',
                'hover:bg-primary-700 active:scale-[0.98]',
                'transition-all duration-200',
                'disabled:opacity-60 disabled:cursor-not-allowed',
                'focus-ring',
              )}
            >
              {isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Creating account…</>
              ) : (
                <>Create account <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </div>
        </form>

        <p className="auth-field mt-5 text-center text-sm text-ink-muted">
          Already have an account?{' '}
          <Link to="/auth/login" className="font-medium text-primary hover:text-primary-700 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
