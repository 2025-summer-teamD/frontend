import React from 'react';
import { getSafeImageUrl } from '../utils/imageUtils';
import { Heart as OutlineHeart, Heart as SolidHeart } from 'lucide-react';  
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
      className="group relative aspect-[3/4] neon-card bg-black/40 glass border-2 border-cyan-700 rounded-2xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-[0_0_16px_#0ff,0_0_32px_#f0f] animate-fadeIn"
      style={{
        boxShadow: '0 0 8px #0ff, 0 0 16px #f0f',
        border: '2px solid #099',
        backdropFilter: 'blur(8px)',
        fontFamily: 'Share Tech Mono, monospace',
      }}
    >
      {/* 수정/삭제 버튼 - 상단에 배치 */}
      {showEditButtons && isMine && (
        <>
          {/* 수정 버튼 - 왼쪽 상단 */}
          <button
            onClick={e => {
              e.stopPropagation();
              onEdit(character);
            }}
            className="absolute top-2 left-2 z-10 p-2 rounded bg-black/60 glass border-2 border-cyan-700 text-cyan-200 hover:bg-black/80 hover:border-fuchsia-400 hover:text-fuchsia-200 transition-all duration-200 shadow-[0_0_8px_#0ff,0_0_16px_#f0f] animate-neonPulse"
            title="캐릭터 수정"
            style={{fontFamily:'Share Tech Mono, monospace'}}
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
          {/* 삭제 버튼 - 오른쪽 상단 */}
          <button
            onClick={e => {
              e.stopPropagation();
              if (onDelete) onDelete(character);
            }}
            className="absolute top-2 right-2 z-10 p-2 rounded bg-black/60 glass border-2 border-red-700 text-red-200 hover:bg-black/80 hover:border-red-400 hover:text-red-100 transition-all duration-200 shadow-[0_0_8px_#f00,0_0_16px_#f00] animate-neonPulse"
            title="캐릭터 삭제"
            style={{fontFamily:'Share Tech Mono, monospace'}}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </>
      )}

      <img
        src={getSafeImageUrl(character.imageUrl)}
        alt={character.name}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 opacity-90"
        style={{ filter: 'brightness(1.1) saturate(1.2) drop-shadow(0 0 6px #0ff)' }}
        onError={(e) => {
          e.target.src = '/api/uploads/default-character.svg';
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-3 text-cyan-100">
        <h3 className="font-bold truncate text-cyan-200 drop-shadow-[0_0_4px_#0ff]" style={{fontFamily:'Share Tech Mono, monospace'}}>{character.name}</h3>
        <p className="text-xs text-fuchsia-300 truncate drop-shadow-[0_0_2px_#f0f]" style={{fontFamily:'Share Tech Mono, monospace'}}>{character.introduction}</p>
        {/* 태그 */}
        <div className="flex items-center gap-1 justify-between w-full">
          <span className="text-cyan-300 drop-shadow-[0_0_2px_#0ff]" style={{fontFamily:'Share Tech Mono, monospace'}}>👁️ {character.usesCount || 0}</span>
          <span className="text-cyan-300 drop-shadow-[0_0_2px_#0ff]" style={{fontFamily:'Share Tech Mono, monospace'}}>🛍️ {character.likesCount ?? 0}</span>
        </div>
        <div className="flex items-center gap-1">
          
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
  onDelete,
  onSelect,
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
      {characters.map(character => {
        const characterId = character.characterId || character.id;
        const isMine = character.clerkId === myId;
        const isLiked = likedIds.includes(characterId);
        const showEditButtons = tab === 'created'; // 내 캐릭터일 때만 수정/삭제 버튼 표시

        // 디버깅용 로그 추가
        console.log('Character debug:', {
          characterId,
          characterName: character.name,
          characterClerkId: character.clerkId,
          myId,
          isMine,
          tab,
          character: character
        });

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