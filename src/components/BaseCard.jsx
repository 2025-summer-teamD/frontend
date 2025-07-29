import React from 'react';
import { getSafeImageUrl } from '../utils/imageUtils';

// 공통 베이스 카드 컴포넌트
const BaseCard = ({ 
  character, 
  onClick,
  onKeyDown,
  className = "",
  children,
  imageClassName = "",
  contentClassName = ""
}) => {
  const baseClasses = "group relative bg-black/40 glass border-2 border-cyan-700 rounded-2xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-[0_0_16px_#0ff,0_0_32px_#f0f] animate-fadeIn";
  const baseStyle = {
    boxShadow: '0 0 8px #0ff, 0 0 16px #f0f',
    border: '2px solid #099',
    backdropFilter: 'blur(8px)',
    fontFamily: 'Share Tech Mono, monospace',
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={onKeyDown}
      className={`${baseClasses} ${className}`}
      style={baseStyle}
      aria-label={`${character.name}와 대화하기`}
    >
      {character.imageUrl && (
        <img 
          src={getSafeImageUrl(character.imageUrl)} 
          alt={character.name} 
          className="w-full h-full object-cover rounded-lg"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      <div className={`absolute bottom-0 left-0 right-0 p-3 text-cyan-100 ${contentClassName}`}>
        {children}
      </div>
    </div>
  );
};

export default BaseCard; 