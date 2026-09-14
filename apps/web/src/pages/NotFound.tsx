import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="text-center space-y-4 max-w-sm">
        <p className="font-number text-8xl font-bold text-primary/20">404</p>
        <h1 className="font-heading text-2xl font-bold text-ink">Page not found</h1>
        <p className="text-ink-muted text-sm">
          The page you're looking for doesn't exist or you don't have permission to access it.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center h-10 px-6 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
