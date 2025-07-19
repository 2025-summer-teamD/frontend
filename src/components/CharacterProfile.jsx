import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Heart as OutlineHeart } from 'lucide-react';
import { getSafeImageUrl } from '../utils/imageUtils';
import { useUser } from '@clerk/clerk-react';

// 재사용 가능한 캐릭터 헤더 컴포넌트
export const CharacterHeader = ({ character, liked, onLikeToggle, showLikeButton = true }) => {
  const characterId = character.character_id || character.id;
  const { user } = useUser(); // username을 가져오기 위해 useUser 추가
  


  const handleLikeToggle = () => {
    if (onLikeToggle) {
      onLikeToggle(characterId, !liked);
    }
  };

  return (
    <div className="relative flex items-center mb-8">
      <div className="w-20 h-20 bg-gray-300 rounded-full border-4 border-white mr-5 overflow-hidden">
        {character.image_url && (
          <img 
            src={getSafeImageUrl(character.image_url)} 
            alt={character.name} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = '/api/uploads/default-character.svg';
            }}
          />
        )}
      </div>
      <div>
        <h1 className="text-2xl font-semibold text-white mb-1">{character.name}</h1>
        <p className="text-gray-400 text-sm mb-3">By. {character.creator_name || '알 수 없음'}</p>
      </div>
      {showLikeButton && (
        <>
          <button
            onClick={handleLikeToggle}
            className="absolute top-0 right-0 focus:outline-none"
            aria-label={liked ? '좋아요 취소' : '좋아요'}
          >
            {liked ? (
              <span className="text-red-500 text-xl">❤️</span>
            ) : (
              <OutlineHeart className="w-6 h-6 text-gray-400 hover:text-red-500 transition-colors" />
            )}
          </button>
          <span className="absolute top-8 right-0 text-sm text-gray-400">{character.likes || 0}</span>
        </>
      )}
    </div>
  );
};

CharacterHeader.propTypes = {
  character: PropTypes.object.isRequired,
  liked: PropTypes.bool,
  onLikeToggle: PropTypes.func,
  showLikeButton: PropTypes.bool,
};

// 재사용 가능한 통계 섹션 컴포넌트
export const CharacterStats = ({ character, isMyCharacter = false }) => (
  <div className="flex justify-between mb-10">
    {isMyCharacter ? (
      <>
        <div className="text-center flex-1">
          <div className="text-3xl font-bold text-white mb-1">5</div>
          <div className="text-gray-400 text-sm">조회수</div>
        </div>
        <div className="text-center flex-1">
          <div className="text-3xl font-bold text-white mb-1">10</div>
          <div className="text-gray-400 text-sm">좋아요</div>
        </div>
        <div className="text-center flex-1">
          <div className="text-3xl font-bold text-white mb-1">{character.intimacy || 0}</div>
          <div className="text-gray-400 text-sm">친밀도</div>
        </div>
      </>
    ) : (
      <>
        <div className="text-center flex-1">
          <div className="text-3xl font-bold text-white mb-1">{character.uses_count || 0}</div>
          <div className="text-gray-400 text-sm">조회수</div>
        </div>
        <div className="text-center flex-1">
          <div className="text-3xl font-bold text-white mb-1">{character.likes || 0}</div>
          <div className="text-gray-400 text-sm">좋아요</div>
        </div>
      </>
    )}
  </div>
);

CharacterStats.propTypes = {
  character: PropTypes.object.isRequired,
  isMyCharacter: PropTypes.bool,
};

// 재사용 가능한 캐릭터 정보 섹션 컴포넌트
export const CharacterInfo = ({ character }) => (
  <div className="mb-8">
    <h2 className="text-xl font-semibold text-white mb-6">캐릭터 정보</h2>
    <div className="space-y-8">
      {character.prompt?.personality && (
        <div className="pb-6 border-b border-gray-700">
          <div className="text-gray-400 text-sm mb-2">성격</div>
          <div className="text-white">{character.prompt.personality}</div>
        </div>
      )}
      {character.prompt?.tone && (
        <div className="pb-6 border-b border-gray-700">
          <div className="text-gray-400 text-sm mb-2">말투</div>
          <div className="text-white">{character.prompt.tone}</div>
        </div>
      )}
      {(character.introduction || character.description) && (
        <div className="pb-6 border-b border-gray-700">
          <div className="text-gray-400 text-sm mb-2">설명</div>
          <div className="text-white">{character.introduction || character.description}</div>
        </div>
      )}
      {character.prompt?.tag && (
        <div className="pb-6 border-b border-gray-700">
          <div className="text-gray-400 text-sm mb-3">태그</div>
          <div className="flex flex-wrap gap-2">
            <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-xs">
              #{character.character_id || character.id || '캐릭터'}번째로 생성된 캐릭터
            </span>
            {character.prompt.tag.split(',').filter(tag => tag.trim()).map((tag, idx) => (
              <span key={`tag-${idx}-${tag.trim()}`} className="bg-purple-700 text-white px-3 py-1 rounded-full text-xs">
                #{tag.trim()}
              </span>
            ))}
          </div>
        </div>
      )}
      {character.aliases && character.aliases.length > 0 && (
        <div className="pb-6 border-b border-gray-700">
          <div className="text-gray-400 text-sm mb-3">추가 태그</div>
          <div className="flex flex-wrap gap-2">
            {character.aliases.map((alias, idx) => (
              <span key={`alias-${idx}-${alias}`} className="bg-purple-700 text-white px-3 py-1 rounded-full text-xs">
                #{alias}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);

CharacterInfo.propTypes = {
  character: PropTypes.shape({
    prompt: PropTypes.shape({
      personality: PropTypes.string,
      tone: PropTypes.string,
      tag: PropTypes.string,
    }),
    aliases: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
};

const CharacterProfile = ({ character, liked, origin, onClose, onLikeToggle }) => {
  const isMyCharacter = origin === 'my';
  const navigate = useNavigate();

  const handleStartChat = () => {
    navigate('/chatMate', { state: { character } });
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 p-5">
      <div className="bg-gray-800 rounded-3xl p-8 w-160 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* 캐릭터 헤더 */}
        <CharacterHeader 
          character={character} 
          liked={liked} 
          onLikeToggle={onLikeToggle}
        />

        {/* 통계 섹션 */}
        <CharacterStats character={character} isMyCharacter={isMyCharacter} />

        {/* 캐릭터 정보 섹션 */}
        <CharacterInfo character={character} />

        <div className="space-y-3">
          <button
            onClick={handleStartChat}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-4 px-6 rounded-2xl transition-all duration-200 text-lg transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03
                8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512
                15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            대화하기
          </button>
          <button
            onClick={onClose}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-2xl transition-colors duration-200"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

CharacterProfile.propTypes = {
  character: PropTypes.object.isRequired,
  liked: PropTypes.bool,
  origin: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onLikeToggle: PropTypes.func,
};

export default CharacterProfile;
