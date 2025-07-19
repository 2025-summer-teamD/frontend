import React from 'react';
import { getSafeImageUrl } from '../utils/imageUtils';

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
        const isMine = character.creator === myId;
        const isLiked = likedIds.includes(character.id);

        return (
          <div
            key={character.id}
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
              <p className="text-xs text-gray-300 truncate">{character.description}</p>
              <div className="flex justify-between items-center mt-2 text-xs">
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <span>{character.messageCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onLikeToggle(character.id, !isLiked);
                    }}
                    className="flex items-center focus:outline-none"
                    aria-label="좋아요 토글"
                  >
                    {isLiked ? (
                      <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-gray-300 group-hover:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    )}
                  </button>
                  <span>{character.likes}</span>
                </div>
              </div>
              {/* 수정/삭제 버튼: 내 캐릭터 탭+내꺼, 찜한 캐릭터 탭은 삭제만 */}
              <div className="flex gap-2 mt-2">
                {tab === 'my' && isMine && (
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
                {(tab === 'my' && isMine) || tab === 'liked' ? (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onDelete(character);
                    }}
                    className="p-1 rounded bg-red-500 bg-opacity-20 border border-red-400 border-opacity-30 text-red-300 hover:bg-red-500 hover:bg-opacity-40 hover:text-white transition-all duration-200"
                    title="캐릭터 삭제"
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
                ) : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
} 