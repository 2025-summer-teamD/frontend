import React, { useState } from 'react';
import PropTypes from 'prop-types';

const ChatRoomCreateModal = ({ character, onClose, onConfirm }) => {
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  const handleConfirm = () => {
    onConfirm({
      personaId: character.id,
      description: description.trim(),
      isPublic: isPublic
    });
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center gap-4 mb-6">
          <img 
            src={character.imageUrl} 
            alt={character.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-cyan-400"
          />
          <div>
            <h3 className="text-xl font-bold text-white mb-1">
              {character.name}와의 채팅방 만들기
            </h3>
            <p className="text-gray-400 text-sm">
              채팅방에 대한 설명을 입력해주세요
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              채팅방 설명 (선택사항)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="예: 재미있는 대화를 나누는 공간"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 resize-none"
              rows={3}
              maxLength={500}
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {description.length}/500
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-4 h-4 text-cyan-600 bg-gray-800 border-gray-600 rounded focus:ring-cyan-500 focus:ring-2"
            />
            <label htmlFor="isPublic" className="text-sm text-gray-300">
              공개 채팅방으로 만들기
            </label>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-500 hover:to-blue-500 transition-all duration-200 transform hover:scale-105"
          >
            채팅방 만들기
          </button>
        </div>
      </div>
    </div>
  );
};

ChatRoomCreateModal.propTypes = {
  character: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    imageUrl: PropTypes.string.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

export default ChatRoomCreateModal; 