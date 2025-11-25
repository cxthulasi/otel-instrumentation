import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClientLayout } from '@/components/ClientLayout';

// Initialize Inter font
const inter = Inter({ subsets: ['latin'] });

// Metadata for the app
export const metadata: Metadata = {
  title: 'Coralogix RUM Demo',
  description: 'A demo application for Coralogix RUM and OpenTelemetry',
};

// RUM initialization script
const RumScript = () => {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              if (typeof window !== 'undefined') {
                // Use dynamic import to ensure the code runs only in the browser
                import('@/lib/coralogix').then(({ initCoralogix }) => {
                  console.log('Initializing Coralogix RUM...');
                  initCoralogix();
                  console.log('Coralogix RUM initialized from script tag');
                }).catch(error => {
                  console.error('Error initializing Coralogix RUM:', error);
                });
              }
            })();
          `,
        }}
      />
      <script src="https://cdn.rum-ingress-coralogix.com/coralogix/browser/latest/coralogix-browser-sdk.js" async></script>
    </>
  );
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <RumScript />
      </head>
      <body className={inter.className}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
