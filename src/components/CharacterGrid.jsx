import React from 'react';
import PropTypes from 'prop-types';
import BaseCard from './BaseCard';

// 재사용 가능한 캐릭터 카드 컴포넌트
export const CharacterCard = ({ 
  character, 
  isMine, 
  isLiked, 
  onLikeToggle, 
  onSelect
}) => {
  const characterId = character.id;

  return (
    <BaseCard
      character={character}
      onClick={() => onSelect(character)}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onSelect(character)}
      className="aspect-[3/4] neon-card"
    >
      <h3 className="font-bold truncate text-cyan-200 drop-shadow-[0_0_4px_#0ff]" style={{fontFamily:'Share Tech Mono, monospace'}}>{character.name}</h3>
      {isMine ? (
        <p className="text-xs text-yellow-300 truncate font-bold" style={{fontFamily:'Share Tech Mono, monospace', textShadow:'0 0 4px #ffff00, 0 0 8px #ffff00'}}>Lv.{character.level || 1}</p>
      ) : (
        <p className="text-xs text-fuchsia-300 truncate drop-shadow-[0_0_2px_#f0f]" style={{fontFamily:'Share Tech Mono, monospace'}}>{character.introduction || character.description}</p>
      )}
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
    </BaseCard>
  );
};

CharacterCard.propTypes = {
  character: PropTypes.object.isRequired,
  isMine: PropTypes.bool,
  isLiked: PropTypes.bool,
  onLikeToggle: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default function CharacterGrid({
  characters,
  myId,
  tab,
  likedIds,
  onLikeToggle,
  onEdit,
  onSelect,
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
      {characters.map(character => {
        const characterId = character.characterId || character.id;
        const isMine = tab === 'created' || character.creator === myId;
        const isLiked = likedIds.includes(characterId);

        return (
          <CharacterCard
            key={characterId}
            character={character}
            isMine={isMine}
            isLiked={isLiked}
            onLikeToggle={onLikeToggle}
            onSelect={onSelect}
          />
        );
      })}
    </div>
  );
} 