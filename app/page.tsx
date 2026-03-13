import { Footer } from '@/components/layout/Footer';
import { LandingPage } from '@/components/layout/LandingPage';
import { Navbar } from '@/components/layout/Navbar';

export default function Home() {
  return (
    <main className="min-h-screen w-full">
      <Navbar />
      <LandingPage />
      <Footer />
    </main>
  );
}
