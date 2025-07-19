import React from 'react';

/**
 * 로딩 스피너 컴포넌트
 * 
 * 사용 위치:
 * - CharacterList.jsx: 캐릭터 목록 로딩 시
 * - Communities.jsx: 커뮤니티 캐릭터 로딩 시
 * - 기타 모든 데이터 로딩 상태에서 사용
 * 
 * 기능:
 * - 회전하는 스피너 애니메이션
 * - 커스터마이징 가능한 메시지
 * - 일관된 로딩 UI 제공
 * - 전체 화면 중앙 정렬
 * 
 * @param {string} message - 로딩 메시지 (기본값: "캐릭터 목록을 불러오는 중...")
 */
const LoadingSpinner = ({ message = "캐릭터 목록을 불러오는 중..." }) => {
  return (
    <div className="bg-gray-800 text-white min-h-screen font-sans flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
        <p className="mt-4 text-gray-400">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner; 