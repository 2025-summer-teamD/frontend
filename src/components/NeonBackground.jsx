import React from 'react';

// 네온 배경 컴포넌트
const NeonBackground = ({ children, className = "" }) => {
  return (
    <div 
      className={`relative ${className}`}
      style={{
        background: 'radial-gradient(circle at 30% 10%, #1a1a2e 0%, #23234d 60%, #0f0f23 100%)',
        minHeight: '100vh'
      }}
    >
      {/* 네온 박스 그림자 네 군데 (움직임 추가) */}
      <div style={{
        position: 'absolute',
        width: '160px',
        height: '160px',
        left: '40px',
        top: '60px',
        border: '2px solid #0ff',
        borderRadius: '0px',
        opacity: 0.45,
        zIndex: 2,
        animation: 'moveBox1 8s ease-in-out infinite alternate, neonPulse1 3s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute',
        width: '120px',
        height: '120px',
        right: '60px',
        top: '80px',
        border: '2px solid #0ff',
        borderRadius: '0px',
        opacity: 0.35,
        zIndex: 2,
        animation: 'moveBox2 10s ease-in-out infinite alternate, neonPulse2 4s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute',
        width: '180px',
        height: '180px',
        left: '80px',
        bottom: '80px',
        border: '2px solid #f0f',
        borderRadius: '0px',
        opacity: 0.32,
        zIndex: 2,
        animation: 'moveBox3 12s ease-in-out infinite alternate, neonPulse3 5s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute',
        width: '140px',
        height: '140px',
        right: '100px',
        bottom: '100px',
        border: '2px solid #f0f',
        borderRadius: '0px',
        opacity: 0.28,
        zIndex: 2,
        animation: 'moveBox4 9s ease-in-out infinite alternate, neonPulse4 3.5s ease-in-out infinite',
      }} />
      {children}
    </div>
  );
};

export default NeonBackground; 