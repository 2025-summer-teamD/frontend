import React from 'react';
import { Search } from 'lucide-react';

export default function CharacterSearchBar({ value, onChange }) {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="text-gray-400" />
      </div>
      <input
        type="text"
        placeholder="캐릭터 이름 또는 설명으로 검색..."
        className="w-full bg-gray-700 text-white placeholder-gray-400 border border-transparent rounded-full py-3 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
        value={value}
        onChange={onChange}
      />
      {value && (
        <button
          onClick={() => onChange({ target: { value: '' } })}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
          aria-label="검색어 지우기"
        >
          <svg className="w-5 h-5 text-gray-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
} 