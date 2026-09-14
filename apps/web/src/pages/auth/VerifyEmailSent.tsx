import { Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function VerifyEmailSent() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="w-full max-w-sm text-center space-y-4">
        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <Mail className="h-7 w-7 text-primary" />
        </div>
        <h2 className="font-heading text-2xl font-bold text-ink">Check your inbox</h2>
        <p className="text-ink-muted text-sm leading-relaxed">
          We've sent a verification link to your email. Click it to activate your account.
          Check your spam folder if you don't see it within a few minutes.
        </p>
        <Link
          to="/auth/login"
          className="inline-flex items-center justify-center h-10 px-6 rounded-lg border border-border text-sm font-medium text-ink hover:bg-surface transition-colors"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
