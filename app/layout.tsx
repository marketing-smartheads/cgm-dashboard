import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dentadmin · AI Performance Dashboard',
  description: 'Prototype performance dashboard for Dentadmin',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="nl"><body>{children}</body></html>;
}
