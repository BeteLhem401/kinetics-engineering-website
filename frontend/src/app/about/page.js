import ScrollStage from '@/components/ScrollStage/ScrollStage';
import Clients from '@/components/Clients/Clients';
import Services from '@/components/Services/Services';
import Projects from '@/components/Projects/Projects';
import Testimonials from '@/components/Testimonials/Testimonials';
import Contact from '@/components/Contact/Contact';
import Footer from '@/components/Footer/Footer';

export default function AboutPage() {
  return (
    <main>
      <ScrollStage initialAtEnd={true} initialPath="/about" />
      <Clients />
      <Services initialAtStart={false} />
      <Projects initialAtStart={false} />
      <Testimonials />
      <Contact initialAtStart={false} />
      <Footer />
    </main>
  );
}
