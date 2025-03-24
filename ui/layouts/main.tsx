import Nav from '@/app/components/shared/Nav/Nav';
import React from 'react';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Nav />
      <div className="max-w-screen-xl mx-auto">{children}</div>
    </div>
  );
}
