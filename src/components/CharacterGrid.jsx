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
  onDelete, 
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
      className="group relative aspect-[3/4] bg-gray-700 rounded-2xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/30"
    >
      <img
        src={getSafeImageUrl(character.image)}
        alt={character.name}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        onError={(e) => {
          e.target.src = '/api/uploads/default-character.svg';
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
        <h3 className="font-bold truncate">{character.name}</h3>
        <p className="text-xs text-gray-300 truncate">{character.introduction || character.description}</p>
        <div className="flex justify-between items-center mt-2 text-xs">
          <div className="flex items-center gap-1">
            <span>👁️ {character.uses_count || character.usesCount || character.messageCount || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={e => {
                e.stopPropagation();
                onLikeToggle(characterId, !isLiked);
              }}
              className="flex items-center focus:outline-none"
              aria-label="좋아요 토글"
            >
              {isLiked ? (
                <span className="text-red-500">❤️</span>
              ) : (
                <OutlineHeart className="w-4 h-4 text-gray-400 hover:text-red-500 transition-colors" />
              )}
            </button>
            <span className="text-xs text-gray-300">{character.likes || 0}</span>
          </div>
        </div>
        {/* 수정/삭제 버튼 */}
        {showEditButtons && (
          <div className="flex gap-2 mt-2">
            {isMine && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  onEdit(character);
                }}
                className="p-1 rounded bg-blue-500 bg-opacity-20 border border-blue-400 border-opacity-30 text-blue-300 hover:bg-blue-500 hover:bg-opacity-40 hover:text-white transition-all duration-200"
                title="캐릭터 수정"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
            )}
            
          </div>
        )}
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
  onDelete,
  onSelect,
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
      {characters.map(character => {
        const characterId = character.character_id || character.id;
        const isMine = character.creator === myId;
        const isLiked = likedIds.includes(characterId);
        const showEditButtons = tab === 'created'; // 내 캐릭터일 때만 수정/삭제 버튼 표시

        return (
          <CharacterCard
            key={characterId}
            character={character}
            isMine={isMine}
            isLiked={isLiked}
            onLikeToggle={onLikeToggle}
            onEdit={onEdit}
            onDelete={onDelete}
            onSelect={onSelect}
            showEditButtons={showEditButtons}
          />
        );
      })}
    </div>
  );
} 