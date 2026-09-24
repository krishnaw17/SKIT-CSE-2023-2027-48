import '@/styles/globals.css';
import { QueryProvider } from '@/providers/QueryProvider';
import { AppRouter } from '@/router';

export default function App() {
  return (
    <QueryProvider>
      <AppRouter />
    </QueryProvider>
  );
}
