import type { Metadata } from 'next';
import { Poppins, Red_Hat_Mono } from 'next/font/google';
import { QueryProvider } from '@/components/QueryProvider';
import { AuthProvider } from '@/components/auth/AuthProvider';
import './globals.scss';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';

const redHatMono = Red_Hat_Mono({
  variable: '--font-red-hat-mono',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://insidecollegedata.org'),
  title: {
    default: 'Inside College Data — IPEDS-driven stories about US higher ed',
    template: '%s · Inside College Data',
  },
  description:
    "Data stories on US universities — applications, tuition, enrollment, graduation rates and more — sourced directly from IPEDS and written with an AI-assisted editorial workflow.",
  applicationName: 'Inside College Data',
  authors: [{ name: 'Inside College Data Editorial' }],
  keywords: ['IPEDS', 'higher education', 'university data', 'admissions', 'tuition', 'graduation rates', 'data journalism'],
  openGraph: {
    title: 'Inside College Data',
    description: 'IPEDS-driven stories about US higher education.',
    type: 'website',
    siteName: 'Inside College Data',
  },
  twitter: { card: 'summary_large_image', title: 'Inside College Data' },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${redHatMono.variable}`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <Navbar />
          <main>
            <QueryProvider>{children}</QueryProvider>
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
