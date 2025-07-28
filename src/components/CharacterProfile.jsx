import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Heart as OutlineHeart, Heart as SolidHeart } from 'lucide-react';
import { getSafeImageUrl } from '../utils/imageUtils';
import { useAuth } from '@clerk/clerk-react';
import { toggleLike } from '../data/characters';
import { useEnterOrCreateChatRoom } from '../data/chatMessages';

// 재사용 가능한 캐릭터 헤더 컴포넌트
export const CharacterHeader = ({ character, liked, onLikeToggle, showLikeButton = true }) => {
  const characterId = character.id;
  const { userId } = useAuth();
  
  // Determine if character is created by current user
  const isCharacterCreatedByMe = character?.clerkId === userId;

  const handleLikeToggle = () => {
    if (onLikeToggle) {
      onLikeToggle(characterId, !liked);
    }
  };

  return (
    <div className="relative flex items-center mb-8">
      <div className="w-20 h-20 bg-gray-300 rounded-full border-4 border-white mr-5 overflow-hidden">
        {character.imageUrl && (
          <img 
            src={getSafeImageUrl(character.imageUrl)} 
            alt={character.name} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = '/api/uploads/default-character.svg';
            }}
          />
        )}
      </div>
      <div>
        <h1 className="text-2xl font-semibold text-white mb-1">{character?.name || ''}</h1>
        <p className="text-gray-400 text-sm mb-1">By. {character?.creatorName || '알 수 없음'}</p>
        {isCharacterCreatedByMe ? (
          <p className="text-yellow-400 text-xs font-mono mb-3">내가 만든 캐릭터</p>
        ) : (
          <div className="mb-3"></div>
        )}
      </div>
      {showLikeButton && (
        <>
          <button
            onClick={handleLikeToggle}
            className="absolute top-0 right-0 focus:outline-none flex items-center gap-1"
            aria-label={liked ? '좋아요 취소' : '좋아요'}
          >
            {liked ? (
              <>
                <SolidHeart className="w-6 h-6 text-pink-400 drop-shadow-[0_0_3px_#f0f] transition-transform transform scale-110" />
                <span className="ml-1 text-pink-400 font-bold text-lg drop-shadow-[0_0_2px_#f0f]">{character.likes ?? 0}</span>
              </>
            ) : (
              <>
                <OutlineHeart className="w-6 h-6 text-cyan-400 hover:text-pink-400 transition-colors drop-shadow-[0_0_2px_#0ff]" />
                <span className="ml-1 text-cyan-400 font-bold text-lg drop-shadow-[0_0_2px_#0ff]">{character.likes ?? 0}</span>
              </>
            )}
          </button>
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
  <div className="flex justify-between mb-3">
    <div className="w-full flex justify-center items-center gap-30">
      <div className="text-center">
        <div className="text-[28px] font-bold text-white mb-1">{character.usesCount || 0}</div>
        <div className="text-gray-400 text-sm">조회수</div>
      </div>
      <div className="text-center">
        <div className="text-[28px] font-bold text-white mb-1">{character.likes || 0}</div>
        <div className="text-gray-400 text-sm">좋아요</div>
      </div>
      <div className="text-center">
        <div className="text-[28px] font-bold text-white mb-1">{character.friendship || 1}</div>
        <div className="text-gray-400 text-sm">친밀도</div>
      </div>
    </div>
  </div>
);

CharacterStats.propTypes = {
  character: PropTypes.object.isRequired,
  isMyCharacter: PropTypes.bool,
};

// CollapsibleText 컴포넌트 추가
function CollapsibleText({ text, maxLines = 2 }) {
  const [expanded, setExpanded] = useState(false);
  if (!text) return null;
  return (
    <div>
      <div
        className={`overflow-hidden transition-all duration-300 ${expanded ? '' : 'line-clamp-2'}`}
        style={{ maxHeight: expanded ? 'none' : '3.2em' }}
      >
        {text}
      </div>
      {text.length > 60 && (
        <button
          className="mt-1 text-xs text-cyan-300 underline hover:text-fuchsia-400"
          onClick={() => setExpanded(v => !v)}
        >
          {expanded ? '접기' : '더보기'}
        </button>
      )}
    </div>
  );
}

// 재사용 가능한 캐릭터 정보 섹션 컴포넌트
export const CharacterInfo = ({ character }) => (
  <div className="mb-8">
    <div className="space-y-8">
      {character.prompt?.personality && (
        <div>
          <div className="text-gray-400 text-sm mb-2">성격</div>
          <CollapsibleText text={character.prompt.personality} />
        </div>
      )}
      {character.prompt?.tone && (
        <div>
          <div className="text-gray-400 text-sm mb-2">말투</div>
          <CollapsibleText text={character.prompt.tone} />
        </div>
      )}
      {(character.introduction || character.description) && (
        <div>
          <div className="text-gray-400 text-sm mb-2">설명</div>
          <CollapsibleText text={character.introduction || character.description} />
        </div>
      )}
      <div>
        <div className="text-gray-400 text-sm mb-3">태그</div>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 rounded-md border border-cyan-700 bg-black/60 text-cyan-300 text-xs font-mono tracking-widest shadow-[0_0_4px_#0ff]" style={{fontFamily:'Share Tech Mono, monospace', letterSpacing:'0.08em', border:'1.5px solid #066', boxShadow:'0 0 4px #0ff'}}>
            #{character.id || '캐릭터'}번째로 생성된 캐릭터
          </span>
          {character.prompt?.tag && character.prompt.tag.split(',').filter(tag => tag.trim()).map((tag, idx) => (
            <span key={`tag-${idx}-${tag.trim()}`} className="px-3 py-1 rounded-md border border-cyan-700 bg-black/60 text-cyan-300 text-xs font-mono tracking-widest shadow-[0_0_4px_#0ff]" style={{fontFamily:'Share Tech Mono, monospace', letterSpacing:'0.08em', border:'1.5px solid #066', boxShadow:'0 0 4px #0ff'}}>
              #{tag.trim()}
            </span>
          ))}
        </div>
      </div>
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

const CharacterProfile = ({ character, liked, origin, onClose, onLikeToggle, onEdit }) => {
  const isMyCharacter = origin === 'my';
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const { getToken, userId } = useAuth();
  const { enterOrCreateChatRoom } = useEnterOrCreateChatRoom();

  // Determine if character is created by current user
  const isCharacterCreatedByMe = character?.clerkId === userId;

  // 채팅 시작 함수
  const handleStartChat = async () => {
    setChatLoading(true);
    try {
      const characterId = character.id;
      const { roomId, character: updatedCharacter, chatHistory, isNewRoom } = await enterOrCreateChatRoom(characterId);
      
      console.log(isNewRoom ? '🆕 새 채팅방 생성됨' : '🔄 기존 채팅방 입장 (히스토리 ' + chatHistory.length + '개)');

      navigate(`/chatMate/${roomId}`, {
        state: { character: updatedCharacter, chatHistory: chatHistory, roomId: roomId }
      });
    } catch (error) {
      alert('채팅방 처리에 실패했습니다: ' + error.message);
    } finally {
      setChatLoading(false);
    }
  };

  // Handle like/unlike functionality
  const handleLikeToggle = async () => {
    if (isCharacterCreatedByMe) return; // Cannot like own character
    
    setLoading(true);
    try {
      const token = await getToken();
      // Use character.id consistently (backend returns id field)
      const characterId = character?.id;
      
      if (!characterId) {
        throw new Error('캐릭터 ID를 찾을 수 없습니다.');
      }
      
      await toggleLike(characterId, token);
      
      // Call parent's onLikeToggle if provided
      if (onLikeToggle) {
        onLikeToggle(characterId, !liked);
      }
    } catch (error) {
      console.error('찜하기 처리 실패:', error);
      alert('찜하기 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit button click
  const handleEditClick = () => {
    if (onEdit) {
      onEdit(character);
    }
  };

  // Get button text and disabled state
  const getButtonConfig = () => {
    if (isCharacterCreatedByMe) {
      return {
        text: '내가 만든 캐릭터',
        disabled: true,
        className: 'w-full bg-gray-600 text-gray-400 font-bold py-4 px-6 rounded-2xl cursor-not-allowed'
      };
    } else {
      if (liked) {
        return {
          text: '찜 취소하기',
          disabled: false,
          className: 'w-full bg-gradient-to-r from-pink-700 to-red-700 hover:from-pink-600 hover:to-red-600 text-pink-100 font-bold py-4 px-6 rounded-2xl transition-all duration-200 text-lg transform hover:scale-105 flex items-center justify-center gap-2 shadow-[0_0_8px_#f0f,0_0_16px_#f0f] animate-neonPulse'
        };
      } else {
        return {
          text: '찜 하기',
          disabled: false,
          className: 'w-full bg-gradient-to-r from-cyan-700 to-fuchsia-700 hover:from-cyan-600 hover:to-fuchsia-600 text-cyan-100 font-bold py-4 px-6 rounded-2xl transition-all duration-200 text-lg transform hover:scale-105 flex items-center justify-center gap-2 shadow-[0_0_8px_#0ff,0_0_16px_#f0f] animate-neonPulse'
        };
      }
    }
  };

  const buttonConfig = getButtonConfig();

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center z-[500] p-5" onClick={handleBackdropClick} style={{fontFamily:'Share Tech Mono, monospace', zIndex: 500, background: 'rgba(0,0,0,0.8)', alignItems: 'flex-start'}}>
      <div className="bg-[rgba(34,34,40,0.85)] glass border-2 border-cyan-700 rounded-3xl p-8 w-140 shadow-[0_0_24px_#0ff,0_0_48px_#f0f] max-h-[90vh] animate-fadeIn flex flex-col z-[500]" style={{boxShadow:'0 0 24px #0ff, 0 0 48px #f0f', border:'2px solid #099', backdropFilter:'blur(16px)', zIndex: 500, marginTop: '80px'}}>
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
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
        </div>
        {/* 버튼 영역: 항상 하단 고정 */}
        <div className="space-y-3 pt-4">
          {/* 수정하기 버튼 - 내가 만든 캐릭터일 때만 표시 */}
          {isCharacterCreatedByMe && (
            <button
              onClick={handleEditClick}
              className="w-full bg-gradient-to-r from-green-700 to-emerald-700 hover:from-green-600 hover:to-emerald-600 text-green-100 font-bold py-4 px-6 rounded-2xl transition-all duration-200 text-lg transform hover:scale-105 flex items-center justify-center gap-2 shadow-[0_0_8px_#0f0,0_0_16px_#0f0] animate-neonPulse"
              style={{textShadow:'0 0 4px #0f0, 0 0 8px #0f0', boxShadow:'0 0 8px #0f0, 0 0 16px #0f0'}}>
              수정하기
            </button>
          )}
          
          {/* 1:1 채팅하기 버튼 - 모든 캐릭터에 대해 표시 */}
          <button
            onClick={handleStartChat}
            disabled={chatLoading}
            className="w-full bg-gradient-to-r from-purple-700 to-pink-700 hover:from-purple-600 hover:to-pink-600 text-purple-100 font-bold py-4 px-6 rounded-2xl transition-all duration-200 text-lg transform hover:scale-105 flex items-center justify-center gap-2 shadow-[0_0_8px_#f0f,0_0_16px_#0ff] animate-neonPulse"
            style={{textShadow:'0 0 4px #f0f, 0 0 8px #0ff', boxShadow:'0 0 8px #f0f, 0 0 16px #0ff'}}>
            {chatLoading ? '채팅방 생성 중...' : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                1:1 채팅하기
              </>
            )}
          </button>
          
          {/* 찜하기/찜취소하기 버튼 - 내가 만든 캐릭터가 아닐 때만 표시 */}
          {!isCharacterCreatedByMe && (
          <button
            onClick={handleLikeToggle}
            className={buttonConfig.className}
            disabled={buttonConfig.disabled || loading}
            style={buttonConfig.disabled ? {} : {textShadow:'0 0 4px #0ff, 0 0 8px #f0f', boxShadow:'0 0 8px #0ff, 0 0 16px #f0f'}}>
            {loading ? '처리 중...' : buttonConfig.text}
          </button>
          )}
          <button
            onClick={onClose}
            className="w-full bg-black/40 glass border-2 border-fuchsia-700 hover:border-cyan-700 text-cyan-100 font-bold py-3 px-6 rounded-2xl transition-colors duration-200 shadow-[0_0_4px_#f0f,0_0_8px_#0ff]"
            style={{textShadow:'0 0 3px #f0f', boxShadow:'0 0 4px #f0f, 0 0 8px #0ff', border:'2px solid #707'}}>
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
  onEdit: PropTypes.func,
};

export default CharacterProfile;