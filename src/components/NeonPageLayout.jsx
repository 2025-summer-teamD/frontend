import React from 'react';
import NeonBackground from './NeonBackground';

export default function NeonPageLayout({ title, subtitle, children }) {
  return (
    <PageLayout className="bg-gradient-to-br from-darkBg via-[#1a1a40] to-[#2d0b4e] min-h-screen flex flex-col items-center justify-center" style={{position:'relative', overflow:'hidden'}}>
      <NeonBackground />
      <div style={{position:'relative', zIndex:1}}>
        <div className="text-center mt-12 mb-8">
          <h1 className="text-3xl font-bold neon-text mb-2">{title}</h1>
          <p className="neon-label">{subtitle}</p>
        </div>
        {children}
      </div>
    </PageLayout>
  );
} 