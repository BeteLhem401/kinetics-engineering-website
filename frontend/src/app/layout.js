import { Inter, Bricolage_Grotesque, JetBrains_Mono } from 'next/font/google';
import Header from '@/components/Header/Header';
import Intro from '@/components/Intro/Intro';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500'],
  variable: '--font-mono',
});

export const metadata = {
  title: 'KINETICS | Engineering Systems for Smarter Buildings',
  description:
    'Integrated electrical, low current and HVAC engineering systems for public and private sector clients.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${bricolageGrotesque.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(!sessionStorage.getItem('kinetics_intro_seen')){document.documentElement.classList.add('intro-pending');}}catch(e){}`,
          }}
        />
        <noscript>
          <style>{`
            [data-intro-overlay] { display: none !important; }
            [data-nav-mark] { visibility: visible !important; }
            [data-nav-wordmark] { opacity: 1 !important; }
          `}</style>
        </noscript>
      </head>
      <body>
        <Intro />
        <Header />
        {children}
      </body>
    </html>
  );
}
