import React from 'react';
import PropTypes from 'prop-types';
import BaseCard from './BaseCard';
import CharacterInfo from './CharacterInfo';
import CharacterStats from './CharacterStats';

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
      <CharacterInfo character={character} isMine={isMine} showLevel={true} />
      <CharacterStats 
        character={character} 
        isLiked={isLiked} 
        onLikeToggle={onLikeToggle} 
        characterId={characterId} 
      />
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