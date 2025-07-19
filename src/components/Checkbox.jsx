import React from 'react';

/**
 * 재사용 가능한 체크박스 컴포넌트
 * 
 * 사용 위치:
 * - CreateCharacter.jsx: "다른 사람에게 공개" 체크박스
 * - 기타 모든 체크박스가 필요한 폼
 * 
 * 기능:
 * - 라벨과 체크박스 결합
 * - 설명 텍스트 지원
 * - 일관된 스타일링 (배경색, 테두리, 체크박스 색상)
 * - 접근성 고려 (라벨 연결)
 * - 커스텀 스타일링 지원
 * 
 * @param {string} label - 체크박스 라벨
 * @param {string} description - 설명 텍스트 (선택사항)
 * @param {boolean} checked - 체크 상태
 * @param {function} onChange - 상태 변경 이벤트 핸들러
 * @param {string} className - 추가 CSS 클래스 (기본값: '')
 */
const Checkbox = ({ 
  label, 
  description, 
  checked, 
  onChange, 
  className = '' 
}) => {
  return (
    <div className={`bg-gray-700/50 rounded-lg p-4 ${className}`}>
      <label className="flex items-start gap-3 cursor-pointer">
        <input 
          type="checkbox" 
          checked={checked} 
          onChange={onChange} 
          className="mt-1 accent-[#413ebc] w-4 h-4" 
        />
        <div>
          <span className="text-white text-sm font-medium">{label}</span>
          {description && (
            <p className="text-gray-400 text-xs mt-1">{description}</p>
          )}
        </div>
      </label>
    </div>
  );
};

export default Checkbox; 