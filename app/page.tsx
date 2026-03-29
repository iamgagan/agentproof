// app/page.tsx
import Footer from '@/components/Footer';
import Scanner from '@/components/Scanner';
import HeroSection from '@/components/HeroSection';
import HomeSections from '@/components/HomeSections';

export default function HomePage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <HeroSection />
      <main style={{ flex: 1 }}>
        <HomeSections />
      </main>
      <Footer />
    </div>
  );
}
