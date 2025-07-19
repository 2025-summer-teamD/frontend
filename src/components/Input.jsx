import React from 'react';

/**
 * 재사용 가능한 입력 필드 컴포넌트
 * 
 * 사용 위치:
 * - CreateCharacter.jsx: 캐릭터 이름, 말투, 성격, 태그 입력 필드
 * - CharacterSearchBar.jsx: 캐릭터 검색 입력 필드
 * - 기타 모든 폼에서 사용 가능
 * 
 * 기능:
 * - 라벨과 입력 필드 결합
 * - 일관된 스타일링 (배경색, 테두리, 포커스 효과)
 * - 다양한 입력 타입 지원
 * - 플레이스홀더 텍스트 지원
 * - 접근성 고려 (라벨 연결)
 * 
 * @param {string} label - 입력 필드 라벨 (선택사항)
 * @param {string} value - 입력 값
 * @param {function} onChange - 값 변경 이벤트 핸들러
 * @param {string} placeholder - 플레이스홀더 텍스트 (기본값: '')
 * @param {string} type - 입력 타입 (기본값: 'text')
 * @param {string} className - 추가 CSS 클래스 (기본값: '')
 */
const Input = ({ 
  label, 
  value, 
  onChange, 
  placeholder = '', 
  type = 'text',
  className = '',
  ...props 
}) => {
  return (
    <div>
      {label && (
        <label className="block text-white text-sm font-medium mb-2">{label}</label>
      )}
      <input 
        type={type}
        value={value} 
        onChange={onChange} 
        placeholder={placeholder}
        className={`w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 ${className}`}
        {...props}
      />
    </div>
  );
};

export default Input; 