import React from 'react';
import { getSafeImageUrl } from '../utils/imageUtils';
import { Heart as OutlineHeart } from 'lucide-react';
import PropTypes from 'prop-types';

// 재사용 가능한 캐릭터 카드 컴포넌트
export const CharacterCard = ({ 
  character, 
  isMine, 
  isLiked, 
  onLikeToggle, 
  onEdit, 
  onSelect,
  showEditButtons = false 
}) => {
  const characterId = character.id;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(character)}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onSelect(character)}
      className="w-56 h-72 neon-card flex flex-col items-center justify-start cursor-pointer transition-transform duration-300 hover:scale-105"
    >
      <div className="w-32 h-32 bg-gray-700 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
        <img
          src={character.imageUrl || getSafeImageUrl(character.image)}
          alt={character.name}
          className="w-full h-full object-cover rounded-lg"
          onError={e => { e.target.src = '/api/image/default-character.svg'; }}
        />
      </div>
      <div className="neon-text text-lg font-bold mb-1">{character.name}</div>
      <div className="text-xs text-[#ffe066] font-bold mb-1">EXP: {character.exp || 0}</div>
      <div className="flex flex-row items-center gap-2 text-xs font-bold mt-auto">
        <div className="border border-[#00f0ff] bg-white/10 px-2 py-1 text-[#00f0ff] min-w-[64px] text-center shadow-neon">
          VIEWS: {character.views || character.usesCount || character.messageCount || 0}
        </div>
        <div className="border border-[#ff00c8] bg-white/10 px-2 py-1 text-[#ff00c8] min-w-[64px] text-center shadow-neon">
          LIKES: {character.likes || 0}
        </div>
      </div>
    </div>
  );
};

CharacterCard.propTypes = {
  character: PropTypes.object.isRequired,
  isMine: PropTypes.bool,
  isLiked: PropTypes.bool,
  onLikeToggle: PropTypes.func.isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onSelect: PropTypes.func.isRequired,
  showEditButtons: PropTypes.bool,
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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-8 justify-items-start">
      {characters.map(character => {
        const characterId = character.characterId || character.id;
        const isMine = character.creator === myId;
        const isLiked = likedIds.includes(characterId);
        const showEditButtons = tab === 'created';

        return (
          <CharacterCard
            key={characterId}
            character={character}
            isMine={isMine}
            isLiked={isLiked}
            onLikeToggle={onLikeToggle}
            onEdit={onEdit}
            onSelect={onSelect}
            showEditButtons={showEditButtons}
          />
        );
      })}
    </div>
  );
} 