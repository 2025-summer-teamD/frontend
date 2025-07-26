import React from 'react';

// 로딩 오버레이 컴포넌트
const LoadingOverlay = ({ isVisible, message = "로딩 중..." }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-black/80 glass border-2 border-cyan-700 rounded-2xl p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-4"></div>
        <p className="text-cyan-200 font-bold">{message}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay; 