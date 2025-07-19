// src/pages/CharacterList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// import CharacterProfile from '../components/CharacterProfile'; // 더 이상 사용하지 않음
import CharacterEditModal from '../components/CharacterEditModal';
import CharacterSearchBar from '../components/CharacterSearchBar'; // 필요하다면 다시 활성화
import CharacterGrid from '../components/CharacterGrid';
import { useMyCharacters, useCharacterDetail, useUpdateCharacter } from '../data/characters'; // 수정된 useMyCharacters 훅과 useCharacterDetail, useUpdateCharacter 임포트
import { useAuth } from '@clerk/clerk-react';

export default function CharacterList() {
  const myId = useAuth().userId;

  const [likedIds, setLikedIds] = useState(() =>
    JSON.parse(localStorage.getItem('likedIds')) || []
  );
  useEffect(() => {
    localStorage.setItem('likedIds', JSON.stringify(likedIds));
  }, [likedIds]);

  const [tab, setTab] = useState('created'); // 'created' 또는 'liked'
  const [searchQuery, setSearchQuery] = useState(''); // 검색어 상태
  // const [selectedCharacter, setSelectedCharacter] = useState(null); // 더 이상 사용하지 않음
  const [editingCharacter, setEditingCharacter] = useState(null);

  // useMyCharacters 훅은 이제 'tab' 파라미터를 받지 않고 모든 'created' 캐릭터를 가져옵니다.
  const { characters, loading, error } = useMyCharacters();
  
  // 캐릭터 상세 정보를 가져오는 훅
  const { character: detailCharacter, loading: detailLoading, fetchCharacterDetail, resetCharacter } = useCharacterDetail();
  
  // 캐릭터 수정을 위한 훅
  const { updateCharacter, loading: updateLoading } = useUpdateCharacter();

  // 좋아요 누른 캐릭터 목록 (전체 캐릭터에서 필터링)
  const likedCharacters = characters.filter(
    c => likedIds.includes(c.id) &&
      (c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       c.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // 현재 탭에 따라 보여줄 캐릭터 목록 결정
  const showCharacters = tab === 'liked' ? likedCharacters : characters;

  const handleLikeToggle = (id, newLiked) => {
    setLikedIds(prev =>
      newLiked ? [...prev, id] : prev.filter(x => x !== id)
    );
  };

  const handleEditCharacter = async (character) => {
    try {
      // API를 통해 상세 정보 가져오기
      const detailData = await fetchCharacterDetail(character.character_id || character.id);
      setEditingCharacter(detailData);
    } catch (error) {
      console.error('Error fetching character detail:', error);
      // API 호출 실패 시 기본 데이터 사용
      setEditingCharacter(character);
      alert('캐릭터 상세 정보를 불러오는데 실패했습니다. 기본 정보로 열립니다.');
    }
  };

  const handleSaveCharacter = async (id, formData) => {
    try {
      console.log('Saving character:', id, formData);
      
      // API를 통해 캐립터 수정
      const updatedCharacter = await updateCharacter(id, {
        introduction: formData.description,
        personality: formData.personality,
        tone: formData.tone,
        tag: formData.tags
      });
      
      console.log('Character updated successfully:', updatedCharacter);
      
      // 성공 메시지 표시
      alert('캐릭터 정보가 성공적으로 업데이트되었습니다!');
    } catch (error) {
      console.error('Error saving character:', error);
      alert('캐릭터 저장 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteCharacter = character => {
    if (window.confirm(`${character.name} 캐릭터를 삭제하시겠습니까?`)) {
      // 삭제 로직 구현
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
          <h1 className="text-white font-bold md:text-[1rem] text-center">내 캐릭터 목록</h1>
          <p className="text-[1rem] text-gray-400">내가 만들거나 저장한 캐릭터 목록이에요</p>
        </header>

        {/* Search Bar (주석 처리됨, 필요하면 활성화) */}
        {/* <div className="mb-8 top-4 z-10 bg-gray-800 py-4">
          <div className="max-w-2xl mx-auto">
            <CharacterSearchBar value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
        </div> */}

        {/* 버튼 3개: 왼쪽 2개, 오른쪽 1개 */}
        <div className="flex items-center justify-between mb-4 max-w-2xl mx-auto">
          <div className="flex gap-2">
            <button
              className={`px-4 py-2 rounded-lg font-bold text-[0.8rem]  ${tab === 'created' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => setTab('created') }
            >
              Characters
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-bold text-[0.8rem] ${tab === 'liked' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => setTab('liked')}
            >
              Liked
            </button>
          </div>
          <Link
            to="/createCharacter"
            className=" text-[0.8rem] px-4 py-2 rounded-lg font-bold bg-gradient-to-r from-[#413ebc] to-[#413ebc] text-white hover:from-indigo-600 hover:to-purple-700 transition-all text-center"
          >
            + New
          </Link>
        </div>

        {/* 캐릭터 카드 그리드 */}
        {showCharacters.length === 0 ? (
          <div className="text-center py-20">
            <svg className="mx-auto h-12 w-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-white">검색 결과가 없습니다</h3>
            <p className="mt-1 text-sm text-gray-400">다른 검색어로 다시 시도해보세요.</p>
          </div>
        ) : (
          <CharacterGrid
            characters={showCharacters}
            myId={myId}
            tab={tab}
            likedIds={likedIds}
            onLikeToggle={handleLikeToggle}
            onEdit={handleEditCharacter}
            onDelete={handleDeleteCharacter}
            onSelect={handleEditCharacter}
          />
        )}

        {/* 캐릭터 상세 모달 제거됨 - 이제 캐릭터 클릭시 바로 수정 모달이 열림 */}

        {editingCharacter && (
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
      </main>
    </div>
  );
}
