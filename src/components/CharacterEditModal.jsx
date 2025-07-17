// src/components/CharacterEditModal.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Heart as OutlineHeart, Heart as SolidHeart } from 'lucide-react';

const CharacterEditModal = ({ character, liked, onClose, onSave, onLikeToggle }) => {
  const [formData, setFormData] = useState({
    name: character?.name || '',
    description: character?.description || '',
    creater: character?.creater || '',
    image: character?.image || '',
    personality: character?.personality || '',
    characteristics: character?.characteristics || '',
    tags: character?.tags || ''
  });


  const [previewImage, setPreviewImage] = useState(character?.image || '');

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
    onLikeToggle(character?.id, !liked);
  };

  const handleSave = () => {
    // Validate required fields
    if (!formData.name.trim()) {
      alert('캐릭터 이름을 입력해주세요.');
      return;
    }

    if (!formData.description.trim()) {
      alert('캐릭터 설명을 입력해주세요.');
      return;
    }
    onSave(character?.id, formData);
    onClose();
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
      className="fixed inset-0 flex justify-center items-center z-50 p-5 bg-black bg-opacity-50"
      onClick={handleBackdropClick}
      onKeyDown={handleBackdropKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-character-title"
      tabIndex={-1}
    >
      <div className="bg-gray-800 rounded-3xl p-8 w-160 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* 프로필 헤더 */}
        <div className="relative flex items-center mb-8">
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
            <span className="text-gray-400 text-sm">By. {formData.creater}</span>

            {/* 작성자 입력 */}
            <div className="flex items-center mb-3">
              <span className="text-gray-400 text-sm mr-2">By.{formData.creater} </span>
              {/* <input
                type="text"
                value={formData.creater}
                onChange={(e) => handleInputChange('creater', e.target.value)}
                className="text-gray-400 text-sm bg-transparent border-b border-gray-600 focus:border-indigo-500 outline-none flex-1"
                placeholder="작성자"
              /> */}
            </div>

            {/* 설명 입력 */}
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="text-gray-300 text-sm bg-transparent border border-gray-600 focus:border-indigo-500 outline-none w-full p-2 rounded resize-none"
              placeholder="캐릭터 설명"
              rows="2"
            />
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
        <div className="flex justify-between mb-10">
          <div className="text-center flex-1">
            <div className="text-3xl font-bold text-white mb-1">{character?.conversations || 0}</div>
            <div className="text-gray-400 text-sm">대화</div>
          </div>
          <div className="text-center flex-1">
            <div className="text-3xl font-bold text-white mb-1">{character?.likes || 0}</div>
            <div className="text-gray-400 text-sm">좋아요</div>
          </div>
          <div className="text-center flex-1">
            <div className="text-3xl font-bold text-white mb-1">{character?.intimacy || 0}</div>
            <div className="text-gray-400 text-sm">친밀도</div>
          </div>
        </div>

        <div className="mb-8">
          <h2 id="edit-character-title" className="text-xl font-semibold text-white mb-6">캐릭터 정보</h2>
          <div className="space-y-8">
            {/* 성격 입력 */}
            <div className="pb-6 border-b border-gray-700">
              <div className="text-gray-400 text-sm mb-3">성격</div>
              <textarea
                value={formData.personality}
                onChange={(e) => handleInputChange('personality', e.target.value)}
                className="w-full bg-transparent border border-gray-600 focus:border-indigo-500 outline-none p-3 rounded text-white resize-none"
                placeholder="캐릭터의 성격을 입력하세요"
                rows="3"
              />
            </div>

            {/* 특징 입력 */}
            <div className="pb-6 border-b border-gray-700">
              <div className="text-gray-400 text-sm mb-3">특징</div>
              <textarea
                value={formData.characteristics}
                onChange={(e) => handleInputChange('characteristics', e.target.value)}
                className="w-full bg-transparent border border-gray-600 focus:border-indigo-500 outline-none p-3 rounded text-white resize-none"
                placeholder="캐릭터의 특징을 입력하세요"
                rows="3"
              />
            </div>

            {/* 태그 입력 */}
            <div className="pb-6 border-b border-gray-700">
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
                  #캐릭터 id
                </span>
                <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-xs">
                  #{formData.creater}
                </span>
                {formData.tags?.split(',').map((tag, index) => (
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
          <button
            onClick={handleSave}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-4 px-6 rounded-2xl transition-all duration-200 text-lg transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            수정하기
          </button>
          <button
            onClick={onClose}
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
    name: PropTypes.string,
    description: PropTypes.string,
    creater: PropTypes.string,
    image: PropTypes.string,
    intimacy: PropTypes.number,
    personality: PropTypes.string,
    characteristics: PropTypes.string,
    tags: PropTypes.string
  }).isRequired,
  liked: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onLikeToggle: PropTypes.func.isRequired
};

export default CharacterEditModal;
