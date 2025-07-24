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
import NeonPageLayout from '../components/NeonPageLayout';
import NeonSearchInput from '../components/NeonSearchInput';

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
  // const [activeSort, setActiveSort] = useState('인기순'); // 정렬 상태 - 제거됨
  // const [selectedCharacter, setSelectedCharacter] = useState(null); // 더 이상 사용하지 않음
  const [editingCharacter, setEditingCharacter] = useState(null);

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
    fetchMyCharacters(tab);
  }, [tab, fetchMyCharacters]);

  // 검색 필터링
  const filteredCharacters = characters.filter(char => {
    const keyword = searchQuery.toLowerCase();
    return (
      char.name.toLowerCase().includes(keyword) ||
      (char.description && char.description.toLowerCase().includes(keyword)) ||
      (char.introduction && char.introduction.toLowerCase().includes(keyword))
    );
  });

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
    try {
      console.log('Editing character:', character);

      // 이미 업데이트된 데이터가 있는지 확인
      const updatedCharacter = characters.find(char =>
        (char.id) === (character.id)
      );

      if (updatedCharacter && updatedCharacter !== character) {
        // 업데이트된 데이터가 있으면 그것을 사용
        console.log('Using updated character data:', updatedCharacter);
        setEditingCharacter(updatedCharacter);
      } else {
        // 기본 데이터 사용
        setEditingCharacter(character);
      }
    } catch (error) {
      console.error('Error in handleEditCharacter:', error);
      // 최종적으로 기본 데이터 사용
      setEditingCharacter(character);
    }
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
    <NeonPageLayout
      title="내 캐릭터 목록"
      subtitle="[내가 만들거나 저장한 캐릭터 목록이에요]"
    >
      <NeonSearchInput
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
      />
      <div className="flex justify-center gap-4 mb-11">
        <button className={`neon-btn px-6 py-2 ${tab === 'created' ? 'bg-neonBlue text-darkBg' : ''}`} onClick={() => setTab('created')}>내 캐릭터</button>
        <button className={`neon-btn px-6 py-2 ${tab === 'liked' ? 'bg-neonPurple text-darkBg' : ''}`} onClick={() => setTab('liked')}>찜한 캐릭터</button>
        <Link to="/createCharacter">
          <button className="neon-btn px-6 py-2 ml-4">캐릭터 생성</button>
        </Link>
      </div>
      {/* 캐릭터 카드 그리드 */}
      {showCharacters.length === 0 ? (
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
          onSelect={handleEditCharacter}
        />
      )}
      {/* 캐릭터 상세 모달 */}
      {editingCharacter && tab === 'created' && (
        <CharacterEditModal
          character={editingCharacter}
          liked={likedIds.includes(editingCharacter.id)}
          onClose={() => {
            setEditingCharacter(null);
            resetCharacter();
          }}
          onSave={handleSaveCharacter}
          onLikeToggle={handleLikeToggle}
        />
      )}
      {editingCharacter && tab === 'liked' && (
        <CharacterProfile
          character={editingCharacter}
          liked={likedIds.includes(editingCharacter.id)}
          onClose={() => {
            setEditingCharacter(null);
            resetCharacter();
          }}
          onLikeToggle={handleLikeToggle}
        />
      )}
    </NeonPageLayout>
  );
}
