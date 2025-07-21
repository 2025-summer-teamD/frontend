// src/components/CharacterEditModal.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Heart as OutlineHeart, Heart as SolidHeart } from 'lucide-react';
import { useUpdateCharacter, useDeleteCharacter } from '../data/characters';
import { useUser } from '@clerk/clerk-react';

const CharacterEditModal = ({ character, liked, onClose, onSave, onLikeToggle }) => {
  const { updateCharacter, loading: updateLoading } = useUpdateCharacter();
  const { deleteCharacter, loading: deleteLoading } = useDeleteCharacter();
  const { user } = useUser(); // username을 가져오기 위해 useUser 추가
  const [loading, setLoading] = useState(false);

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
  
  const [formData, setFormData] = useState({
    name: character?.name || '',
    description: character?.description || character?.introduction || '',
    creator: character?.creator || character?.creater || character?.user_id || character?.clerkId || '',
    image: character?.image || character?.image_url || character?.imageUrl || '',
    personality: character?.personality || character?.prompt?.personality || '',
    tone: character?.tone || character?.prompt?.tone || '',
    characteristics: character?.characteristics || '',
    tags: character?.tags || character?.tag || character?.prompt?.tag || ''
  });

  const [previewImage, setPreviewImage] = useState(character?.image || character?.image_url || character?.imageUrl || '');

  // character prop이 변경될 때 formData를 업데이트 (모달이 열릴 때만)
  useEffect(() => {
    if (character) {
      console.log('Character data in modal:', character); // 디버깅용
      setFormData({
        name: character?.name || '',
        description: character?.description || character?.introduction || '',
        creator: character?.creator || character?.creater || character?.user_id || character?.clerkId || '',
        image: character?.image || character?.image_url || character?.imageUrl || '',
        personality: character?.personality || character?.prompt?.personality || '',
        tone: character?.tone || character?.prompt?.tone || '',
        characteristics: character?.characteristics || '',
        tags: character?.tags || character?.tag || character?.prompt?.tag || ''
      });
      setPreviewImage(character?.image || character?.image_url || character?.imageUrl || '');
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
    const characterId = character?.character_id || character?.id;
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
      const characterId = character?.character_id || character?.id;
      
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
      const characterId = character.id;
      const roomId = await createOrGetChatRoom(characterId);
      if (onChatRoomCreated) onChatRoomCreated();
      navigate(`/chatMate/${roomId}`, { state: { character } });
    } catch (error) {
      alert('채팅방 생성에 실패했습니다: ' + error.message);
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
      const characterId = character?.character_id || character?.id;
      
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

  return (
    <div
      className="fixed inset-0 flex justify-center items-center z-50 p-5 bg-opacity-50"
      onClick={handleBackdropClick}
      onKeyDown={handleBackdropKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-character-title"
      tabIndex={-1}
    >
      <div className="bg-gray-800 rounded-3xl p-8 w-140 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* 프로필 헤더 */}
        <div className="relative flex items-center mb-5">
          <div className="w-20 h-20 bg-gray-300 rounded-full border-4 border-white mr-5 overflow-hidden relative group cursor-pointer">
            {previewImage && (
              <img
                src={previewImage}
                alt={formData.name}
                className="w-full h-full object-cover"
              />
            )}
            {/* 이미지 변경 오버레이 */}
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              className="text-white text-xl font-bold bg-transparent focus:border-indigo-500 outline-none mb-2"
              placeholder="캐릭터 이름"
            />
            
            {/* 작성자 표시 */}
            <div className="flex items-center mb-3">
              <span className="text-gray-400 text-sm">By. {character?.creator_name || character?.creator || user?.username || user?.firstName || formData.creator}</span>
            </div>
          </div>
          <button
            onClick={toggleLike}
            className="absolute top-0 right-0 focus:outline-none"
            aria-label={liked ? '좋아요 취소' : '좋아요'}
          >
            {liked ? (
              <SolidHeart className="w-6 h-6 text-red-500 transition-transform transform scale-110" />
            ) : (
              <OutlineHeart className="w-6 h-6 text-gray-400 hover:text-red-500 transition-colors" />
            )}
          </button>
        </div>

        {/* 통계 섹션 */}
        <div className="w-full flex justify-center items-center gap-30 mb-3">
          <div className="text-center">
            <div className="text-[28px] font-bold text-white mb-1">{character?.uses_count || 0}</div>
            <div className="text-gray-400 text-sm">조회수</div>
          </div>
          <div className="text-center">
            <div className="text-[28px] font-bold text-white mb-1">{character?.likes || 0}</div>
            <div className="text-gray-400 text-sm">좋아요</div>
          </div>
          <div className="text-center">
            <div className="text-[28px] font-bold text-white mb-1">{character?.intimacy || 0}</div>
            <div className="text-gray-400 text-sm">친밀도</div>
          </div>
        </div>
        

        <div className="mb-8">
          <div className="space-y-5">
            {/* 성격 입력 */}
            <div>
              <div className="text-gray-400 text-sm mb-3">성격</div>
              <textarea
                value={formData.personality}
                onChange={(e) => handleInputChange('personality', e.target.value)}
                className="w-full bg-transparent border border-gray-600 focus:border-indigo-500 outline-none p-3 rounded text-white resize-none"
                placeholder="캐릭터의 성격을 입력하세요 (예: 친절함, 호기심, 적극성)"
                rows="2"
              />
            </div>

            {/* 말투 입력 */}
            <div>
              <div className="text-gray-400 text-sm mb-3">말투</div>
              <input
                type="text"
                value={formData.tone}
                onChange={(e) => handleInputChange('tone', e.target.value)}
                className="w-full bg-transparent border border-gray-600 focus:border-indigo-500 outline-none p-3 rounded text-white"
                placeholder="캐릭터의 말투를 입력하세요 (예: 차분하고 논리적인, 활기차고 친근한)"
              />
            </div>

            {/* 특징 입력 */}
            <div>
              <div className="text-gray-400 text-sm mb-3">설명</div>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full bg-transparent border border-gray-600 focus:border-indigo-500 outline-none p-3 rounded text-white resize-none"
                placeholder="캐릭터에 대한 설명을 입력하세요"
                rows="2"
              />
            </div>

            {/* 태그 입력 */}
            <div>
              <div className="text-gray-400 text-sm mb-3">태그</div>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
                className="w-full bg-transparent border border-gray-600 focus:border-indigo-500 outline-none p-3 rounded text-white"
                placeholder="태그를 쉼표로 구분하여 입력하세요 (예: 친근한, 유머러스, 도움이 되는)"
              />
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-xs">
                  #{character?.id || '캐릭터'}번째로 생성된 캐릭터
                </span>
                {formData.tags?.split(',').filter(tag => tag.trim()).map((tag, index) => (
                  <span key={index} className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs">
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
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-4 px-6 rounded-2xl transition-all duration-200 text-lg transform hover:scale-105 flex items-center justify-center gap-2"
            disabled={loading}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03
                8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512
                15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            {loading ? '채팅방 입장 중...' : '대화하기'}
          </button>
          <div className="flex justify-between space-x-4">
          {/* 수정하기 버튼 */}
          <button
            onClick={handleSave}
            disabled={updateLoading || deleteLoading}
            className={`w-full ${updateLoading || deleteLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-indigo-600'} text-white font-medium py-3 px-6 rounded-2xl transition-all duration-200 text-lg transform flex items-center justify-center gap-2`}
          >
            {updateLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                수정 중...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                수정하기
              </>
            )}
          </button>
          {/* 삭제하기 버튼 */}
          <button
            onClick={handleDelete}
            disabled={updateLoading || deleteLoading}
            className={`w-full ${deleteLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'} text-white font-medium py-3 px-6 rounded-2xl text-lg transition-all duration-200 flex items-center justify-center gap-2`}
          >
            {deleteLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                삭제 중...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                삭제하기
              </>
            )}
          </button>
          </div>
          
          {/* 취소 버튼 */}
          <button
            onClick={onClose}
            disabled={updateLoading || deleteLoading}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-2xl transition-colors duration-200"
          >
            취소
          </button>

          
        </div>
      </div>
    </div>
  );
};

CharacterEditModal.propTypes = {
  character: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    character_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    description: PropTypes.string,
    introduction: PropTypes.string,
    creator: PropTypes.string,
    creater: PropTypes.string,
    user_id: PropTypes.string,
    clerkId: PropTypes.string,
    image: PropTypes.string,
    image_url: PropTypes.string,
    imageUrl: PropTypes.string,
    intimacy: PropTypes.number,
    personality: PropTypes.string,
    tone: PropTypes.string,
    characteristics: PropTypes.string,
    tags: PropTypes.string,
    tag: PropTypes.string,
    prompt: PropTypes.shape({
      personality: PropTypes.string,
      tone: PropTypes.string,
      tag: PropTypes.string
    }),
    messageCount: PropTypes.number,
    conversations: PropTypes.number,
    uses_count: PropTypes.number,
    likes: PropTypes.number,
    is_public: PropTypes.bool,
    liked: PropTypes.bool
  }).isRequired,
  liked: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onLikeToggle: PropTypes.func.isRequired
};

export default CharacterEditModal;
