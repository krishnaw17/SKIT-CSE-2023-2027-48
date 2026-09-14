import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom';

export default function GlobalError() {
  const error = useRouteError();
  
  let statusCode = 500;
  let title = "Internal Server Error";
  let message = "Something went wrong on our end. Please try again later.";

  if (isRouteErrorResponse(error)) {
    statusCode = error.status;
    title = error.statusText || "Error";
    if (error.status === 404) {
      title = "Page Not Found";
      message = "The page you're looking for doesn't exist or has been moved.";
    } else if (error.status === 401 || error.status === 403) {
      title = "Unauthorized";
      message = "You don't have permission to access this page.";
    } else {
      message = error.data?.message || message;
    }
  } else if (error instanceof Error) {
    // We intentionally don't show the raw error message to users for security/professionalism,
    // but you might want to log it to an error reporting service here.
    console.error(error);
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="text-center space-y-4 max-w-sm">
        <p className="font-number text-8xl font-bold text-primary/20">{statusCode}</p>
        <h1 className="font-heading text-2xl font-bold text-ink">{title}</h1>
        <p className="text-ink-muted text-sm">
          {message}
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center h-10 px-6 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-700 transition-colors mt-4"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
}
