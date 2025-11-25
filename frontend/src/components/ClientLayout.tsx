"use client";

import { ReactNode } from 'react';
import { Chakra } from '@/lib/chakra';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CoralogixInitializer } from '@/components/CoralogixInitializer';

interface ClientLayoutProps {
  children: ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <Chakra>
      {/* Initialize Coralogix RUM */}
      <CoralogixInitializer />

      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <main style={{ flex: 1 }}>{children}</main>
        <Footer />
      </div>
    </Chakra>
  );
}
