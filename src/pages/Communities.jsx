// src/pages/Communities.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCommunityCharacters, toggleLike, incrementViewCount } from '../data/characters';
import { useChatRooms } from '../contexts/ChatRoomsContext';
import CharacterProfile from '../components/CharacterProfile';
import CharacterEditModal from '../components/CharacterEditModal';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';
import SearchBar from '../components/SearchBar';
import EmptyState from '../components/EmptyState';
import PageLayout from '../components/PageLayout';
import TabButton from '../components/TabButton';
import { useAuth } from "@clerk/clerk-react";
import { CharacterCard } from '../components/CharacterGrid';

export default function Communities() {
  const navigate = useNavigate();
  const { getToken, userId } = useAuth();

  const [likedIds, setLikedIds] = useState(() =>
    JSON.parse(localStorage.getItem('likedIds')) || []
  );
  const [activeTab, setActiveTab] = useState('캐릭터'); // 기본 탭을 캐릭터로 변경
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [editingCharacter, setEditingCharacter] = useState(null);
  const [sortBy, setSortBy] = useState('likes'); // 정렬 기준 추가

  const { characters, loading, error, setCharacters } = useCommunityCharacters(sortBy);
  const { chatRooms, loading: chatRoomsLoading, error: chatRoomsError, refetch: refetchMyChatCharacters, refetchPublicRooms } = useChatRooms();

  // 캐릭터 목록 새로고침 함수
  const refetchCharacters = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/personas/community?sortBy=${sortBy}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCharacters(data.data || []);
      }
    } catch (error) {
      console.error('캐릭터 목록 새로고침 실패:', error);
    }
  };

  React.useEffect(() => {
    localStorage.setItem('likedIds', JSON.stringify(likedIds));
  }, [likedIds]);

  // likedIds가 변경될 때마다 로그 출력
  React.useEffect(() => {
    console.log('🔍 Communities likedIds 변경:', { 
      likedIds, 
      likedIdsLength: likedIds.length,
      selectedCharacterId: selectedCharacter?.id,
      selectedCharacterLiked: selectedCharacter ? likedIds.includes(selectedCharacter.id) : null
    });
  }, [likedIds, selectedCharacter]);

  // 백엔드에서 찜한 캐릭터 목록을 가져와서 likedIds 동기화하는 함수
  const fetchLikedIdsFromBackend = async () => {
    try {
      const token = await getToken();
      const timestamp = Date.now();
      const url = `${import.meta.env.VITE_API_BASE_URL}/my/characters?type=liked&_t=${timestamp}`;
      
      console.log('🔍 Communities - 백엔드에서 찜한 캐릭터 목록 가져오기:', { url });
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const likedCharacterIds = (data.data || []).map(char => char.id);
        console.log('🔍 Communities - 백엔드에서 가져온 찜한 캐릭터 ID들:', likedCharacterIds);
        
        setLikedIds(likedCharacterIds);
      } else {
        console.error('❌ Communities - 찜한 캐릭터 목록 가져오기 실패:', response.status);
      }
    } catch (error) {
      console.error('❌ Communities - 찜한 캐릭터 목록 가져오기 오류:', error);
    }
  };

  // 페이지 로드 시 백엔드에서 찜한 캐릭터 목록을 가져와서 likedIds 동기화
  React.useEffect(() => {
    fetchLikedIdsFromBackend();
  }, [getToken]);

  // 페이지 포커스 시 공개 채팅방 목록 새로고침
  React.useEffect(() => {
    const handleFocus = () => {
      console.log('🔄 페이지 포커스 감지 - 공개 채팅방 목록 새로고침');
      if (refetchPublicRooms) {
        refetchPublicRooms();
      }
    };

    window.addEventListener('focus', handleFocus);
    
    // 컴포넌트 마운트 시에도 새로고침
    handleFocus();

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [refetchPublicRooms]);

  // 정렬 버튼 클릭 핸들러
  const handleSortChange = (newSort) => {
    setSortBy(newSort === '인기순' ? 'likes' : 'usesCount');
  };

  const handleLikeToggle = async (id, newLiked) => {
    console.log('🔍 Communities handleLikeToggle - 시작:', { id, newLiked });
    try {
      if (!id) {
        console.error('캐릭터 ID가 없습니다.');
        return;
      }
      
      // 즉시 로컬 상태 업데이트 (낙관적 업데이트)
      setLikedIds(prev => {
        const newLikedIds = newLiked 
          ? [...prev, id] 
          : prev.filter(x => x !== id);
        console.log('🔍 Communities handleLikeToggle - likedIds 즉시 업데이트:', { prev, newLikedIds, newLiked });
        return newLikedIds;
      });
      
      // selectedCharacter가 현재 토글된 캐릭터라면 즉시 업데이트
      if (selectedCharacter && selectedCharacter.id === id) {
        setSelectedCharacter(prev => ({
          ...prev,
          liked: newLiked
        }));
        console.log('🔍 Communities handleLikeToggle - selectedCharacter 즉시 업데이트:', { characterId: id, liked: newLiked });
      }
      
      const token = await getToken();
      console.log('🔍 Communities handleLikeToggle - API 호출 전:', { id, token, newLiked });
      const result = await toggleLike(id, token);
      console.log('🔍 Communities handleLikeToggle - API 응답:', result);
      
      // API 응답에 따라 실제 상태 확인
      const actualIsLiked = result.data?.isLiked;
      console.log('🔍 Communities handleLikeToggle - API 응답 isLiked:', actualIsLiked);
      
      // API 응답과 즉시 변경한 상태가 다르면 조정
      if (actualIsLiked !== newLiked) {
        console.log('🔍 Communities handleLikeToggle - 상태 조정 필요:', { newLiked, actualIsLiked });
        
        // likedIds 상태 조정
        setLikedIds(prev => {
          const adjustedLikedIds = actualIsLiked 
            ? [...prev, id] 
            : prev.filter(x => x !== id);
          console.log('🔍 Communities handleLikeToggle - likedIds 조정:', { prev, adjustedLikedIds, actualIsLiked });
          return adjustedLikedIds;
        });
        
        // selectedCharacter 상태 조정
        if (selectedCharacter && selectedCharacter.id === id) {
          setSelectedCharacter(prev => ({
            ...prev,
            liked: actualIsLiked
          }));
          console.log('🔍 Communities handleLikeToggle - selectedCharacter 조정:', { characterId: id, liked: actualIsLiked });
        }
      }
      
      // 해당 캐릭터의 좋아요 수 업데이트
      const character = characters.find(c => c.id === id);
      if (character) {
        character.likes = result.data.likesCount;
        character.liked = actualIsLiked;
        setCharacters(prev => [...prev]);
        console.log('🔍 Communities handleLikeToggle - 캐릭터 상태 업데이트:', { characterId: id, likes: result.data.likesCount, liked: actualIsLiked });
      }
      
      console.log('🔍 Communities handleLikeToggle - 완료');
    } catch (error) {
      console.error('❌ Communities handleLikeToggle - 오류:', error);
      console.error('❌ Communities handleLikeToggle - 에러 메시지:', error.message);
      alert(`좋아요 처리 중 오류가 발생했습니다: ${error.message}`);
      
      // 에러 발생 시 원래 상태로 되돌림
      const currentIsLiked = likedIds.includes(id);
      setLikedIds(prev => {
        const revertedLikedIds = currentIsLiked 
          ? [...prev, id] 
          : prev.filter(x => x !== id);
        console.log('🔍 Communities handleLikeToggle - 에러로 인한 상태 복원:', { prev, revertedLikedIds, currentIsLiked });
        return revertedLikedIds;
      });
      
      if (selectedCharacter && selectedCharacter.id === id) {
        setSelectedCharacter(prev => ({
          ...prev,
          liked: currentIsLiked
        }));
      }
    }
  };

  const handleSaveCharacter = (updatedCharacter) => {
    console.log('Saving character:', updatedCharacter);
    // 캐릭터 수정 후 커뮤니티 목록 새로고침
    if (updatedCharacter) {
      refetchCharacters();
    }
    setEditingCharacter(null);
  };

  const handleCreateChatRoomWithCharacter = async (character) => {
    try {
      const token = await getToken();
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      
      // 캐릭터와 채팅방 생성
      const createResponse = await fetch(`${API_BASE_URL}/chat/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          personaId: character.id,
          description: `${character.name}와의 채팅방`,
          isPublic: false
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
          character: infoResult.data?.character || infoResult.data?.persona || character,
          chatHistory: infoResult.data?.chatHistory || [],
          roomId: roomId
        }
      });
    } catch (error) {
      alert('채팅방 생성에 실패했습니다: ' + error.message);
    }
  };

  // 검색 필터링 (API 데이터 구조에 맞게 수정)
  const filteredCharacters = (characters || []).filter(char => {
    const keyword = searchQuery.toLowerCase();
    // 공개 캐릭터만 표시
    return char.isPublic && (
      char.name.toLowerCase().includes(keyword) ||
      char.introduction.toLowerCase().includes(keyword)
    );
  });

  // 정렬 (API 데이터 구조에 맞게 수정)
  const sortedCharacters = [...filteredCharacters].sort((a, b) => {
    const valA = parseFloat(sortBy === 'usesCount' ? a.usesCount : a.likesCount);
    const valB = parseFloat(sortBy === 'usesCount' ? b.usesCount : b.likesCount);
    return valB - valA;
  });

  // 채팅방 필터링
  const filteredChatRooms = chatRooms.filter(room => {
    const keyword = searchQuery.toLowerCase();
    return (
      room.name?.toLowerCase().includes(keyword) ||
      room.participants?.some(p => p.persona?.name?.toLowerCase().includes(keyword))
    );
  });



  // 채팅방 클릭 핸들러 추가 - 다른 사람의 채팅방은 새로운 채팅방 생성
  const handleChatRoomClick = async (room) => {
    try {
      const token = await getToken();
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      
      // room-info API 호출하여 채팅방의 AI 멤버 정보 가져오기
      const infoResponse = await fetch(`${API_BASE_URL}/chat/room-info?roomId=${room.id}`, {
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
      
      // AI 멤버들의 ID 추출
      const aiMemberIds = infoResult.data?.participants?.map(p => p.id) || [];
      
      if (aiMemberIds.length === 0) {
        throw new Error('채팅방에 AI 멤버가 없습니다.');
      }
      
      console.log('🔍 새로운 채팅방 생성 - AI 멤버들:', aiMemberIds);
      
      // 로딩 상태 표시 (선택사항)
      // 여기서는 간단한 alert로 처리
      
      // 새로운 채팅방 생성
      const createResponse = await fetch(`${API_BASE_URL}/chat/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          participantIds: aiMemberIds,
          isPublic: true,
          description: `"${room.name}" 방의 AI들과의 새로운 대화`
        })
      });
      
      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        throw new Error(`새 채팅방 생성 실패: ${createResponse.status}`);
      }
      
      const createResult = await createResponse.json();
      console.log('🔍 채팅방 생성 응답:', createResult);
      
      const newRoomId = createResult.data?.roomId;
      
      if (!newRoomId) {
        throw new Error('새 채팅방 ID를 받지 못했습니다.');
      }
      
      console.log('✅ 새로운 채팅방 생성 완료:', newRoomId);
      
             // 성공 메시지 표시
       const roomDisplayName = room.name || `${infoResult.data?.participants?.length || 0}명의 AI와 대화`;
       alert(`"${roomDisplayName}" 방의 AI들과 새로운 채팅방을 만들었습니다!`);
      
      // 채팅방 목록 새로고침
      if (refetchPublicRooms) {
        refetchPublicRooms();
      }
      
      // 새 채팅방으로 이동
      navigate(`/chatMate/${newRoomId}`, {
        state: {
          character: infoResult.data?.character || infoResult.data?.persona || room,
          chatHistory: [], // 새로운 채팅방이므로 빈 배열
          roomId: newRoomId,
          isNewRoom: true
        }
      });
      
    } catch (error) {
      console.error('새 채팅방 생성 실패:', error);
      alert('새 채팅방 생성에 실패했습니다: ' + error.message);
    }
  };

  if (loading && activeTab === '캐릭터') {
    return <LoadingSpinner />;
  }

  if (chatRoomsLoading && activeTab === '채팅방') {
    return <LoadingSpinner />;
  }

  if (error && activeTab === '캐릭터') {
    return <ErrorDisplay error={error} />;
  }

  if (chatRoomsError && activeTab === '채팅방') {
    return <ErrorDisplay error={chatRoomsError} />;
  }

  return (
    <PageLayout 
      title="커뮤니티"
      subtitle="다른 사용자들이 만든 캐릭터와 채팅방을 둘러보세요"
    >
      {/* 탭 버튼 */}
      <div className="flex justify-center gap-2 sm:gap-4 mb-6">
        {['캐릭터', '채팅방'].map(tab => (
          <TabButton
            key={tab}
            isActive={activeTab === tab}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </TabButton>
        ))}
      </div>

      {/* Search and Filter */}
      <SearchBar 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      
      {/* 캐릭터 탭 */}
      {activeTab === '캐릭터' && (
        <>
          <div className="flex justify-center gap-2 sm:gap-4 mt-4 mb-3">
            {['인기순', '조회수순'].map(tab => (
              <TabButton
                key={tab}
                isActive={sortBy === (tab === '인기순' ? 'likes' : 'usesCount')}
                onClick={() => handleSortChange(tab)}
              >
                {tab}
              </TabButton>
            ))}
          </div>

          {/* Character Grid */}
          {sortedCharacters.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                {sortedCharacters.map((character, index) => {
                  const isLiked = character.liked || likedIds.includes(character.id);
                  
                  const handleSelect = async () => {
                    try {
                      if (character.id) {
                        const token = await getToken();
                        await incrementViewCount(character.id, token);
                        character.usesCount = (character.usesCount || 0) + 1;
                        setCharacters(prev => [...prev]);
                      }
                    } catch (error) {
                      console.error('조회수 증가 실패:', error);
                    }
                    
                    // 모달 열기
                    setSelectedCharacter(character);
                  };
                  
                  return (
                    <div
                      key={character.id}
                    >
                      <CharacterCard
                        character={character}
                        isMine={false}
                        isLiked={isLiked}
                        onLikeToggle={handleLikeToggle}
                        onEdit={() => {}}
                        onSelect={handleSelect}
                        showEditButtons={false}
                      />
                    </div>
                  );
                })}
              </div>
              

            </>
          )}
        </>
      )}

      {/* 채팅방 탭 */}
      {activeTab === '채팅방' && (
        <>

          {/* Chat Rooms Grid */}
          {filteredChatRooms.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
              {filteredChatRooms.map(room => (
                <div
                  key={room.id}
                  className="relative bg-black/20 border border-cyan-400/30 rounded-lg overflow-hidden hover:border-cyan-300/50 transition-all duration-300 cursor-pointer group transform hover:scale-105"
                  style={{ fontFamily: 'Press Start 2P, monospace', minHeight: 200 }}
                  onClick={() => handleChatRoomClick(room)}
                >
                  {/* 참여자 사진들로 채워진 배경 */}
                  <div className="absolute inset-0 flex">
                    {room.participants?.map((participant, idx) => {
                      const totalParticipants = room.participants?.length || 1;
                      const widthPercent = 100 / totalParticipants;
                      
                      return (
                        <div
                          key={participant.personaId || idx}
                          className="relative overflow-hidden"
                          style={{ width: `${widthPercent}%` }}
                        >
                          <img
                            src={participant.persona?.imageUrl || '/assets/icon-character.png'}
                            alt={participant.persona?.name || 'AI'}
                            className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-300"
                            style={{imageRendering:'pixelated'}}
                          />
                          {/* 그라데이션 오버레이 - 더 투명하게 */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 기본 정보 (항상 표시) */}
                  <div className="relative z-10 p-3 h-full flex flex-col justify-between">
                    {/* 채팅방 이름 */}
                    <div className="text-pink-300 text-xs font-bold mb-1 text-center line-clamp-2" style={{letterSpacing:'0.01em', textShadow:'0 0 2px #f0f'}}>
                      {room.name || `${room.participants?.length || 0}명의 AI와 대화`}
                    </div>
                    
                    {/* AI 명단 표시 */}
                    <div className="text-center">
                      <div className="flex flex-wrap justify-center items-center gap-1">
                        {room.participants?.slice(0, 3).map((participant, idx) => (
                          <div key={participant.personaId || idx} className="text-cyan-200 text-xs font-bold text-center bg-black/80 px-1 py-0.5 rounded border border-cyan-400/20">
                            {participant.persona?.name || 'AI'}
                          </div>
                        ))}
                        {room.participants?.length > 3 && (
                          <div className="text-cyan-200 text-xs font-bold text-center bg-black/80 px-1 py-0.5 rounded border border-cyan-400/20">
                            +{room.participants.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 공개/비공개 표시 */}
                  <div className="absolute top-1 right-1 z-20">
                    <div className="px-1.5 py-0.5 rounded-full text-xs font-bold border border-cyan-400/30 bg-black/90 text-cyan-200">
                      {room.isPublic ? '공개' : '비공개'}
                    </div>
                  </div>

                  {/* 호버 시 설명과 만든사람 정보 표시 */}
                  <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 flex flex-col justify-between p-3">
                    {/* 만든사람 정보 - 위쪽에 배치 */}
                    {room.creatorName && (
                      <div className="text-pink-300 text-xs font-bold bg-black/80 px-2 py-1 rounded border-2 border-pink-400/80 self-center shadow-lg">
                        👤 만든사람: {room.creatorName}
                      </div>
                    )}
                    
                    {/* 중앙 내용 */}
                    <div className="text-center flex-1 flex flex-col justify-center">
                      {/* 설명이 있으면 표시 */}
                      {room.description && (
                        <div className="text-cyan-300 text-xs mb-2 line-clamp-3">
                          {room.description}
                        </div>
                      )}
                      
                      {/* 클릭 안내 */}
                      <div className="text-cyan-200 text-xs">
                        클릭하여 참여
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {selectedCharacter && (
        <CharacterProfile
          character={{ ...selectedCharacter, id: selectedCharacter.id }}
          isLiked={likedIds.includes(selectedCharacter.id)}
          origin="communities"
          isMyCharacter={selectedCharacter.clerkId === userId}
          onClose={() => setSelectedCharacter(null)}
          onLikeToggle={handleLikeToggle}
          onChatRoomCreated={refetchMyChatCharacters}
          style={{ zIndex: 100 }}
        />
      )}

      {editingCharacter && (
        <CharacterEditModal
          character={{ ...editingCharacter, id: editingCharacter.id }}
          isLiked={likedIds.includes(editingCharacter.id)}
          onClose={() => setEditingCharacter(null)}
          onSave={handleSaveCharacter}
          onLikeToggle={handleLikeToggle}
        />
      )}
    </PageLayout>
  );
}