import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Heart as OutlineHeart } from 'lucide-react';
import { getSafeImageUrl } from '../utils/imageUtils';

// 재사용 가능한 컴포넌트들
const CharacterInfoSection = ({ character }) => (
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
      {character.prompt?.tag && (
        <div className="pb-6 border-b border-gray-700">
          <div className="text-gray-400 text-sm mb-3">태그</div>
          <div className="flex flex-wrap gap-2">
            {character.prompt.tag.split(',').map((tag, idx) => (
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

CharacterInfoSection.propTypes = {
  character: PropTypes.shape({
    prompt: PropTypes.shape({
      personality: PropTypes.string,
      tone: PropTypes.string,
      tag: PropTypes.string,
    }),
    aliases: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
};

const StatsSection = ({ stats, isMyCharacter }) => (
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
          <div className="text-3xl font-bold text-white mb-1">{stats.intimacy}</div>
          <div className="text-gray-400 text-sm">친밀도</div>
        </div>
      </>
    ) : (
      <>
        <div className="text-center flex-1">
          <div className="text-3xl font-bold text-white mb-1">{stats.uses_count || 0}</div>
          <div className="text-gray-400 text-sm">조회수</div>
        </div>
        <div className="text-center flex-1">
          <div className="text-3xl font-bold text-white mb-1">{stats.likes || 0}</div>
          <div className="text-gray-400 text-sm">좋아요</div>
        </div>
      </>
    )}
  </div>
);

StatsSection.propTypes = {
  stats: PropTypes.shape({
    intimacy: PropTypes.number,
    uses_count: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    likes: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  isMyCharacter: PropTypes.bool.isRequired,
};

const CharacterProfile = ({ character, liked, origin, onClose, onLikeToggle }) => {
  const isMyCharacter = origin === 'my';
  const navigate = useNavigate();

  const toggleLike = () => {
    const characterId = character.character_id || character.id;
    onLikeToggle(characterId, !liked, origin);
  };

  const handleStartChat = () => {
    navigate('/chatMate', { state: { character } });
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 p-5">
      <div className="bg-gray-800 rounded-3xl p-8 w-160 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* 프로필 헤더 */}
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
            <p className="text-gray-400 text-sm mb-3">By. {character.creator_name || character.clerkId || character.user_id || character.clerkID}</p>
            <p className="text-gray-300 text-sm">{character.introduction || character.description}</p>
          </div>
          <button
            onClick={toggleLike}
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
        </div>

        {/* 통계 섹션 */}
        <StatsSection stats={character} isMyCharacter={isMyCharacter} />

        {/* 캐릭터 정보 섹션 */}
        <CharacterInfoSection character={character} />

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
  character: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    character_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    description: PropTypes.string,
    introduction: PropTypes.string,
    author: PropTypes.string,
    image: PropTypes.string,
    image_url: PropTypes.string,
    intimacy: PropTypes.number,
    messageCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    likes: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    uses_count: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    chats: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    creater: PropTypes.string,
    creator_name: PropTypes.string,
    clerkId: PropTypes.string,
    clerkID: PropTypes.string,
    user_id: PropTypes.string,
    aliases: PropTypes.arrayOf(PropTypes.string),
    prompt: PropTypes.shape({
      personality: PropTypes.string,
      tone: PropTypes.string,
      tag: PropTypes.string,
    }),
  }).isRequired,
  liked: PropTypes.bool.isRequired,
  origin: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onLikeToggle: PropTypes.func.isRequired
};

export default CharacterProfile;
