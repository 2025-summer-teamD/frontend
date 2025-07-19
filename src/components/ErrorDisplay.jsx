import React from 'react';

/**
 * 에러 표시 컴포넌트
 * 
 * 사용 위치:
 * - CharacterList.jsx: 캐릭터 목록 로드 실패 시
 * - Communities.jsx: 커뮤니티 캐릭터 로드 실패 시
 * - 기타 모든 에러 상태에서 사용
 * 
 * 기능:
 * - 에러 메시지 표시
 * - 재시도 버튼 제공
 * - 일관된 에러 UI 제공
 * - 전체 화면 중앙 정렬
 * - 커스터마이징 가능한 재시도 핸들러
 * 
 * @param {string} error - 에러 메시지
 * @param {function} onRetry - 재시도 핸들러 (기본값: window.location.reload)
 */
const ErrorDisplay = ({ error, onRetry }) => {
  return (
    <div className="bg-gray-800 text-white min-h-screen font-sans flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-400">{error}</p>
        <button
          onClick={onRetry || (() => window.location.reload())}
          className="mt-4 px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
};

export default ErrorDisplay; 