import React from 'react';

/**
 * 페이지 레이아웃을 위한 공통 컴포넌트
 * 
 * 사용 위치:
 * - CharacterList.jsx: 내 캐릭터 목록 페이지
 * - Communities.jsx: 캐릭터 커뮤니티 페이지  
 * - CreateCharacter.jsx: 캐릭터 생성 페이지
 * 
 * 기능:
 * - 페이지 전체 레이아웃 제공 (배경색, 최대 너비, 패딩)
 * - 페이지 제목과 부제목 표시
 * - 일관된 페이지 구조 제공
 * 
 * @param {React.ReactNode} children - 페이지 내용
 * @param {string} title - 페이지 제목 (선택사항)
 * @param {string} subtitle - 페이지 부제목 (선택사항)
 * @param {string} className - 추가 CSS 클래스 (기본값: "bg-gray-800 text-white min-h-screen font-sans")
 */
const PageLayout = ({ 
  children, 
  title, 
  subtitle, 
  className = "relative min-h-screen font-mono cyberpunk-bg text-cyan-100" 
}) => {
  return (
    <div className={className} style={{
      background: 'radial-gradient(circle at 30% 10%, #1a1a2e 0%, #23234d 60%, #0f0f23 100%)',
      minHeight: '100vh',
      overflow: 'hidden',
      boxShadow: '0 0 80px 10px #0ff, 0 0 160px 40px #f0f',
      position: 'relative',
    }}>
      {/* 네온 격자 배경 */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        opacity: 0.22,
        backgroundImage: `linear-gradient(90deg, rgba(0,255,255,0.18) 1px, transparent 1px), linear-gradient(180deg, rgba(255,0,255,0.12) 1px, transparent 1px)`,
        backgroundSize: '80px 80px',
        pointerEvents: 'none',
      }} />
      {/* 스캔라인 효과 */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 1,
        background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,255,255,0.07) 4px, transparent 6px)',
        pointerEvents: 'none',
      }} />
      {/* 네온 박스 그림자 네 군데 (움직임 추가) */}
      <div style={{
        position: 'absolute',
        width: '160px',
        height: '160px',
        left: '40px',
        top: '60px',
        border: '2px solid #0ff',
        borderRadius: '18px',
        boxShadow: '0 0 80px 20px #0ff',
        opacity: 0.45,
        zIndex: 2,
        animation: 'moveBox1 8s ease-in-out infinite alternate',
      }} />
      <div style={{
        position: 'absolute',
        width: '120px',
        height: '120px',
        right: '60px',
        top: '80px',
        border: '2px solid #0ff',
        borderRadius: '18px',
        boxShadow: '0 0 60px 16px #0ff',
        opacity: 0.35,
        zIndex: 2,
        animation: 'moveBox2 10s ease-in-out infinite alternate',
      }} />
      <div style={{
        position: 'absolute',
        width: '180px',
        height: '180px',
        left: '80px',
        bottom: '80px',
        border: '2px solid #f0f',
        borderRadius: '18px',
        boxShadow: '0 0 100px 24px #f0f',
        opacity: 0.32,
        zIndex: 2,
        animation: 'moveBox3 12s ease-in-out infinite alternate',
      }} />
      <div style={{
        position: 'absolute',
        width: '140px',
        height: '140px',
        right: '100px',
        bottom: '100px',
        border: '2px solid #f0f',
        borderRadius: '18px',
        boxShadow: '0 0 80px 18px #f0f',
        opacity: 0.28,
        zIndex: 2,
        animation: 'moveBox4 9s ease-in-out infinite alternate',
      }} />
      {/* keyframes는 index.css에 추가 필요 */}
      <main className="relative z-10 max-w-screen-xl mx-auto px-6 py-8">
        {/* Header */}
        {title && (
          <header className="text-center mb-8">
            <h1 className="text-cyan-200 font-extrabold md:text-[2rem] text-center drop-shadow-[0_0_8px_#0ff,0_0_16px_#f0f] tracking-widest neon-glow">{title}</h1>
            {subtitle && (
              <p className="text-[1.1rem] text-purple-300 drop-shadow-[0_0_6px_#f0f] neon-glow2">{subtitle}</p>
            )}
          </header>
        )}
        {children}
      </main>
    </div>
  );
};

export default PageLayout; 