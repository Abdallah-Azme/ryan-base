import type { Metadata } from 'next';
import { Alexandria } from 'next/font/google';
import Script from 'next/script';
import Providers from './providers';
import './globals.css';
import MetaPixelTracker from '@/components/MetaPixelTracker';

const alexandria = Alexandria({ subsets: ['arabic', 'latin'], weight: ['300','400','500','600','700'] });

export const metadata: Metadata = {
  title: 'Raiyansoft App',
  description: 'Raiyansoft App',
};

// Disable static prerendering — all pages depend on client-side providers (i18n, auth)
export const dynamic = 'force-dynamic';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className={alexandria.className}>
        <Providers>
          <MetaPixelTracker />
          {children}
        </Providers>
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '4244544699119323');
            fbq('track', 'PageView');
          `}
        </Script>
      </body>
    </html>
  );
}
