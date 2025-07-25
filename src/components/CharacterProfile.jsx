import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Heart as OutlineHeart, Heart as SolidHeart } from 'lucide-react';
import { getSafeImageUrl } from '../utils/imageUtils';
import { useEnterOrCreateChatRoom } from '../data/chatMessages';

// 재사용 가능한 캐릭터 헤더 컴포넌트
export const CharacterHeader = ({ character, liked, onLikeToggle, showLikeButton = true }) => {
  const characterId = character.id;
  


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
        <h1 className="text-2xl font-semibold text-white mb-1">{character.name}</h1>
        <p className="text-gray-400 text-sm mb-3">By. {character.creatorName || '알 수 없음'}</p>
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
    {isMyCharacter ? (
      <>
      <div className="w-full flex justify-center items-center gap-30">
        <div className="text-center">
          <div className="text-[28px] font-bold text-white mb-1">5</div>
          <div className="text-gray-400 text-sm">조회수</div>
        </div>
        <div className="text-center">
          <div className="text-[28px] font-bold text-white mb-1">10</div>
          <div className="text-gray-400 text-sm">좋아요</div>
        </div>
        <div className="text-center">
          <div className="text-[28px] font-bold text-white mb-1">{character.exp || 0}</div>
          <div className="text-gray-400 text-sm">친밀도</div>
        </div>
        </div>
      </>
    ) : (
      <>
        <div className="w-full flex justify-center items-center gap-40">
        <div className="text-center">
          <div className="text-[28px] font-bold text-white mb-1">{character.usesCount || 0}</div>
          <div className="text-gray-400 text-sm">조회수</div>
        </div>
        <div className="text-center">
          <div className="text-[28px] font-bold text-white mb-1">{character.likes || 0}</div>
          <div className="text-gray-400 text-sm">좋아요</div>
        </div>
        </div>
      </>
    )}
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

const CharacterProfile = ({ character, liked, origin, onClose, onLikeToggle, onChatRoomCreated, isMyCharacter = false }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // 디버깅을 위한 콘솔 로그 추가
  console.log('CharacterProfile Debug:', {
    characterId: character.id,
    characterName: character.name,
    characterClerkId: character.clerkId,
    isMyCharacter,
    origin,
    liked
  });

  // 채팅방 입장/생성 (기존 방이 있으면 입장, 없으면 생성)
  const { enterOrCreateChatRoom } = useEnterOrCreateChatRoom();

  const handleStartChat = async () => {
    setLoading(true);
    try {
      // character_id 사용 (이전 로그에서 character.id는 undefined였음)
      const characterId = character.characterId || character.id;
      console.log('🔍 채팅방 입장/생성 시도 - characterId:', characterId);
      
      const { roomId, character: updatedCharacter, chatHistory, isNewRoom } = await enterOrCreateChatRoom(characterId);
      
      console.log(isNewRoom ? '✅ 새 채팅방 생성 완료' : '✅ 기존 채팅방 입장 완료', 
                  { roomId, updatedCharacter, chatHistoryLength: chatHistory.length });
      
      if (onChatRoomCreated) onChatRoomCreated();
      
      // ChatMate로 채팅방 정보 전달 (히스토리 포함)
      navigate(`/chatMate/${roomId}`, { 
        state: { 
          character: updatedCharacter, 
          chatHistory: chatHistory,
          roomId: roomId 
        } 
      });
    } catch (error) {
      console.error('💥 채팅방 처리 에러:', error);
      alert('채팅방 처리에 실패했습니다: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

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
          {/* 내가 만든 캐릭터면 "내가 만든 캐릭터" 버튼, 다른 사람이 만든 캐릭터면 "장바구니에서 제거" 버튼 */}
          {isMyCharacter ? (
            <>
              <button
                disabled
                className="w-full bg-gradient-to-r from-cyan-700 to-fuchsia-700 text-cyan-300 font-bold py-4 px-6 rounded-2xl text-lg flex items-center justify-center gap-2 shadow-[0_0_8px_#0ff,0_0_16px_#f0f] animate-neonPulse opacity-70 cursor-not-allowed"
                aria-label="내가 만든 캐릭터"
                style={{textShadow:'0 0 4px #0ff, 0 0 8px #f0f', boxShadow:'0 0 8px #0ff, 0 0 16px #f0f'}}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                내가 만든 캐릭터
              </button>
              <button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-gray-200 font-bold py-3 px-6 rounded-2xl transition-all duration-200 text-lg transform hover:scale-105 flex items-center justify-center gap-2 shadow-[0_0_8px_#666,0_0_16px_#888]"
                aria-label="닫기"
                style={{textShadow:'0 0 4px #666, 0 0 8px #888', boxShadow:'0 0 8px #666, 0 0 16px #888'}}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                닫기
              </button>
            </>
          ) : (
            <>
              {/* 다른 사람이 만든 캐릭터일 때 "장바구니에서 제거" 버튼 */}
              <button
                onClick={() => onLikeToggle(character.id)}
                className="w-full bg-gradient-to-r from-red-700 to-pink-700 hover:from-red-600 hover:to-pink-600 text-red-100 font-bold py-4 px-6 rounded-2xl transition-all duration-200 text-lg transform hover:scale-105 flex items-center justify-center gap-2 shadow-[0_0_8px_#f00,0_0_16px_#f00] animate-neonPulse"
                aria-label="장바구니에서 제거"
                style={{textShadow:'0 0 4px #f00, 0 0 8px #f00', boxShadow:'0 0 8px #f00, 0 0 16px #f00'}}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                장바구니에서 제거
              </button>
            </>
          )}
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
  onChatRoomCreated: PropTypes.func,
  isMyCharacter: PropTypes.bool,
};

export default CharacterProfile;
