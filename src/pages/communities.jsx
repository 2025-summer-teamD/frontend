import { useState } from 'react';
import { Link } from 'react-router-dom';
import CharacterProfile from '../components/characterProfile';

  export default function Communities() {
  const [activeTab, setActiveTab] = useState('인기순');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const characters = [
    {
      id: 1,
      name: 'Iron Man',
      image: '/assets/ironman.png',
      description: '천재 발명가이자 아이언맨 슈트를 착용한 토니 스타크',
      likes: '1.3k',
      chats: '27k',
      isOnline: true,
      shares: '10',
      creater: 'Toni Stark',
    },
    {
      id: 2,
      name: 'Karina',
      image: '/assets/karina.png',
      description: '에스파의 멤버이자 리더',
      likes: '4.5k',
      chats: '9.6k',
      isOnline: true,
      shares: '10',
      creater: 'Toni Stark',
    },
    {
      id: 3,
      name: 'Andrew Park',
      description: '천재 개발자 겸 창업가 온라인 비즈니스 분야 전문가',
      image: '/assets/andrew.png',
      likes: '999k',
      chats: '5.2k',
      isOnline: true,
      shares: '10',
      creater: 'Toni Stark',
    },
    {
      id: 4,
      name: 'Moana',
      description: '바다의 부름을 받은 모아나 와이알리키',
      likes: '1.8k',
      chats: '3.2k',
      isOnline: true,
      image: '/assets/moana.png',
      shares: '10',
      creater: 'Toni Stark',
    },
    {
      id: 5,
      name: 'Jaeyook bokum',
      description: '재욱이 복음',
      likes: '2.8k',
      chats: '1.2k',
      isOnline: true,
      image: '/assets/andrew.png',
      shares: '10',
      creater: 'Toni Stark',
    },
    {
      id: 6,
      name: 'Elon Musk',
      description: '혁신 컴퓨터리',
      likes: '1.2k',
      chats: '3.4k',
      isOnline: true,
      image: '/assets/andrew.png',
      shares: '10',
      creater: 'Toni Stark',
    },
    {
      id: 7,
      name: 'Baby',
      description: '아기의 솔직미',
      likes: '17k',
      chats: '3.4k',
      isOnline: true,
      image: '/assets/andrew.png',
      shares: '10',
      creater: 'Toni Stark',
    },
    {
      id: 8,
      name: 'Session',
      description: '쪼꼬미 맞춤 정리',
      likes: '1.3k',
      chats: '3.4k',
      isOnline: true,
      image: '/assets/andrew.png',
      shares: '10',
      creater: 'Toni Stark',
    },
    {
      id: 9,
      name: 'Woo Dohwan',
      description: '배우정직',
      likes: '3.7k',
      chats: '3.4k',
      isOnline: true,
      image: '/assets/andrew.png',
      shares: '10',
      creater: 'Toni Stark',
    },
    {
      id: 10,
      name: 'Sana',
      description: '트와이스 멤버',
      likes: '5.1k',
      chats: '1.4k',
      isOnline: true,
      image: '/assets/andrew.png',
      shares: '10',
      creater: 'Toni Stark',
    }
  ];

  // 검색 필터링
  const filteredCharacters = characters.filter(char => 
    char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    char.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 탭에 따른 정렬
  const sortedCharacters = [...filteredCharacters].sort((a, b) => {
    if (activeTab === '조회수순') {
      return parseInt(b.chats.replace('k', '')) - parseInt(a.chats.replace('k', ''));
    } else {
      return parseInt(b.likes.replace('k', '')) - parseInt(a.likes.replace('k', ''));
    }
  });
  // 채팅 시작 여부 묻기
  const handleStartChat = (characterName) => {
    alert(`${characterName}와의 채팅을 시작하시겠습니까?`);
  };

  const CharacterCard = ({ character }) => (
    <div
      className="bg-gray-800 rounded-4xl overflow-hidden hover:bg-gray-750 transition-all cursor-pointer transform hover:-translate-y-1 hover:shadow-2xl min-w-[14rem] max-w-full"
      onClick={() => setSelectedCharacter(character)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.stopPropagation(); // 클릭과 동일한 동작
        }
      }}
      tabIndex={0} // 포커스 가능하게 만들어줌
      role="group" // optional: 접근성 역할 지정 (또는 'button'으로 변경 가능)
    >
      <div className="relative">
        <div className={`flex items-center justify-center w-full h-full`}>
          <img src={character.image} alt={character.name} className="w-full h-full object-cover flex items-center justify-center" />
        </div>
        
      </div>
      <div className="p-[1rem]">
  {/* 1. 이름 + 채팅 수 */}
  <div className="flex items-center justify-between mb-1">
    <h3 className="text-white font-bold text-medium">
      {character.name}
    </h3>
    <div className="flex items-center text-gray-300">
      <svg
        className="w-3 h-3"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
      <span className="text-xs font-bold ml-1">{character.chats}</span>
    </div>
  </div>

  {/* 2. 설명 + 좋아요 수 */}
  <div className="flex justify-between items-start mb-3">
    <p className="text-gray-400 text-xs line-clamp-2 flex-1 mr-2">
      {character.description}
    </p>
    <div className="flex items-center text-gray-300">
      <svg
        className="w-3 h-3 text-red-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      <span className="text-xs font-bold ml-1">{character.likes}</span>
    </div>
  </div>
</div>
    </div>
  );

  return (
      <div className="flex flex-col h-screen">
        {/* 상단 툴바 제거, 내용만 남김 */}
        <div className="relative flex items-center justify-between gap-[1.5rem] mt-[1.5rem] mb-[2rem] px-[1.5rem] max-w-[100rem] mx-auto w-full">
          {/* 왼쪽: 탭 */}
          <div className="flex gap-[0.5rem] min-w-[16rem] flex-shrink-0 flex-grow ">
            <button 
              className={`px-[2rem] py-[0.5rem] text-sm rounded-l-lg transition-colors ${
                activeTab === '인기순' 
                  ? 'bg-[#413ebc] text-white font-bold' 
                  : 'bg-gray-100 text-black font-bold hover:bg-gray-200'
              }`}
              onClick={() => setActiveTab('인기순')}
            >
              인기순
            </button>
            <button 
              className={`px-[1.6rem] py-[0.5rem] text-sm rounded-r-lg transition-colors ${
                activeTab === '조회수순' 
                  ? 'bg-[#413ebc] text-white font-bold' 
                  : 'bg-gray-100 text-black font-bold hover:bg-gray-200'
              }`}
              onClick={() => setActiveTab('조회수순')}
            >
              조회수순
            </button>
          </div>
          {/* 가운데: 타이틀 */}
          <h1
            className="absolute left-1/2 -translate-x-1/2 text-white font-bold text-[1.625rem] leading-normal font-['Inter']"
            style={{ width: '13.375rem', height: '2.9375rem', flexShrink: 0 }}
          >
            캐릭터 커뮤니티
          </h1>
          {/* 오른쪽: 검색 */}
          <div className="flex items-center justify-end min-w-[20rem] flex-shrink-0 flex-grow gap-0">
            <span className="flex items-center h-[2.5rem] bg-gray-100 rounded-l-lg px-[0.75rem] border-r border-gray-200">
              <svg className="text-gray-400 w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </span>
            <input
              type="text"
              placeholder="캐릭터 검색..."
              className="bg-gray-100 text-black placeholder-gray-400 pr-[1rem] h-[2.5rem] rounded-r-lg text-[1rem] focus:outline-none focus:ring-2 focus:ring-indigo-500 w-[16rem] border-l-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* 캐릭터 그리드 */}
        
        <div className="w-full">
          {sortedCharacters.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
              <svg className="w-16 h-16 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          <p className="text-lg">검색 결과가 없습니다</p>
          <p className="text-sm">다른 검색어로 시도해보세요</p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(16rem,1fr))]">
          {sortedCharacters.map((character) => (
            <CharacterCard key={character.id} character={character} />
          ))}
        </div>
       )}
    </div>
    {selectedCharacter && (
        <CharacterProfile
          character={selectedCharacter}
          onClose={() => setSelectedCharacter(null)}
          origin="communities"
        />
      )}
</div>
  );
}