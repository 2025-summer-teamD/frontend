import React from 'react';

// 섹션 헤더 컴포넌트
const SectionHeader = ({ title, subtitle, children }) => {
  return (
    <section id="characters" className="py-8 md:py-16 px-4 md:px-8">
      <h2 className="section-title font-bold text-center mb-4 md:mb-6">
        {title}
      </h2>
      {subtitle && (
        <p className="text-lg md:text-xl lg:text-2xl xl:text-[24px] text-center font-bold mb-16 md:mb-20 leading-relaxed text-cyan-100" style={{textShadow:'0 0 4px #0080ff, 0 0 8px #0080ff, 0 0 12px #0080ff'}}>
          {subtitle}
        </p>
      )}
      {children}
    </section>
  );
};

export default SectionHeader; 