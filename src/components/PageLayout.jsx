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
  className = "bg-[#1e2139] text-white min-h-screen font-sans" 
}) => {
  return (
    <div className={className}>
      <main className="max-w-screen-xl mx-auto px-6 py-8">
        {/* Header */}
        {title && (
          <header className="text-center mb-8">
            <h1 className="text-white font-bold md:text-[1.5rem] text-center">{title}</h1>
            {subtitle && (
              <p className="text-[1rem] text-gray-400">{subtitle}</p>
            )}
          </header>
        )}
        {children}
      </main>
    </div>
  );
};

export default PageLayout; 