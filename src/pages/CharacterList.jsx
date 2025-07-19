// src/pages/CharacterList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// import CharacterProfile from '../components/CharacterProfile'; // 더 이상 사용하지 않음
import CharacterEditModal from '../components/CharacterEditModal';
import CharacterProfile from '../components/CharacterProfile'; // 추가
import CharacterSearchBar from '../components/CharacterSearchBar'; // 필요하다면 다시 활성화
import CharacterGrid from '../components/CharacterGrid';
import { useMyCharacters, useCharacterDetail, useUpdateCharacter, toggleLike, useDeleteCharacter } from '../data/characters'; // 수정된 useMyCharacters 훅과 useCharacterDetail, useUpdateCharacter 임포트
import { useAuth, useUser } from '@clerk/clerk-react';
import { Search, XCircle } from 'lucide-react';

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
  const [refreshKey, setRefreshKey] = useState(0); // 목록 새로고침을 위한 키

  // useMyCharacters 훅은 이제 'tab' 파라미터를 받지 않고 모든 'created' 캐릭터를 가져옵니다.
  const { characters, loading, error, fetchMyCharacters, setCharacters } = useMyCharacters(tab);
  
  // 캐릭터 상세 정보를 가져오는 훅
  const { character: detailCharacter, loading: detailLoading, fetchCharacterDetail, resetCharacter } = useCharacterDetail();
  
  // 캐릭터 수정을 위한 훅
  const { updateCharacter, loading: updateLoading } = useUpdateCharacter();
  
  // 캐릭터 삭제를 위한 훅
  const { deleteCharacter, loading: deleteLoading } = useDeleteCharacter();

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
        (char.character_id || char.id) === (character.character_id || character.id)
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
            (char.character_id || char.id) === (updatedCharacter.character_id || updatedCharacter.id) 
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

  const handleDeleteCharacter = async (character) => {
    if (window.confirm(`${character.name} 캐릭터를 삭제하시겠습니까?`)) {
      try {
        const characterId = character.character_id || character.id;
        await deleteCharacter(characterId);
        alert('캐릭터가 성공적으로 삭제되었습니다.');
        await fetchMyCharacters(); // 목록 새로고침
      } catch (error) {
        console.error('Error deleting character:', error);
        alert('캐릭터 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 text-white min-h-screen font-sans flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">캐릭터 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 text-white min-h-screen font-sans flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 text-white min-h-screen font-sans">
      <main className="max-w-screen-xl mx-auto px-6 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-white font-bold md:text-[1.5rem] text-center">내 캐릭터 목록</h1>
          <p className="text-[1rem] text-gray-400">내가 만들거나 저장한 캐릭터 목록이에요</p>
        </header>

        {/* Search and Filter */}
        <div className="mb-8 top-4 z-10 bg-gray-800 py-4">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="캐릭터 이름 또는 설명으로 검색..."
                className="w-full bg-gray-700 text-white placeholder-gray-400 border border-transparent rounded-full py-3 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  aria-label="검색어 지우기"
                >
                  <XCircle className="text-gray-400 hover:text-white" />
                </button>
              )}
            </div>
            {/* 정렬 버튼 제거 */}
          </div>
        </div>

        {/* 버튼 3개: 왼쪽 2개, 오른쪽 1개 */}
        <div className="flex items-center justify-between mb-4 max-w-2xl mx-auto">
          <div className="flex gap-2">
            <button
              className={`px-4 py-2 text-sm sm:text-base font-semibold rounded-full transition-colors ${
                tab === 'created' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => setTab('created') }
            >
              내 캐릭터
            </button>
            <button
              className={`px-4 py-2 text-sm sm:text-base font-semibold rounded-full transition-colors ${
                tab === 'liked' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => setTab('liked')}
            >
              찜한 캐릭터
            </button>
          </div>
          <Link
            to="/createCharacter"
            className="text-sm sm:text-base px-4 py-2 rounded-full font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white transition-all text-center"
          >
            캐릭터 생성
          </Link>
        </div>

        {/* 캐릭터 카드 그리드 */}
        {showCharacters.length === 0 ? (
          <div className="text-center py-20">
            <Search className="mx-auto h-12 w-12 text-gray-500" />
            <h3 className="mt-2 text-lg font-medium text-white">검색 결과가 없습니다</h3>
            <p className="mt-1 text-sm text-gray-400">다른 검색어로 다시 시도해보세요.</p>
          </div>
        ) : (
          <CharacterGrid
            characters={showCharacters}
            myId={userId}
            tab={tab}
            likedIds={likedIds}
            onLikeToggle={handleLikeToggle}
            onEdit={handleEditCharacter}
            onDelete={handleDeleteCharacter}
            onSelect={handleEditCharacter}
          />
        )}

        {/* 캐릭터 상세 모달 제거됨 - 이제 캐릭터 클릭시 바로 수정 모달이 열림 */}

        {editingCharacter && tab === 'created' && (
          <CharacterEditModal
            character={editingCharacter}
            liked={likedIds.includes(editingCharacter.character_id || editingCharacter.id)}
            onClose={() => {
              setEditingCharacter(null);
              resetCharacter(); // 상세 정보 리셋
            }}
            onSave={handleSaveCharacter}
            onLikeToggle={handleLikeToggle}
          />
        )}

        {editingCharacter && tab === 'liked' && (
          <CharacterProfile
            character={editingCharacter}
            liked={likedIds.includes(editingCharacter.character_id || editingCharacter.id)}
            onClose={() => {
              setEditingCharacter(null);
              resetCharacter(); // 상세 정보 리셋
            }}
            onLikeToggle={handleLikeToggle}
          />
        )}
      </main>
    </div>
  );
}
