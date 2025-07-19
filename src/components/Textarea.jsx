import React from 'react';

/**
 * 재사용 가능한 텍스트 영역 컴포넌트
 * 
 * 사용 위치:
 * - CreateCharacter.jsx: 캐릭터 추가 설명 입력 필드
 * - 기타 긴 텍스트 입력이 필요한 모든 폼
 * 
 * 기능:
 * - 라벨과 텍스트 영역 결합
 * - 일관된 스타일링 (배경색, 테두리, 포커스 효과)
 * - 크기 조절 비활성화 (resize-none)
 * - 다양한 행 수 지원
 * - 플레이스홀더 텍스트 지원
 * - 접근성 고려 (라벨 연결)
 * 
 * @param {string} label - 텍스트 영역 라벨 (선택사항)
 * @param {string} value - 입력 값
 * @param {function} onChange - 값 변경 이벤트 핸들러
 * @param {string} placeholder - 플레이스홀더 텍스트 (기본값: '')
 * @param {number} rows - 행 수 (기본값: 4)
 * @param {string} className - 추가 CSS 클래스 (기본값: '')
 */
const Textarea = ({ 
  label, 
  value, 
  onChange, 
  placeholder = '', 
  rows = 4,
  className = '',
  ...props 
}) => {
  return (
    <div>
      {label && (
        <label className="block text-white text-sm font-medium mb-2">{label}</label>
      )}
      <textarea 
        value={value} 
        onChange={onChange} 
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:border-indigo-500 ${className}`}
        {...props}
      />
    </div>
  );
};

export default Textarea; 