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
import ChatRoomCreateModal from '../components/ChatRoomCreateModal';
import { useMyCharacters, useCharacterDetail, useUpdateCharacter, toggleLike, useDeleteCharacter } from '../data/characters';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useChatRooms } from '../contexts/ChatRoomsContext';
import { getSafeImageUrl } from '../utils/imageUtils';
import MyChatRoomList from '../components/MyChatRoomList';
import { useNavigate } from 'react-router-dom';

export default function CharacterList() {
  const { userId, getToken } = useAuth();
  const { user } = useUser(); // username을 가져오기 위해 useUser 추가
  const navigate = useNavigate();

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

  const [tab, setTab] = useState('created'); // 'created', 'liked', 'mychats'
  const [searchQuery, setSearchQuery] = useState(''); // 검색어 상태
  const [editingCharacter, setEditingCharacter] = useState(null);
  const [editingModalCharacter, setEditingModalCharacter] = useState(null); // 수정 모달용 상태
  const [showCreateChatModal, setShowCreateChatModal] = useState(false); // 채팅방 생성 모달
  const [selectedCharacterIds, setSelectedCharacterIds] = useState([]); // 선택된 캐릭터 ID들
  const [chatType, setChatType] = useState(''); // 'oneOnOne' 또는 'group'
  const [showChatTypeModal, setShowChatTypeModal] = useState(false); // 채팅 타입 선택 모달
  
  // ChatRoomCreateModal 관련 상태
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [showCharacterSelectModal, setShowCharacterSelectModal] = useState(false);

  // 찜한 캐릭터 목록을 가져오는 상태
  const [likedCharacters, setLikedCharacters] = useState([]);
  const [likedLoading, setLikedLoading] = useState(false);
  const [likedError, setLikedError] = useState(null);

  // useMyCharacters 훅은 이제 'tab' 파라미터를 받지 않고 모든 'created' 캐릭터를 가져옵니다.
  const { characters, loading, error, fetchMyCharacters, setCharacters } = useMyCharacters(tab);

  // 캐릭터 상세 정보를 가져오는 훅
  const { character: detailCharacter, loading: detailLoading, fetchCharacterDetail, resetCharacter } = useCharacterDetail();

  // 캐릭터 수정을 위한 훅
  const { updateCharacter, loading: updateLoading } = useUpdateCharacter();

  // 캐릭터 삭제를 위한 훅
  const { deleteCharacter } = useDeleteCharacter();
  // 사이드바 채팅방 목록 갱신용
  const { refetch: refetchMyChatRooms, refetchPublicRooms } = useChatRooms();

  // 페이지 포커스 시 캐릭터 목록 새로고침
  useEffect(() => {
    const handleFocus = () => {
      console.log('🔄 페이지 포커스 감지 - 캐릭터 목록 새로고침');
      if (tab === 'created') {
        fetchMyCharacters('created');
      } else if (tab === 'liked') {
        fetchLikedCharacters();
      }
    };

    window.addEventListener('focus', handleFocus);
    
    // 컴포넌트 마운트 시에도 새로고침
    handleFocus();

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [tab, fetchMyCharacters]);

  // 찜한 캐릭터 목록을 가져오는 함수
  const fetchLikedCharacters = async () => {
    setLikedLoading(true);
    setLikedError(null);
    try {
      const token = await getToken();
      // 캐시 강제 새로고침을 위한 타임스탬프 추가
      const timestamp = Date.now();
      const url = `${import.meta.env.VITE_API_BASE_URL}/my/characters?type=liked&_t=${timestamp}`;
      
      console.log('🔍 fetchLikedCharacters - API call:', { url });
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('🔍 fetchLikedCharacters - Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ fetchLikedCharacters - Response not ok:', errorText);
        // 오류가 발생해도 빈 배열로 설정하여 UI가 깨지지 않도록 함
        setLikedCharacters([]);
        return;
      }
      
      const data = await response.json();
      console.log('✅ fetchLikedCharacters - Response data:', data);
      
      setLikedCharacters(data.data || []);
    } catch (error) {
      console.error('❌ fetchLikedCharacters - Error:', error);
      // 오류가 발생해도 빈 배열로 설정하여 UI가 깨지지 않도록 함
      setLikedCharacters([]);
      setLikedError(null); // 오류 메시지를 표시하지 않음
    } finally {
      setLikedLoading(false);
    }
  };

  // 탭 변경 시 데이터 새로고침
  useEffect(() => {
    if (tab === 'mychats') return; // 내 채팅방 탭에서는 캐릭터 API 호출 X
    if (tab === 'liked') {
      fetchLikedCharacters();
    } else {
    fetchMyCharacters(tab);
    }
  }, [tab, fetchMyCharacters]);

  // 검색 필터링
  const getFilteredCharacters = () => {
    let charactersToFilter = [];
    
    if (tab === 'liked') {
      charactersToFilter = likedCharacters;
    } else {
      charactersToFilter = Array.isArray(characters) ? characters : [];
    }
    
    return charactersToFilter.filter(character => {
    const keyword = searchQuery.toLowerCase();
    return (
        character.name.toLowerCase().includes(keyword) ||
        (character.description && character.description.toLowerCase().includes(keyword)) ||
        (character.introduction && character.introduction.toLowerCase().includes(keyword))
    );
  });
  };

  const filteredCharacters = getFilteredCharacters();

  // 정렬 제거 - 기본 순서로 표시
  const sortedCharacters = filteredCharacters;

  // 현재 탭에 따라 보여줄 캐릭터 목록 결정
  const showCharacters = sortedCharacters;

  // 로딩 상태 결정
  const isLoading = tab === 'liked' ? likedLoading : loading;
  const currentError = tab === 'liked' ? likedError : error;

  // const handleSortChange = (newSort) => {
  //   setActiveSort(newSort);
  // }; // 제거됨

  const handleLikeToggle = async (id, newLiked) => {
    try {
      const token = await getToken();
      // Use character.id consistently (backend returns id field)
      const characterId = id;
      
      if (!characterId) {
        throw new Error('캐릭터 ID를 찾을 수 없습니다.');
      }
      
      const result = await toggleLike(characterId, token);

      // API 호출 성공 시 로컬 상태 업데이트
      setLikedIds(prev =>
        newLiked ? [...prev, characterId] : prev.filter(x => x !== characterId)
      );

      // 목록 새로고침하여 좋아요 수 업데이트
      if (tab === 'liked') {
        await fetchLikedCharacters();
      } else {
      await fetchMyCharacters();
      }
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
        // Use character.id consistently (backend returns id field)
        const characterId = character?.id;
        
        if (!characterId) {
          throw new Error('캐릭터 ID를 찾을 수 없습니다.');
        }
        
        await deleteCharacter(characterId, token);
        // 삭제 후 목록 새로고침
        window.location.reload();
      } catch (error) {
        console.error('Error deleting character:', error);
        alert('캐릭터 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleSelectCharacter = async (character) => {
    // 캐릭터 목록 새로고침하여 최신 친밀도 반영
    if (tab === 'created') {
      await fetchMyCharacters('created');
    } else if (tab === 'liked') {
      await fetchLikedCharacters();
    }
    
    // 카드 클릭 시 프로필 모달 열기
    setEditingCharacter(character);
  };

  const handleRemoveFromLiked = async (character) => {
    try {
      const token = await getToken();
      // Use character.id consistently (backend returns id field)
      const characterId = character?.id;

      if (!characterId) {
        throw new Error('캐릭터 ID를 찾을 수 없습니다.');
      }
      
      await toggleLike(characterId, token);
      // 찜 목록에서 제거 후 목록 새로고침
      await fetchLikedCharacters();
    } catch (error) {
      console.error('Error removing from liked:', error);
      alert('찜 목록에서 제거 중 오류가 발생했습니다.');
    }
  };

  const handleCreateChatRoom = async (selectedCharacterIds, description = '', isPublic = true) => {
    try {
      console.log('handleCreateChatRoom - selectedCharacterIds:', selectedCharacterIds);
      console.log('handleCreateChatRoom - chatType:', chatType);
      console.log('handleCreateChatRoom - description:', description);
      console.log('handleCreateChatRoom - isPublic:', isPublic);
      
      const token = await getToken();
      
      let endpoint;
      let requestBody;
      
      if (chatType === 'oneOnOne') {
        // 1대1 채팅의 경우 personaId 하나만 전송
        endpoint = '/chat/rooms';
        requestBody = {
          personaId: selectedCharacterIds[0],
          description: description,
          isPublic: isPublic
        };
      } else {
        // 단체 채팅의 경우 participantIds 배열 사용
        endpoint = '/chat/rooms';
        requestBody = {
          participantIds: selectedCharacterIds,
          description: description,
          isPublic: isPublic
        };
      }
      
      console.log('handleCreateChatRoom - endpoint:', endpoint);
      console.log('handleCreateChatRoom - requestBody:', requestBody);
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${endpoint}`, {
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

  const handleCharacterSelect = async (characterId) => {
    // Use character.id consistently (backend returns id field)
    const id = characterId;
    
    if (!id) {
      console.error('Character ID is missing');
      return;
    }
    
    setSelectedCharacterIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleCreateChatRoomWithSelected = () => {
    if (selectedCharacterIds.length === 0) {
      alert('최소 1명의 캐릭터를 선택해주세요.');
      return;
    }
    
    if (chatType === 'group' && selectedCharacterIds.length < 2) {
      alert('단체 채팅은 최소 2명의 캐릭터를 선택해야 합니다.');
      return;
    }

    // 설명과 공개/비공개 설정 가져오기
    const description = document.getElementById('chatRoomDescription')?.value || '';
    const isPublic = document.getElementById('isPublicChat')?.checked || true;
    
    handleCreateChatRoom(selectedCharacterIds, description, isPublic);
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
        if (tab === 'liked') {
          await fetchLikedCharacters();
        } else {
        await fetchMyCharacters();
        }
      } else {
        // 수정된 경우
        console.log('Character updated successfully:', updatedCharacter);
        alert('캐릭터 정보가 성공적으로 업데이트되었습니다!');

        // 목록 새로고침 (API에서 최신 데이터를 다시 가져옴)
        if (tab === 'liked') {
          await fetchLikedCharacters();
        } else {
          await fetchMyCharacters();
        }

        // 수정 모달 닫고 프로필 모달로 전환
        setEditingModalCharacter(null);
        setEditingCharacter(updatedCharacter);
      }
    } catch (error) {
      console.error('Error handling character save:', error);
      alert('캐릭터 처리 중 오류가 발생했습니다.');
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (currentError) {
    return <ErrorDisplay error={currentError} />;
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

      {/* 버튼 3개: 왼쪽 2개, 오른쪽 2개 */}
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
        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowChatTypeModal(true);
            }}
            className="bg-gradient-to-r from-cyan-700 to-fuchsia-700 hover:from-cyan-600 hover:to-fuchsia-600 text-cyan-100 font-bold py-3 px-6 rounded-2xl transition-all duration-200 text-lg transform hover:scale-105 flex items-center justify-center gap-2 shadow-[0_0_8px_#0ff,0_0_16px_#f0f] animate-neonPulse"
            style={{textShadow:'0 0_4px #0ff, 0 0 8px #f0f', boxShadow:'0 0 8px #0ff, 0 0 16px #f0f'}}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            새 채팅방 만들기
          </button>
        </div>
      </div>

      {tab === 'mychats' ? (
        <MyChatRoomList refetchPublicRooms={refetchPublicRooms} />
      ) : (
        /* 캐릭터 카드 그리드 */
        showCharacters.length === 0 ? (
          tab === 'liked' ? (
            <EmptyState 
              title="찜한 캐릭터가 없습니다" 
              message="커뮤니티에서 원하는 캐릭터를 찜하세요!"
            />
          ) : (
        <EmptyState />
          )
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

      {/* 채팅 타입 선택 모달 */}
      {showChatTypeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#181a2b] border-2 border-cyan-400 rounded-2xl shadow-[0_0_16px_#0ff] p-8 w-full max-w-md animate-fadeIn">
            <h2 className="text-cyan-200 text-lg font-bold mb-6 drop-shadow-[0_0_2px_#0ff] text-center">
              채팅 타입 선택
            </h2>
            <div className="space-y-4">
              <button
                onClick={() => {
                  setChatType('oneOnOne');
                  setSelectedCharacterIds([]);
                  setShowChatTypeModal(false);
                  setShowCreateChatModal(true);
                }}
                className="w-full bg-gradient-to-r from-blue-700 to-cyan-700 hover:from-blue-600 hover:to-cyan-600 text-cyan-100 font-bold py-4 px-6 rounded-2xl transition-all duration-200 text-lg transform hover:scale-105 flex items-center justify-center gap-3 shadow-[0_0_8px_#0ff,0_0_16px_#0ff] animate-neonPulse"
                style={{textShadow:'0 0_4px #0ff, 0 0 8px #f0f', boxShadow:'0 0 8px #0ff, 0 0 16px #f0f'}}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                1대1 채팅하기
              </button>
              <button
                onClick={() => {
                  setChatType('group');
                  setSelectedCharacterIds([]);
                  setShowChatTypeModal(false);
                  setShowCreateChatModal(true);
                }}
                className="w-full bg-gradient-to-r from-fuchsia-700 to-pink-700 hover:from-fuchsia-600 hover:to-pink-600 text-fuchsia-100 font-bold py-4 px-6 rounded-2xl transition-all duration-200 text-lg transform hover:scale-105 flex items-center justify-center gap-3 shadow-[0_0_8px_#f0f,0_0_16px_#f0f] animate-neonPulse"
                style={{textShadow:'0 0_4px #f0f, 0 0 8px #f0f', boxShadow:'0 0 8px #f0f, 0 0 16px #f0f'}}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                단체로 대화하기
              </button>
            </div>
            <div className="flex justify-center mt-6">
              <Button
                onClick={() => {
                  setShowChatTypeModal(false);
                  setChatType('');
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-full"
              >
                닫기
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 캐릭터 선택 모달 (1대1 채팅용) */}
      {showCharacterSelectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#181a2b] border-2 border-cyan-400 rounded-2xl shadow-[0_0_16px_#0ff] p-8 w-full max-w-md animate-fadeIn">
            <h2 className="text-cyan-200 text-lg font-bold mb-6 drop-shadow-[0_0_2px_#0ff] text-center">
              채팅할 캐릭터 선택
            </h2>
            <p className="text-cyan-300 text-sm mb-4 text-center">
              채팅방을 만들 캐릭터를 선택해주세요
            </p>
            {isLoading ? (
              <div className="text-cyan-300 text-center">로딩 중...</div>
            ) : showCharacters.length === 0 ? (
              <div className="text-cyan-400 text-center">채팅할 캐릭터가 없습니다.</div>
            ) : (
              <ul className="space-y-2 max-h-64 overflow-y-auto no-scrollbar">
                {showCharacters.map(character => (
                  <li
                    key={character.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-cyan-900/40 cursor-pointer transition-all border border-transparent hover:border-cyan-400"
                    onClick={() => {
                      setSelectedCharacter({
                        id: character.id,
                        name: character.name,
                        imageUrl: getSafeImageUrl(character.imageUrl || character.image || '')
                      });
                      setShowCharacterSelectModal(false);
                      setShowCreateModal(true);
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedCharacter({
                          id: character.id,
                          name: character.name,
                          imageUrl: getSafeImageUrl(character.imageUrl || character.image || '')
                        });
                        setShowCharacterSelectModal(false);
                        setShowCreateModal(true);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`${character.name} 선택`}
                  >
                    <img src={getSafeImageUrl(character.imageUrl || character.image || '')} alt={character.name} className="w-10 h-10 rounded-full border-2 border-cyan-300 shadow-[0_0_2px_#0ff]" />
                    <span className="text-cyan-100 font-bold">{character.name}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex justify-center mt-6">
              <Button
                onClick={() => {
                  setShowCharacterSelectModal(false);
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-full"
              >
                닫기
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 채팅방 생성 모달 */}
      {showCreateChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#181a2b] border-2 border-cyan-400 rounded-2xl shadow-[0_0_16px_#0ff] p-8 w-full max-w-md animate-fadeIn">
            <h2 className="text-cyan-200 text-lg font-bold mb-4 drop-shadow-[0_0_2px_#0ff]">
              {chatType === 'oneOnOne' ? '1대1 채팅할 캐릭터 선택' : '단체 채팅에 참여할 캐릭터 선택'}
            </h2>
            <p className="text-cyan-300 text-sm mb-4">
              {chatType === 'oneOnOne' 
                ? '1대1 채팅은 한 명의 캐릭터와만 대화할 수 있습니다.' 
                : '단체 채팅은 최소 2명의 캐릭터를 선택해야 합니다.'
              }
            </p>
            {isLoading ? (
              <div className="text-cyan-300">로딩 중...</div>
            ) : showCharacters.length === 0 ? (
              <div className="text-cyan-400">참여할 캐릭터가 없습니다.</div>
            ) : (
              <ul className="space-y-2 max-h-64 overflow-y-auto no-scrollbar">
                {showCharacters.map(character => (
                  <li
                    key={character.id}
                    className={`flex items-center gap-3 p-2 rounded-lg hover:bg-cyan-900/40 cursor-pointer transition-all ${
                      selectedCharacterIds.includes(character.id) ? 'bg-cyan-900/60 border border-cyan-400' : ''
                    }`}
                    onClick={() => {
                      if (chatType === 'oneOnOne') {
                        // 1대1 채팅의 경우 하나만 선택 가능
                        setSelectedCharacterIds([character.id]);
                      } else {
                        // 단체 채팅의 경우 여러 개 선택 가능
                        handleCharacterSelect(character.id);
                      }
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        if (chatType === 'oneOnOne') {
                          setSelectedCharacterIds([character.id]);
                        } else {
                          handleCharacterSelect(character.id);
                        }
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`${character.name} 선택`}
                  >
                    <input
                      type={chatType === 'oneOnOne' ? 'radio' : 'checkbox'}
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
            
            {/* 채팅방 설명 입력 필드 */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-cyan-300 mb-2">
                채팅방 설명 (선택사항)
              </label>
              <textarea
                id="chatRoomDescription"
                placeholder="예: 재미있는 대화를 나누는 공간"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 resize-none"
                rows={3}
                maxLength={500}
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                <span id="descriptionCount">0</span>/500
              </div>
            </div>

            {/* 공개/비공개 설정 */}
            <div className="flex items-center gap-3 mt-4">
              <input
                type="checkbox"
                id="isPublicChat"
                defaultChecked={true}
                className="w-4 h-4 text-cyan-600 bg-gray-800 border-gray-600 rounded focus:ring-cyan-500 focus:ring-2"
              />
              <label htmlFor="isPublicChat" className="text-sm text-cyan-300">
                공개 채팅방으로 만들기
              </label>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button
                onClick={() => {
                  setShowCreateChatModal(false);
                  setChatType('');
                  setSelectedCharacterIds([]);
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-full"
              >
                닫기
              </Button>
              <Button
                onClick={handleCreateChatRoomWithSelected}
                disabled={
                  selectedCharacterIds.length === 0 || 
                  (chatType === 'group' && selectedCharacterIds.length < 2)
                }
                className="bg-gradient-to-r from-cyan-700 to-fuchsia-700 hover:from-cyan-600 hover:to-fuchsia-600 text-cyan-100 font-bold py-2 px-4 rounded-full transition-all duration-200 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{textShadow:'0 0_4px #0ff, 0 0 8px #f0f', boxShadow:'0 0 8px #0ff, 0 0 16px #f0f'}}
              >
                {chatType === 'oneOnOne' ? '1대1 채팅 시작' : '단체 채팅 시작'}
              </Button>
            </div>
            {/* 선택된 캐릭터 수 표시 */}
            {chatType === 'group' && (
              <div className="mt-2 text-center">
                <span className={`text-sm font-bold ${
                  selectedCharacterIds.length >= 2 ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {selectedCharacterIds.length}명 선택됨 {selectedCharacterIds.length < 2 ? '(최소 2명 필요)' : ''}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 수정 모달 */}
      {editingModalCharacter && (
        <CharacterEditModal
          character={editingModalCharacter}
          liked={false}
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
          origin="my"
          isMyCharacter={editingCharacter.clerkId === userId}
          onClose={() => {
            setEditingCharacter(null);
            resetCharacter(); // 상세 정보 리셋
            // 캐릭터 목록 새로고침하여 최신 친밀도 반영
            fetchMyCharacters('created');
          }}
          onLikeToggle={handleLikeToggle}
          onEdit={(character) => {
            setEditingCharacter(null); // 프로필 모달 닫기
            setEditingModalCharacter(character); // 수정 모달 열기
          }}
        />
      )}

      {/* 프로필 모달 - 찜한 캐릭터 */}
      {editingCharacter && tab === 'liked' && (
        <CharacterProfile
          character={editingCharacter}
          liked={likedIds.includes(editingCharacter.id)}
          origin="my"
          isMyCharacter={editingCharacter.clerkId === userId}
          onClose={() => {
            setEditingCharacter(null);
            resetCharacter(); // 상세 정보 리셋
            // 찜한 캐릭터 목록 새로고침
            fetchLikedCharacters();
          }}
          onLikeToggle={handleRemoveFromLiked}
          onEdit={(character) => {
            setEditingCharacter(null); // 프로필 모달 닫기
            setEditingModalCharacter(character); // 수정 모달 열기
          }}
        />
      )}

      {/* ChatRoomCreateModal */}
      {showCreateModal && selectedCharacter && (
        <ChatRoomCreateModal
          character={selectedCharacter}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedCharacter(null);
          }}
          onConfirm={async (chatRoomData) => {
            try {
              setShowCreateModal(false);
              setSelectedCharacter(null);

              const token = await getToken();
              const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
              
              const createResponse = await fetch(`${API_BASE_URL}/chat/rooms`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  personaId: chatRoomData.personaId,
                  description: chatRoomData.description,
                  isPublic: chatRoomData.isPublic
                }),
              });

              if (!createResponse.ok) {
                const errorText = await createResponse.text();
                throw new Error(`채팅방 생성 실패: ${createResponse.status}`);
              }

              const createResult = await createResponse.json();
              const roomId = createResult.data?.roomId;

              if (!roomId) {
                throw new Error('채팅방 ID를 받지 못했습니다.');
              }

              // 채팅방 정보 조회
              const infoResponse = await fetch(`${API_BASE_URL}/chat/room-info?roomId=${roomId}`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
              });

              if (!infoResponse.ok) {
                const errorText = await infoResponse.text();
                throw new Error(`채팅방 정보 조회 실패: ${infoResponse.status}`);
              }

              const infoResult = await infoResponse.json();

              navigate(`/chatMate/${roomId}`, {
                state: {
                  character: infoResult.data?.persona,
                  chatHistory: infoResult.data?.chatHistory || [],
                  roomId: roomId
                }
              });
            } catch (error) {
              alert('채팅방 생성에 실패했습니다: ' + error.message);
            }
          }}
        />
      )}
    </PageLayout>
  );
}
