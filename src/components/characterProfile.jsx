import React from 'react';
import { Link } from 'react-router-dom';

const CharacterProfile = ({ character, onClose, origin }) => {
  const isMyCharacter = origin === 'my';

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 p-5">
      <div className="bg-gray-800 rounded-3xl p-8 w-160 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* 프로필 헤더 */}
        <div className="flex items-center mb-8">
        <div className="w-20 h-20 bg-gray-300 rounded-full border-4 border-blue-500  mr-5 overflow-hidden">
            {character.image && (
              <img src={character.image} alt={character.name} className="w-full h-full object-cover" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white mb-1">{character.name}</h1>
            <p className="text-gray-400 text-sm mb-3">By. {character.creater}</p>
            <p className="text-gray-300 text-sm">{character.description}</p>
          </div>
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
                <div className="text-3xl font-bold text-white mb-1">7</div>
                <div className="text-gray-400 text-sm">공유</div>
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
                <div className="pb-6 border-b border-gray-700">
                  <div className="text-gray-400 text-sm mb-3">태그</div>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-xs">
                      #캐릭터 id
                    </span>
                    <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-xs">
                      #만든 이
                    </span>
                  </div>
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
            <div className="text-gray-400 text-sm">대화</div>
          </div>
          <div className="text-center flex-1">
            <div className="text-3xl font-bold text-white mb-1">{character.shares || 0}</div>
            <div className="text-gray-400 text-sm">공유</div>
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
            <div className="pb-6 border-b border-gray-700">
              <div className="text-gray-400 text-sm mb-3">태그</div>
                <div className="flex flex-wrap gap-2">
                <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-xs">
                  #{character.id}번째로 생성된 캐릭터
                </span>
                <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-xs">
                  #{character.creater}
                </span>
                </div>
              </div>
            </div>
            </div>
          </>
        )}
        <div className="flex gap-x-2">
        <Link to="/chatMate" onClick={() => handleStartChat(character.name)} className="flex-1 flex justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 rounded-2xl transition-colors duration-200 text-lg">
            <button
            className=""
            >
                대화하기
            </button>
            </Link>

            <button
             onClick={onClose}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 rounded-2xl transition-colors duration-200 text-lg"
                >
                닫기
            </button>
            </div>
      </div>
    </div>
  );
};

export default CharacterProfile;
