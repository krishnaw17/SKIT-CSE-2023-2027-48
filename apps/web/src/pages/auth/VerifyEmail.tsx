import { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/features/auth/auth.api';

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';

  const { isLoading, isSuccess, isError } = useQuery({
    queryKey: ['verify-email', token],
    queryFn: () => authApi.verifyEmail(token),
    enabled: !!token,
    retry: false,
  });

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="w-full max-w-sm text-center space-y-5">
        {isLoading && (
          <>
            <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto" />
            <p className="text-ink font-medium">Verifying your email…</p>
          </>
        )}
        {isSuccess && (
          <>
            <div className="h-14 w-14 rounded-2xl bg-success/10 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-ink">Email verified!</h2>
            <p className="text-ink-muted text-sm">Your account is now active. You can sign in.</p>
            <Link
              to="/auth/login"
              id="verified-login-btn"
              className="inline-flex items-center justify-center h-10 px-6 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
            >
              Sign in to RDIS
            </Link>
          </>
        )}
        {isError && (
          <>
            <div className="h-14 w-14 rounded-2xl bg-danger/10 flex items-center justify-center mx-auto">
              <XCircle className="h-8 w-8 text-danger" />
            </div>
            <h2 className="font-heading text-xl font-bold text-ink">Verification failed</h2>
            <p className="text-ink-muted text-sm">
              The link may have expired or already been used.
            </p>
            <Link
              to="/auth/register"
              className="text-primary text-sm hover:underline"
            >
              Register again
            </Link>
          </>
        )}
        {!token && (
          <p className="text-ink-muted text-sm">No verification token found.</p>
        )}
      </div>
    </div>
  );
}
