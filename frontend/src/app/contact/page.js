import ScrollStage from '@/components/ScrollStage/ScrollStage';
import Clients from '@/components/Clients/Clients';
import Services from '@/components/Services/Services';
import Projects from '@/components/Projects/Projects';
import Testimonials from '@/components/Testimonials/Testimonials';
import Contact from '@/components/Contact/Contact';
import Footer from '@/components/Footer/Footer';

export default function ContactPage() {
  return (
    <main>
      <ScrollStage initialAtEnd={false} initialPath="/contact" />
      <Clients />
      <Services initialAtStart={false} />
      <Projects initialAtStart={false} />
      <Testimonials />
      <Contact initialAtStart={true} />
      <Footer />
    </main>
  );
}

