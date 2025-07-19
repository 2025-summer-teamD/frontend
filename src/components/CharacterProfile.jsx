import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Heart as OutlineHeart } from 'lucide-react';

const CharacterProfile = ({ character, liked, origin, onClose, onLikeToggle }) => {
  const isMyCharacter = origin === 'my';
  const navigate = useNavigate();

  const toggleLike = () => {
    onLikeToggle(character.id, !liked, origin);
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
            {character.image && (
              <img src={character.image} alt={character.name} className="w-full h-full object-cover" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white mb-1">{character.name}</h1>
            <p className="text-gray-400 text-sm mb-3">By. {character.clerkID}</p>
            <p className="text-gray-300 text-sm">{character.description}</p>
          </div>
          <button
            onClick={toggleLike}
            className="absolute top-0 right-0 focus:outline-none"
            aria-label={liked ? '좋아요 취소' : '좋아요'}
          >
            {liked ? (
              <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2
                  5.42 4.42 3 7.5 3c1.74 0 3.41 0.81
                  4.5 2.09C13.09 3.81 14.76 3 16.5
                  3 19.58 3 22 5.42 22 8.5c0
                  3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            ) : (
              <OutlineHeart className="w-6 h-6 text-gray-400 hover:text-red-500 transition-colors" />
            )}
          </button>
        </div>

        {isMyCharacter ? (
          <>
            {/* 내 캐릭터용 UI */}
            <div className="flex justify-between mb-10">
              <div className="text-center flex-1">
                <div className="text-3xl font-bold text-white mb-1">5</div>
                <div className="text-gray-400 text-sm">대화</div>
              </div>
              <div className="text-center flex-1">
                <div className="text-3xl font-bold text-white mb-1">10</div>
                <div className="text-gray-400 text-sm">좋아요</div>
              </div>
              <div className="text-center flex-1">
                <div className="text-3xl font-bold text-white mb-1">{character.intimacy}</div>
                <div className="text-gray-400 text-sm">친밀도</div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-6">캐릭터 정보</h2>
              <div className="space-y-8">
                <div className="pb-6 border-b border-gray-700">
                  <div className="text-gray-400 text-sm">성격</div>
                </div>
                <div className="pb-6 border-b border-gray-700">
                  <div className="text-gray-400 text-sm">특징</div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* 커뮤니티 캐릭터용 UI */}
            <div className="flex justify-between mb-10">
              <div className="text-center flex-1">
                <div className="text-3xl font-bold text-white mb-1">{character.chats || 0}</div>
                <div className="text-gray-400 text-sm">조회수</div>
              </div>
              <div className="text-center flex-1">
                <div className="text-3xl font-bold text-white mb-1">{character.likes || 0}</div>
                <div className="text-gray-400 text-sm">좋아요</div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-6">캐릭터 정보</h2>
              <div className="space-y-8">
                <div className="pb-6 border-b border-gray-700">
                  <div className="text-gray-400 text-sm">성격</div>
                </div>
                <div className="pb-6 border-b border-gray-700">
                  <div className="text-gray-400 text-sm">특징</div>
                </div>

                {character.aliases && character.aliases.length > 0 && (
                  <div className="pb-6 border-b border-gray-700">
                    <div className="text-gray-400 text-sm mb-3">태그</div>
                    <div className="flex flex-wrap gap-2">
                      {character.aliases.map((alias, idx) => (
                        <span key={idx} className="bg-purple-700 text-white px-3 py-1 rounded-full text-xs">
                          #{alias}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

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
    name: PropTypes.string,
    description: PropTypes.string,
    author: PropTypes.string,
    image: PropTypes.string,
    intimacy: PropTypes.number,
    messageCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    likes: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    chats: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    creater: PropTypes.string,
    aliases: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  liked: PropTypes.bool.isRequired,
  origin: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onLikeToggle: PropTypes.func.isRequired
};

export default CharacterProfile;
