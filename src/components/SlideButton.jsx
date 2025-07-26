import React from 'react';

// 슬라이드 화살표 버튼 컴포넌트
const SlideButton = ({ direction, onClick, disabled, ariaLabel }) => {
  const isLeft = direction === 'left';
  const positionClass = isLeft ? 'left-0' : 'right-0';
  
  return (
    <button
      className={`absolute ${positionClass} top-1/2 -translate-y-1/2 z-10 bg-black/60 glass border-2 border-cyan-700 text-cyan-200 hover:text-fuchsia-400 rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed`}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d={isLeft ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
      </svg>
    </button>
  );
};

export default SlideButton; 