import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--background))] via-[hsl(220,20%,12%)] to-[hsl(var(--background))] relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-[hsl(var(--primary))] opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-[hsl(var(--secondary))] opacity-10 rounded-full blur-3xl"></div>
      </div>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}