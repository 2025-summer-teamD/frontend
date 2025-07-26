// src/components/CharacterEditModal.jsx
import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Heart as OutlineHeart, Heart as SolidHeart } from 'lucide-react';
import { useUpdateCharacter, useDeleteCharacter } from '../data/characters';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useEnterOrCreateChatRoom } from '../data/chatMessages';

const CharacterEditModal = ({ character, liked, onClose, onSave, onLikeToggle, onChatRoomCreated }) => {
  const { updateCharacter, loading: updateLoading } = useUpdateCharacter();
  const { deleteCharacter, loading: deleteLoading } = useDeleteCharacter();
  const { user } = useUser(); // username을 가져오기 위해 useUser 추가
  const navigate = useNavigate();
  const { enterOrCreateChatRoom } = useEnterOrCreateChatRoom();
  const [loading, setLoading] = useState(false);
  const [exp, setExp] = useState(character?.exp ?? 0);
  const { getToken } = useAuth();

  // username 디버깅
  useEffect(() => {
    if (user) {
      console.log('CharacterEditModal - User info:', {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName
      });
    }
  }, [user]);

  useEffect(() => {
    if (!character?.id) return;
    (async () => {
      const token = await getToken();
      
      // 1. 조회수 증가
      try {
        await fetch(`/api/personas/${character.id}/view`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (error) {
        console.error('조회수 증가 실패:', error);
      }
      
      // 2. 캐릭터 상세 정보 조회
      const res = await fetch(`/api/my/characters/${character.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        // 백엔드에서 보내는 exp 값 사용
        if (typeof data.data.exp === 'number') {
          setExp(data.data.exp);
        }
        // character prop도 업데이트하여 조회수, 좋아요 등이 실시간으로 반영되도록 함
        if (data.data.usesCount !== undefined || data.data.likes !== undefined) {
          // character prop을 업데이트할 수 있는 방법이 없으므로, 
          // 부모 컴포넌트에서 character 데이터를 새로고침하도록 알림
          console.log('Character data updated:', data.data);
        }
      }
    })();
  }, [character?.id, getToken]);

  const [formData, setFormData] = useState({
    name: character?.name || '',
    description: character?.description || character?.introduction || '',
    creator: character?.creator || character?.creater || character?.userId || character?.clerkId || '',
    image: character?.image || character?.imageUrl || character?.imageUrl || '',
    personality: character?.personality || character?.prompt?.personality || '',
    tone: character?.tone || character?.prompt?.tone || '',
    characteristics: character?.characteristics || '',
    tags: character?.tags || character?.tag || character?.prompt?.tag || ''
  });

  const [previewImage, setPreviewImage] = useState(character?.image || character?.imageUrl || character?.imageUrl || '');

  // character prop이 변경될 때 formData를 업데이트 (모달이 열릴 때만)
  useEffect(() => {
    if (character) {
      console.log('Character data in modal:', character); // 디버깅용
      setFormData({
        name: character?.name || '',
        description: character?.description || character?.introduction || '',
        creator: character?.creator || character?.creater || character?.userId || character?.clerkId || '',
        image: character?.image || character?.imageUrl || character?.imageUrl || '',
        personality: character?.personality || character?.prompt?.personality || '',
        tone: character?.tone || character?.prompt?.tone || '',
        characteristics: character?.characteristics || '',
        tags: character?.tags || character?.tag || character?.prompt?.tag || ''
      });
      setPreviewImage(character?.image || character?.imageUrl || character?.imageUrl || '');
    }
  }, [character]); // character 객체 전체를 의존성으로 설정

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드할 수 있습니다.');
        return;
      }

      // Validate file size (e.g., 5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('파일 크기가 5MB를 초과합니다.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        setPreviewImage(imageUrl);
        setFormData(prev => ({
          ...prev,
          image: imageUrl
        }));
      };
      reader.onerror = () => {
        alert('파일을 읽는 중 오류가 발생했습니다.');
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleLike = () => {
    const characterId = character?.characterId || character?.id;
    onLikeToggle(characterId, !liked);
  };

  const handleSave = async () => {
    // Validate required fields
    if (!formData.name.trim()) {
      alert('캐릭터 이름을 입력해주세요.');
      return;
    }

    if (!formData.description.trim()) {
      alert('캐릭터 설명을 입력해주세요.');
      return;
    }

    try {
      const characterId = character?.characterId || character?.id;

      // API를 통해 캐릭터 수정
      const updatedCharacter = await updateCharacter(characterId, {
        introduction: formData.description,
        personality: formData.personality,
        tone: formData.tone,
        tag: formData.tags
      });

      console.log('Character updated successfully:', updatedCharacter);

      // 부모 컴포넌트에 수정 완료 알림 (alert는 부모에서 처리)
      if (onSave) {
        onSave(updatedCharacter);
      }

      // 모달 닫기
      onClose();

    } catch (error) {
      console.error('Error updating character:', error);
      alert(`캐릭터 수정 중 오류가 발생했습니다: ${error.message}`);
    }
  };

  const handleStartChat = async () => {
    setLoading(true);
    try {
      const characterId = character.characterId || character.id;
      const { roomId, character: updatedCharacter, chatHistory, isNewRoom } = await enterOrCreateChatRoom(characterId);

      console.log(isNewRoom ? '🆕 새 채팅방 생성됨' : '🔄 기존 채팅방 입장 (히스토리 ' + chatHistory.length + '개)');

      if (onChatRoomCreated) onChatRoomCreated();
      navigate(`/chatMate/${roomId}`, {
        state: { character: updatedCharacter, chatHistory: chatHistory, roomId: roomId }
      });
    } catch (error) {
      alert('채팅방 처리에 실패했습니다: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    // 삭제 확인
    const confirmDelete = window.confirm(`정말로 "${formData.name}" 캐릭터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`);

    if (!confirmDelete) {
      return;
    }

    try {
      const characterId = character?.characterId || character?.id;

      // API를 통해 캐릭터 삭제
      await deleteCharacter(characterId);

      console.log('Character deleted successfully');

      // 부모 컴포넌트에 삭제 완료 알림 (alert는 부모에서 처리)
      if (onSave) {
        onSave(null, 'deleted'); // 삭제됨을 알림
      }

      // 모달 닫기
      onClose();

    } catch (error) {
      console.error('Error deleting character:', error);
      alert(`캐릭터 삭제 중 오류가 발생했습니다: ${error.message}`);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleBackdropKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  // roomInfoParticipants 관련 코드/참조 완전히 삭제
  // exp는 exp 상태만 사용
  const myExp = useMemo(() => {
    return exp;
  }, [exp]);

  return (
    <div
      className="fixed inset-0 flex justify-center items-center z-[500] p-5"
      onClick={handleBackdropClick}
      onKeyDown={handleBackdropKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-character-title"
      tabIndex={-1}
      style={{fontFamily:'Share Tech Mono, monospace', zIndex: 500, background: 'rgba(0,0,0,0.8)', alignItems: 'flex-start'}}
    >
      <div className="bg-black/60 glass border-2 border-cyan-700 rounded-3xl p-8 w-140 shadow-[0_0_24px_#0ff,0_0_48px_#f0f] max-h-[90vh] overflow-y-auto no-scrollbar" style={{boxShadow:'0 0 24px #0ff, 0 0 48px #f0f', border:'2px solid #099', backdropFilter:'blur(16px)', marginTop: '80px'}}>
        {/* 프로필 헤더 */}
        <div className="relative flex items-center mb-5">
          <div className="w-20 h-20 bg-gray-300 rounded-full border-4 border-cyan-700 shadow-[0_0_8px_#0ff] mr-5 overflow-hidden relative group cursor-pointer">
            {previewImage && (
              <img
                src={previewImage}
                alt={formData.name}
                className="w-full h-full object-cover"
              />
            )}
            {/* 이미지 변경 오버레이 */}
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-6 h-6 text-cyan-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
          <div className="flex-1">
            {/* 캐릭터 이름 입력 */}
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="text-cyan-200 text-xl font-bold bg-transparent focus:border-cyan-400 outline-none mb-2 tracking-widest drop-shadow-[0_0_4px_#0ff] font-mono"
              placeholder="캐릭터 이름"
              style={{fontFamily:'Share Tech Mono, monospace'}}
            />
            {/* 작성자 표시 */}
            <div className="flex items-center mb-3">
              <span className="text-cyan-400 text-sm font-mono">By. {character?.creatorName || character?.creator || user?.username || user?.firstName || formData.creator}</span>
            </div>
          </div>
          <button
            onClick={toggleLike}
            className="absolute top-0 right-0 focus:outline-none flex items-center gap-1"
            aria-label={liked ? '좋아요 취소' : '좋아요'}
          >
            {liked ? (
              <>
                <SolidHeart className="w-6 h-6 text-pink-400 drop-shadow-[0_0_3px_#f0f] transition-transform transform scale-110" />
                <span className="ml-1 text-pink-400 font-bold text-lg drop-shadow-[0_0_2px_#f0f]">{character.likes || character.likesCount || 0}</span>
              </>
            ) : (
              <>
                <OutlineHeart className="w-6 h-6 text-cyan-400 hover:text-pink-400 transition-colors drop-shadow-[0_0_2px_#0ff]" />
                <span className="ml-1 text-cyan-400 font-bold text-lg drop-shadow-[0_0_2px_#0ff]">{character.likes || character.likesCount || 0}</span>
              </>
            )}
          </button>
        </div>
        {/* 통계 섹션 */}
        <div className="w-full flex justify-center items-center gap-30 mb-3">
          <div className="text-center">
            <div className="text-[28px] font-bold text-cyan-200 mb-1 drop-shadow-[0_0_4px_#0ff]">{character?.usesCount || 0}</div>
            <div className="text-cyan-400 text-sm font-mono">조회수</div>
          </div>
          <div className="text-center">
            <div className="text-[28px] font-bold text-cyan-200 mb-1 drop-shadow-[0_0_4px_#0ff]">{character?.likes || character?.likesCount || 0}</div>
            <div className="text-cyan-400 text-sm font-mono">좋아요</div>
          </div>
          <div className="text-center">
            {/* 백엔드에서 받은 exp 값 표시 */}
            <div className="text-[28px] font-bold text-cyan-200 mb-1 drop-shadow-[0_0_4px_#0ff]">{exp}</div>
            <div className="text-cyan-400 text-sm font-mono">친밀도</div>
          </div>
        </div>
        <div className="mb-8">
          <div className="space-y-5">
            {/* 성격 입력 */}
            <div>
              <div className="text-cyan-400 text-sm mb-3 font-mono">성격</div>
              <textarea
                value={formData.personality}
                onChange={(e) => handleInputChange('personality', e.target.value)}
                className="w-full bg-transparent border border-cyan-700 focus:border-fuchsia-400 outline-none p-3 rounded text-cyan-100 resize-none font-mono tracking-widest no-scrollbar"
                placeholder="캐릭터의 성격을 입력하세요 (예: 친절함, 호기심, 적극성)"
                rows="2"
                style={{fontFamily:'Share Tech Mono, monospace'}}
              />
            </div>
            {/* 말투 입력 */}
            <div>
              <div className="text-cyan-400 text-sm mb-3 font-mono">말투</div>
              <textarea
                value={formData.tone}
                onChange={(e) => handleInputChange('tone', e.target.value)}
                className="w-full bg-transparent border border-cyan-700 focus:border-fuchsia-400 outline-none p-3 rounded text-cyan-100 resize-none font-mono tracking-widest no-scrollbar"
                placeholder="캐릭터의 말투를 입력하세요 (예: 차분하고 논리적인, 활기차고 친근한)"
                rows="2"
                style={{fontFamily:'Share Tech Mono, monospace'}}
              />
            </div>
            {/* 설명 입력 */}
            <div>
              <div className="text-cyan-400 text-sm mb-3 font-mono">설명</div>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full bg-transparent border border-cyan-700 focus:border-fuchsia-400 outline-none p-3 rounded text-cyan-100 resize-none font-mono tracking-widest no-scrollbar"
                placeholder="캐릭터에 대한 설명을 입력하세요"
                rows="2"
                style={{fontFamily:'Share Tech Mono, monospace'}}
              />
            </div>
            {/* 태그 입력 */}
            <div>
              <div className="text-cyan-400 text-sm mb-3 font-mono">태그</div>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
                className="w-full bg-transparent border border-cyan-700 focus:border-fuchsia-400 outline-none p-3 rounded text-cyan-100 font-mono tracking-widest no-scrollbar"
                placeholder="태그를 쉼표로 구분하여 입력하세요 (예: 친근한, 유머러스, 도움이 되는)"
                style={{fontFamily:'Share Tech Mono, monospace'}}
              />
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="px-3 py-1 rounded-md border border-cyan-700 bg-black/60 text-cyan-300 text-xs font-mono tracking-widest shadow-[0_0_4px_#0ff]" style={{fontFamily:'Share Tech Mono, monospace', letterSpacing:'0.08em', border:'1.5px solid #066', boxShadow:'0 0 4px #0ff'}}>
                  #{character?.id || '캐릭터'}번째로 생성된 캐릭터
                </span>
                {formData.tags?.split(',').filter(tag => tag.trim()).map((tag, index) => (
                  <span key={index} className="px-3 py-1 rounded-md border border-cyan-700 bg-black/60 text-cyan-300 text-xs font-mono tracking-widest shadow-[0_0_4px_#0ff]" style={{fontFamily:'Share Tech Mono, monospace', letterSpacing:'0.08em', border:'1.5px solid #066', boxShadow:'0 0 4px #0ff'}}>
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* 버튼 섹션 */}
        <div className="space-y-3">
          {/* 대화하기 버튼 */}
          <button
            onClick={handleStartChat}
            className="w-full bg-gradient-to-r from-cyan-700 to-fuchsia-700 hover:from-cyan-600 hover:to-fuchsia-600 text-cyan-100 font-mono font-bold py-4 px-6 rounded-2xl transition-all duration-200 text-lg transform hover:scale-105 flex items-center justify-center gap-2 shadow-[0_0_8px_#0ff,0_0_16px_#f0f] animate-neonPulse"
            disabled={loading}
            style={{textShadow:'0 0 4px #0ff, 0 0 8px #f0f', boxShadow:'0 0 8px #0ff, 0 0 16px #f0f'}}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03
                8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512
                15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            {loading ? '채팅방 입장 중...' : '대화하기'}
          </button>
          {/* 취소 버튼 */}
          <button
            onClick={onClose}
            disabled={updateLoading || deleteLoading}
            className="w-full bg-black/40 glass border-2 border-fuchsia-700 hover:border-cyan-700 text-cyan-100 font-mono font-bold py-3 px-6 rounded-2xl transition-colors duration-200 shadow-[0_0_4px_#f0f,0_0_8px_#0ff]"
            style={{textShadow:'0 0 3px #f0f', boxShadow:'0 0 4px #f0f, 0 0 8px #0ff', border:'2px solid #707'}}>
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

CharacterEditModal.propTypes = {
  character: PropTypes.object.isRequired,
  liked: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func,
  onLikeToggle: PropTypes.func,
  onChatRoomCreated: PropTypes.func, // 새로 추가된 옵셔널 prop
};

export default CharacterEditModal;
