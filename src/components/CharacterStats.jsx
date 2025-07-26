import React from 'react';

// Views/Likes 통계 박스 컴포넌트
const CharacterStats = ({ character, isLiked, onLikeToggle, characterId }) => {
  return (
    <div className="flex justify-between items-center mt-2 text-xs gap-2">
      {/* VIEWS 박스 */}
      <div className="flex-1 bg-white/20 border-2 border-cyan-400 rounded-lg px-2 py-1 text-center">
        <div className="text-cyan-400 font-bold text-[10px] tracking-wider" style={{fontFamily:'Share Tech Mono, monospace'}}>VIEWS</div>
        <div className="text-cyan-200 font-bold text-sm" style={{fontFamily:'Share Tech Mono, monospace'}}>{character.usesCount || character.messageCount || 0}</div>
      </div>
      
      {/* LIKES 박스 */}
      <div className="flex-1 bg-white/20 border-2 border-fuchsia-400 rounded-lg px-2 py-1 text-center">
        <div className="text-fuchsia-400 font-bold text-[10px] tracking-wider" style={{fontFamily:'Share Tech Mono, monospace'}}>LIKES</div>
        <button
          onClick={e => {
            e.stopPropagation();
            onLikeToggle(characterId, !isLiked);
          }}
          className="w-full focus:outline-none"
          aria-label="좋아요 토글"
        >
          <div className={`font-bold text-sm transition-all ${isLiked ? 'text-pink-300' : 'text-fuchsia-200'}`} style={{fontFamily:'Share Tech Mono, monospace'}}>
            {character.likes ?? 0}
          </div>
        </button>
      </div>
    </div>
  );
};

export default CharacterStats; 