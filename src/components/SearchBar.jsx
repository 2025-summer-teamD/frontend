import React from 'react';
import { Search, XCircle } from 'lucide-react';

/**
 * 검색바 컴포넌트
 * 
 * 사용 위치:
 * - CharacterList.jsx: 내 캐릭터 검색
 * - Communities.jsx: 커뮤니티 캐릭터 검색
 * - 기타 모든 검색 기능이 필요한 페이지
 * 
 * 기능:
 * - 검색어 입력 필드
 * - 검색 아이콘 표시
 * - 검색어 지우기 버튼 (검색어가 있을 때만 표시)
 * - 일관된 검색 UI 제공
 * - 커스터마이징 가능한 플레이스홀더
 * 
 * @param {string} searchQuery - 검색어
 * @param {function} setSearchQuery - 검색어 설정 함수
 * @param {string} placeholder - 플레이스홀더 텍스트 (기본값: "캐릭터 이름 또는 설명으로 검색...")
 */
const SearchBar = ({ 
  searchQuery, 
  setSearchQuery, 
  placeholder = "캐릭터 이름 또는 설명으로 검색" 
}) => {
  return (
    <div className="mb-3 top-4 z-10 bg-[#1e2139] py-4">
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={placeholder}
            className="w-full bg-gray-700 text-white placeholder-gray-400 border border-transparent rounded-full py-3 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              aria-label="검색어 지우기"
            >
              <XCircle className="text-gray-400 hover:text-white" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchBar; 