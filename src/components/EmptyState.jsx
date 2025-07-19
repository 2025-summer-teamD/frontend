import React from 'react';
import { Search } from 'lucide-react';

/**
 * 빈 상태 표시 컴포넌트
 * 
 * 사용 위치:
 * - CharacterList.jsx: 검색 결과가 없을 때
 * - Communities.jsx: 검색 결과가 없을 때
 * - 기타 모든 빈 상태에서 사용
 * 
 * 기능:
 * - 빈 상태 아이콘 표시
 * - 커스터마이징 가능한 제목과 메시지
 * - 일관된 빈 상태 UI 제공
 * - 중앙 정렬된 레이아웃
 * 
 * @param {string} title - 빈 상태 제목 (기본값: "검색 결과가 없습니다")
 * @param {string} message - 빈 상태 메시지 (기본값: "다른 검색어로 다시 시도해보세요.")
 */
const EmptyState = ({ 
  title = "검색 결과가 없습니다", 
  message = "다른 검색어로 다시 시도해보세요." 
}) => {
  return (
    <div className="text-center py-20">
      <Search className="mx-auto h-12 w-12 text-gray-500" />
      <h3 className="mt-2 text-lg font-medium text-white">{title}</h3>
      <p className="mt-1 text-sm text-gray-400">{message}</p>
    </div>
  );
};

export default EmptyState; 