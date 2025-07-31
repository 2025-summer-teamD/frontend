import React from 'react';

// 스크롤 숨김 컨테이너 컴포넌트
const ScrollContainer = React.forwardRef(({ children, className = "", ...props }, ref) => {
  return (
    <>
      <div 
        ref={ref}
        className={`flex gap-6 overflow-x-auto overflow-y-visible w-full max-w-full px-4 md:px-8 py-6 justify-center ${className}`}
        style={{
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none', 
          WebkitOverflowScrolling: 'touch'
        }}
        {...props}
      >
        {children}
      </div>
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
});

ScrollContainer.displayName = 'ScrollContainer';

export default ScrollContainer; 