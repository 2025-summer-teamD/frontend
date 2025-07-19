import React from 'react';

/**
 * 탭 버튼 컴포넌트
 * 
 * 사용 위치:
 * - CharacterList.jsx: "내 캐릭터" / "찜한 캐릭터" 탭
 * - Communities.jsx: "인기순" / "조회수순" 정렬 탭
 * - CreateCharacter.jsx: "나만의 AI 인격체 만들기" / "실제 캐릭터 가져오기" 탭
 * 
 * 기능:
 * - 활성/비활성 상태에 따른 스타일 변경
 * - 클릭 이벤트 처리
 * - 일관된 탭 버튼 스타일 제공
 * 
 * @param {boolean} isActive - 탭 활성 상태
 * @param {function} onClick - 클릭 이벤트 핸들러
 * @param {React.ReactNode} children - 버튼 텍스트
 * @param {string} className - 추가 CSS 클래스 (기본값: "px-4 py-2 text-sm sm:text-base font-semibold rounded-full transition-colors")
 */
const TabButton = ({ 
  isActive, 
  onClick, 
  children, 
  className = "px-4 py-2 text-sm sm:text-base font-semibold rounded-full transition-colors" 
}) => {
  const activeClasses = "bg-indigo-600 text-white shadow-lg";
  const inactiveClasses = "bg-gray-700 text-gray-300 hover:bg-gray-600";
  
  return (
    <button
      className={`${className} ${isActive ? activeClasses : inactiveClasses}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default TabButton; 