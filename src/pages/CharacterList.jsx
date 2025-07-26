// src/pages/CharacterList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CharacterEditModal from '../components/CharacterEditModal';
import CharacterProfile from '../components/CharacterProfile';
import CharacterSearchBar from '../components/CharacterSearchBar';
import CharacterGrid from '../components/CharacterGrid';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';
import SearchBar from '../components/SearchBar';
import EmptyState from '../components/EmptyState';
import PageLayout from '../components/PageLayout';
import TabButton from '../components/TabButton';
import Button from '../components/Button';
import { useMyCharacters, useCharacterDetail, useUpdateCharacter, toggleLike, useDeleteCharacter } from '../data/characters';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useChatRooms } from '../contexts/ChatRoomsContext';
import { getSafeImageUrl } from '../utils/imageUtils';
import MyChatRoomList from '../components/MyChatRoomList';

export default function CharacterList() {
  const { userId, getToken } = useAuth();
  const { user } = useUser(); // username을 가져오기 위해 useUser 추가

  // username 정보 출력 (디버깅용)
  useEffect(() => {
    if (user) {
      console.log('User info:', {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        emailAddresses: user.emailAddresses
      });
    }
  }, [user]);

  const [likedIds, setLikedIds] = useState(() =>
    JSON.parse(localStorage.getItem('likedIds')) || []
  );
  useEffect(() => {
    localStorage.setItem('likedIds', JSON.stringify(likedIds));
  }, [likedIds]);

  const [tab, setTab] = useState('created'); // 'created' 또는 'liked'
  const [searchQuery, setSearchQuery] = useState(''); // 검색어 상태
  const [editingCharacter, setEditingCharacter] = useState(null);
  const [editingModalCharacter, setEditingModalCharacter] = useState(null); // 수정 모달용 상태
  const [showCreateChatModal, setShowCreateChatModal] = useState(false); // 채팅방 생성 모달
  const [selectedCharacterIds, setSelectedCharacterIds] = useState([]); // 선택된 캐릭터 ID들

  // useMyCharacters 훅은 이제 'tab' 파라미터를 받지 않고 모든 'created' 캐릭터를 가져옵니다.
  const { characters, loading, error, fetchMyCharacters, setCharacters } = useMyCharacters(tab);

  // 캐릭터 상세 정보를 가져오는 훅
  const { character: detailCharacter, loading: detailLoading, fetchCharacterDetail, resetCharacter } = useCharacterDetail();

  // 캐릭터 수정을 위한 훅
  const { updateCharacter, loading: updateLoading } = useUpdateCharacter();

  // 캐릭터 삭제를 위한 훅
  const { deleteCharacter } = useDeleteCharacter();
  // 사이드바 채팅방 목록 갱신용
  const { refetch: refetchMyChatRooms } = useChatRooms();

  // 탭 변경 시 데이터 새로고침
  useEffect(() => {
    if (tab === 'mychats') return; // 내 채팅방 탭에서는 캐릭터 API 호출 X
    fetchMyCharacters(tab);
  }, [tab, fetchMyCharacters]);

  // 검색 필터링
  const filteredCharacters = Array.isArray(characters) ? characters.filter(character => {
    const keyword = searchQuery.toLowerCase();
    return (
      character.name.toLowerCase().includes(keyword) ||
      (character.description && character.description.toLowerCase().includes(keyword)) ||
      (character.introduction && character.introduction.toLowerCase().includes(keyword))
    );
  }) : [];

  // 정렬 제거 - 기본 순서로 표시
  const sortedCharacters = filteredCharacters;

  // 현재 탭에 따라 보여줄 캐릭터 목록 결정
  const showCharacters = sortedCharacters;

  // const handleSortChange = (newSort) => {
  //   setActiveSort(newSort);
  // }; // 제거됨

  const handleLikeToggle = async (id, newLiked) => {
    try {
      const token = await getToken();
      const result = await toggleLike(id, token);

      // API 호출 성공 시 로컬 상태 업데이트
      setLikedIds(prev =>
        newLiked ? [...prev, id] : prev.filter(x => x !== id)
      );

      // 목록 새로고침하여 좋아요 수 업데이트
      await fetchMyCharacters();
    } catch (error) {
      console.error('좋아요 토글 실패:', error);
      alert('좋아요 처리 중 오류가 발생했습니다.');
    }
  };

  const handleEditCharacter = async (character) => {
    // 수정 버튼 클릭 시 수정 모달 열기
    setEditingModalCharacter(character);
  };

  const handleDeleteCharacter = async (character) => {
    if (window.confirm(`정말로 "${character.name}" 캐릭터를 삭제하시겠습니까?`)) {
      try {
        const token = await getToken();
        await deleteCharacter(character.id, token);
        // 삭제 후 목록 새로고침
        window.location.reload();
      } catch (error) {
        console.error('Error deleting character:', error);
        alert('캐릭터 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleSelectCharacter = async (character) => {
    // 카드 클릭 시 프로필 모달 열기
    setEditingCharacter(character);
  };

  const handleRemoveFromLiked = async (character) => {
    try {
      const token = await getToken();
      await toggleLike(character.id, token);
      // 찜 목록에서 제거 후 목록 새로고침
      window.location.reload();
    } catch (error) {
      console.error('Error removing from liked:', error);
      alert('찜 목록에서 제거 중 오류가 발생했습니다.');
    }
  };

  const handleCreateChatRoom = async (selectedCharacterIds) => {
    try {
      console.log('handleCreateChatRoom - selectedCharacterIds:', selectedCharacterIds);
      
      const token = await getToken();
      const requestBody = {
        participantIds: selectedCharacterIds
      };
      console.log('handleCreateChatRoom - requestBody:', requestBody);
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/chat/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('handleCreateChatRoom - response status:', response.status);
      const data = await response.json();
      console.log('handleCreateChatRoom - response data:', data);
      
      if (data.success) {
        // 채팅방 생성 성공 시 ChatMate로 이동
        console.log('handleCreateChatRoom - data.data:', data.data);
        window.location.href = `/chatMate/${data.data.roomId}`;
      } else {
        alert('채팅방 생성에 실패했습니다: ' + data.message);
      }
    } catch (error) {
      console.error('Error creating chat room:', error);
      alert('채팅방 생성 중 오류가 발생했습니다.');
    }
  };

  const handleCharacterSelect = (characterId) => {
    setSelectedCharacterIds(prev => {
      if (prev.includes(characterId)) {
        return prev.filter(id => id !== characterId);
      } else {
        return [...prev, characterId];
      }
    });
  };

  const handleCreateChatRoomWithSelected = () => {
    if (selectedCharacterIds.length === 0) {
      alert('최소 1명의 캐릭터를 선택해주세요.');
      return;
    }
    handleCreateChatRoom(selectedCharacterIds);
    setShowCreateChatModal(false);
    setSelectedCharacterIds([]);
  };

  const handleSaveCharacter = async (updatedCharacter, action = 'updated') => {
    try {
      if (action === 'deleted') {
        // 삭제된 경우
        console.log('Character deleted successfully');
        alert('캐릭터가 성공적으로 삭제되었습니다.');

        // 목록 새로고침
        await fetchMyCharacters();
      } else {
        // 수정된 경우
        console.log('Character updated successfully:', updatedCharacter);
        alert('캐릭터 정보가 성공적으로 업데이트되었습니다!');

        // 로컬 상태에서 해당 캐릭터 업데이트
        setCharacters(prevCharacters =>
          prevCharacters.map(char =>
            (char.id) === (updatedCharacter.id)
              ? updatedCharacter
              : char
          )
        );

        // editingCharacter 상태를 업데이트된 데이터로 설정
        setEditingCharacter(updatedCharacter);
      }
    } catch (error) {
      console.error('Error handling character save:', error);
      alert('캐릭터 처리 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  return (
    <PageLayout
      title="내 캐릭터 목록"
      subtitle="내가 만들거나 저장한 캐릭터 목록이에요"
      className="font-rounded"
    >
      {/* Search and Filter */}
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* 버튼 3개: 왼쪽 2개, 오른쪽 1개 */}
      <div className="flex items-center justify-between mb-4 max-w-2xl mx-auto">
        <div className="flex gap-2">
          <TabButton
            isActive={tab === 'created'}
            onClick={() => setTab('created')}
          >
            내 캐릭터
          </TabButton>
          <TabButton
            isActive={tab === 'liked'}
            onClick={() => setTab('liked')}
          >
            찜한 캐릭터
          </TabButton>
          <TabButton isActive={tab === 'mychats'} onClick={() => setTab('mychats')}>
            내 채팅방
          </TabButton>
        </div>
        <button
          onClick={() => setShowCreateChatModal(true)}
          className="bg-gradient-to-r from-cyan-700 to-fuchsia-700 hover:from-cyan-600 hover:to-fuchsia-600 text-cyan-100 font-bold py-3 px-6 rounded-2xl transition-all duration-200 text-lg transform hover:scale-105 flex items-center justify-center gap-2 shadow-[0_0_8px_#0ff,0_0_16px_#f0f] animate-neonPulse"
          style={{textShadow:'0 0 4px #0ff, 0 0 8px #f0f', boxShadow:'0 0 8px #0ff, 0 0 16px #f0f'}}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          새 채팅방 만들기
        </button>
      </div>

      {tab === 'mychats' ? (
        <MyChatRoomList />
      ) : (
        /* 캐릭터 카드 그리드 */
        showCharacters.length === 0 ? (
          <EmptyState />
        ) : (
          <CharacterGrid
            characters={showCharacters.map(char => ({
              ...char,
              imageUrl: getSafeImageUrl(char.imageUrl || char.image || '')
            }))}
            myId={userId}
            tab={tab}
            likedIds={likedIds}
            onLikeToggle={handleLikeToggle}
            onEdit={handleEditCharacter}
            onDelete={handleDeleteCharacter}
            onSelect={handleSelectCharacter}
          />
        )
      )}

      {/* 채팅방 생성 모달 */}
      {showCreateChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#181a2b] border-2 border-cyan-400 rounded-2xl shadow-[0_0_16px_#0ff] p-8 w-full max-w-md animate-fadeIn">
            <h2 className="text-cyan-200 text-lg font-bold mb-4 drop-shadow-[0_0_2px_#0ff]">채팅방에 참여할 캐릭터 선택</h2>
            {loading ? (
              <div className="text-cyan-300">로딩 중...</div>
            ) : showCharacters.length === 0 ? (
              <div className="text-cyan-400">참여할 캐릭터가 없습니다.</div>
            ) : (
              <ul className="space-y-2 max-h-64 overflow-y-auto no-scrollbar">
                {showCharacters.map(character => (
                  <li
                    key={character.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-cyan-900/40 cursor-pointer transition-all"
                    onClick={() => {
                      handleCharacterSelect(character.id);
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleCharacterSelect(character.id);
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedCharacterIds.includes(character.id)}
                      onChange={() => {}} // 체크박스는 클릭 시 상태만 변경
                      className="w-4 h-4 text-cyan-600 focus:ring-cyan-500 border-cyan-300 rounded"
                    />
                    <img src={getSafeImageUrl(character.imageUrl || character.image || '')} alt={character.name} className="w-8 h-8 rounded-full border-2 border-cyan-300 shadow-[0_0_2px_#0ff]" />
                    <span className="text-cyan-100 font-bold">{character.name}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex justify-end gap-2 mt-4">
              <Button
                onClick={() => setShowCreateChatModal(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-full"
              >
                닫기
              </Button>
              <Button
                onClick={handleCreateChatRoomWithSelected}
                className="bg-gradient-to-r from-cyan-700 to-fuchsia-700 hover:from-cyan-600 hover:to-fuchsia-600 text-cyan-100 font-bold py-2 px-4 rounded-full transition-all duration-200 text-lg"
                style={{textShadow:'0 0 4px #0ff, 0 0 8px #f0f', boxShadow:'0 0 8px #0ff, 0 0 16px #f0f'}}
              >
                채팅방 생성
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 수정 모달 */}
      {editingModalCharacter && (
        <CharacterEditModal
          character={editingModalCharacter}
          liked={likedIds.includes(editingModalCharacter.id)}
          onClose={() => {
            setEditingModalCharacter(null);
            resetCharacter(); // 상세 정보 리셋
          }}
          onSave={handleSaveCharacter}
          onLikeToggle={handleLikeToggle}
        />
      )}

      {/* 프로필 모달 - 내 캐릭터 */}
      {editingCharacter && tab === 'created' && (
        <CharacterProfile
          character={editingCharacter}
          liked={likedIds.includes(editingCharacter.id)}
          isMyCharacter={editingCharacter.clerkId === userId}
          onClose={() => {
            setEditingCharacter(null);
            resetCharacter(); // 상세 정보 리셋
          }}
          onLikeToggle={handleLikeToggle}
        />
      )}

      {/* 프로필 모달 - 찜한 캐릭터 */}
      {editingCharacter && tab === 'liked' && (
        <CharacterProfile
          character={editingCharacter}
          liked={likedIds.includes(editingCharacter.id)}
          isMyCharacter={editingCharacter.clerkId === userId}
          onClose={() => {
            setEditingCharacter(null);
            resetCharacter(); // 상세 정보 리셋
          }}
          onLikeToggle={handleRemoveFromLiked}
        />
      )}
    </PageLayout>
  );
}
