import React from 'react';

/**
 * 재사용 가능한 버튼 컴포넌트
 * 
 * 사용 위치:
 * - CharacterList.jsx: "캐릭터 생성" 버튼
 * - CreateCharacter.jsx: "캐릭터 만들기" 버튼
 * - 기타 모든 페이지에서 사용 가능
 * 
 * 기능:
 * - 다양한 스타일 변형 (primary, secondary, danger, success)
 * - 다양한 크기 (sm, md, lg)
 * - 전체 너비 옵션
 * - 비활성화 상태 지원
 * - 일관된 버튼 스타일 제공
 * 
 * @param {React.ReactNode} children - 버튼 텍스트
 * @param {function} onClick - 클릭 이벤트 핸들러
 * @param {string} variant - 버튼 스타일 (기본값: 'primary')
 * @param {string} size - 버튼 크기 (기본값: 'md')
 * @param {string} className - 추가 CSS 클래스
 * @param {boolean} disabled - 비활성화 상태 (기본값: false)
 * @param {string} type - 버튼 타입 (기본값: 'button')
 * @param {boolean} fullWidth - 전체 너비 여부 (기본값: false)
 */
const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
  fullWidth = false,
  ...props 
}) => {
  const baseClasses = "font-semibold transition-all rounded-full";
  
  const variants = {
    primary: "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white",
    secondary: "bg-gray-700 text-gray-300 hover:bg-gray-600",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    success: "bg-green-600 hover:bg-green-700 text-white"
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm sm:text-base",
    lg: "px-6 py-3 text-base"
  };
  
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";
  const widthClasses = fullWidth ? "w-full" : "";
  
  return (
    <button
      type={type}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabledClasses} ${widthClasses} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button; 