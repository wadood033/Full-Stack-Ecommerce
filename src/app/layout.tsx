import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Poppins } from 'next/font/google';
import ClientLayout from './ClientLayout';
import ReduxProvider from '@/redux/ReduxProvider';
import StripeProvider from '@/components/StripeProvider'; // ✅ Stripe Provider
import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'Clerk Next.js Quickstart',
  description: 'Generated by create next app',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${poppins.variable} font-sans antialiased`}>
          <ReduxProvider>
            <StripeProvider>
              <ClientLayout>{children}</ClientLayout>
            </StripeProvider>
          </ReduxProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
