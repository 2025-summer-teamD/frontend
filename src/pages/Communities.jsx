// src/pages/Communities.jsx
import React, { useState } from 'react';
import { useCommunityCharacters, toggleLike } from '../data/characters';
import { useChatRooms } from '../contexts/ChatRoomsContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';
import PageLayout from '../components/PageLayout';
import { useAuth } from "@clerk/clerk-react";
import CharacterProfile from '../components/CharacterProfile';

export default function Communities() {
  const { getToken } = useAuth();

  const [likedIds, setLikedIds] = useState(() =>
    JSON.parse(localStorage.getItem('likedIds')) || []
  );
  const [activeTab, setActiveTab] = useState('인기순');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('likes');
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  const { characters, loading, error, setCharacters } = useCommunityCharacters(sortBy);
  const { refetch: refetchMyChatCharacters } = useChatRooms();

  React.useEffect(() => {
    localStorage.setItem('likedIds', JSON.stringify(likedIds));
  }, [likedIds]);

  const handleSortChange = (newSort) => {
    setActiveTab(newSort);
    setSortBy(newSort === '인기순' ? 'likes' : 'usesCount');
  };

  const handleLikeToggle = async (id) => {
    try {
      if (!id) return;
      const token = await getToken();
      const result = await toggleLike(id, token);

      if (result.data.isLiked) {
        setLikedIds(prev => [...prev, id]);
      } else {
        setLikedIds(prev => prev.filter(x => x !== id));
      }

      const character = characters.find(c => c.id === id);
      if (character) {
        character.likes = result.data.likesCount;
        character.liked = result.data.isLiked;
        setCharacters(prev => [...prev]);
      }
    } catch (error) {
      alert('내가 만든 캐릭터는 찜할 수 없습니다.');
    }
  };

  const filteredCharacters = characters.filter(char => {
    const keyword = searchQuery.toLowerCase();
    return (
      char.name.toLowerCase().includes(keyword) ||
      char.introduction.toLowerCase().includes(keyword)
    );
  });

  const sortedCharacters = [...filteredCharacters].sort((a, b) => {
    const valA = parseFloat(activeTab === '조회수순' ? a.usesCount : a.likes);
    const valB = parseFloat(activeTab === '조회수순' ? b.usesCount : b.likes);
    return valB - valA;
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;

  return (
    <PageLayout className="bg-gradient-to-br from-darkBg via-[#1a1a40] to-[#2d0b4e] min-h-screen flex flex-col items-center justify-center" style={{position:'relative', overflow:'hidden'}}>
      {/* 네온 네모 배경 */}
      <div className="neon-block size1 color1" style={{left:'3vw', top:'7vh'}}></div>
      <div className="neon-block size2 color2" style={{right:'5vw', top:'10vh'}}></div>
      <div className="neon-block size3 color3" style={{left:'8vw', bottom:'10vh'}}></div>
      <div className="neon-block size4 color4" style={{right:'8vw', bottom:'12vh'}}></div>
      <div className="neon-block size5 color5" style={{left:'50vw', top:'80vh'}}></div>
      <div style={{position:'relative', zIndex:1}}>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold neon-text mb-2">캐릭터 커뮤니티</h1>
          <p className="neon-label">[당신이 좋아하는 캐릭터를 찾아보세요]</p>
        </div>

        <div className="flex justify-center mb-12">
          <input
            type="text"
            placeholder=">> SEARCH TARGET [CHARACTER_NAME] OR [DESCRIPTION] <<"
            className="neon-input w-96"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex justify-center gap-4 mb-11">
          <button
            className={`neon-btn px-6 py-2 font-pixel ${activeTab === '인기순' ? 'bg-neonBlue text-darkBg' : ''}`}
            onClick={() => handleSortChange('인기순')}
          >
            인기순
          </button>
          <button
            className={`neon-btn px-6 py-2 font-pixel ${activeTab === '조회수순' ? 'bg-neonPurple text-darkBg' : ''}`}
            onClick={() => handleSortChange('조회수순')}
          >
            조회수순
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 justify-items-center">
          {sortedCharacters.map(character => (
            <div
              key={character.id}
              className="w-56 h-72 neon-card flex flex-col items-center font-pixel"
              onClick={() => setSelectedCharacter(character)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedCharacter(character);
                }
              }}
              role="button"
              tabIndex={0}
              style={{ cursor: 'pointer' }}
            >
              <div className="w-32 h-32 bg-gray-800 rounded-lg mb-3 overflow-hidden flex items-center justify-center">
                <img
                  src={character.imageUrl}
                  alt={character.name || 'Character'}
                  className="w-full h-full object-cover rounded-lg"
                  onError={e => { e.target.src = '/api/image/default-character.svg'; }}
                />
              </div>
              <div className="neon-text text-lg font-bold mb-1 font-pixel">{character.name}</div>
              {/* 만든이 */}
              <div className="text-xs text-gray-400 mb-1 font-pixel">by. {character.creatorName}</div>
              <div className="flex flex-row items-center gap-2 text-xs font-bold mt-auto">
                <div className="border border-[#00f0ff] bg-white/10 px-2 py-1 text-[#00f0ff] min-w-[64px] text-center shadow-neon font-pixel">
                  VIEWS: {character.views || character.usesCount || character.messageCount || 0}
                </div>
                <div className="border border-[#ff00c8] bg-white/10 px-2 py-1 text-[#ff00c8] min-w-[64px] text-center shadow-neon font-pixel">
                  LIKES: {character.likes || 0}
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* 캐릭터 상세 모달 (수정/삭제 버튼 없이) */}
        {selectedCharacter && (
          <CharacterProfile
            character={selectedCharacter}
            liked={likedIds.includes(selectedCharacter.id)}
            origin={"community"}
            onClose={() => setSelectedCharacter(null)}
            onLikeToggle={handleLikeToggle}
          />
        )}
      </div>
    </PageLayout>
  );
}
