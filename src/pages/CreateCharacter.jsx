import React, { useState } from 'react'
import Sidebar from '../components/SideBar'
import AndrewImg from '/assets/andrew.png'
import { useAuth, useUser } from "@clerk/clerk-react";
import { getSafeImageUrl } from '../utils/imageUtils';

export default function CreateCharacter() {
  const [activeTab, setActiveTab] = useState('custom')
  const [isPublic, setIsPublic] = useState(true)
  const [imagePreview, setImagePreview] = useState(AndrewImg)
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [isComposing, setIsComposing] = useState(false)

  const [name, setName] = useState('')
  const [tone, setTone] = useState('')
  const [personality, setPersonality] = useState('')
  const [description, setDescription] = useState('')
  const [characterQuery, setCharacterQuery] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const { getToken } = useAuth();
  const { user } = useUser(); // username을 가져오기 위해 useUser 추가

  // username 정보 출력 (디버깅용)
  React.useEffect(() => {
    if (user) {
      console.log('CreateCharacter - User info:', {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName
      });
    }
  }, [user]);


  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' && !isComposing) {
      e.preventDefault()
      const rawTag = tagInput.trim().replace(/^#+/, '')
      if (!rawTag || tags.includes(rawTag)) return
      if (tags.length >= 5) {
        alert('태그는 최대 5개까지 입력할 수 있어요.')
        return
      }
      setTags([...tags, rawTag])
      setTagInput('')
    }
  }

  const removeTag = (indexToRemove) => {
    setTags(tags.filter((_, index) => index !== indexToRemove))
  }

  // 캐릭터 생성 API 연동 함수
  const handleCreateCharacter = async (e) => {
    e.preventDefault();
    if (!name || !tone || !personality || !description) {
      alert("모든 필드를 입력해주세요.");
      return;
    }
    try {
      setIsCreating(true);
      const token = await getToken();
      
      const requestData = {
        name,
        image_url: "http://localhost:3001/api/uploads/default-character.svg", // 기본 이미지 사용
        is_public: isPublic,
        prompt: {
          tone,
          personality,
          tag: tags.join(","),
        },
        description,
        creator_name: user?.username || user?.firstName || user?.fullName || '사용자',
      };
      
      console.log('CreateCharacter - 전송할 데이터:', requestData);
      
      const response = await fetch("http://localhost:3001/api/characters/custom", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });
      if (!response.ok) {
        const err = await response.json();
        console.error('서버 응답:', err); // 서버 응답 전체 로그
        throw new Error(err.message || "캐릭터 생성 실패");
      }
      alert("캐릭터가 성공적으로 생성되었습니다!");
      
      // 폼 초기화
      setName('');
      setTone('');
      setPersonality('');
      setDescription('');
      setTags([]);
      setImagePreview(AndrewImg);
      setIsPublic(true);
      
      // 성공 후 캐릭터 목록 페이지로 이동 (선택사항)
      // window.location.href = '/characterList';
      
    } catch (err) {
      alert(err.message || "에러가 발생했습니다.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="relative flex flex-col items-center justify-center gap-6 mt-[2rem] mb-[2rem] px-[1.5rem] max-w-[100rem] mx-auto w-full">
        <div className="text-center">
          <h1 className="text-white font-bold md:text-[1.5rem] text-center">새 캐릭터 만들기</h1>
          <p className="md:text-[1rem] text-gray-400">나만의 AI 인격체를 만들어보세요.</p>
        </div>

        <div className="flex gap-[0.5rem] w-full max-w-[30rem]">
          {[
            { key: 'custom', label: '나만의 AI 인격체 만들기' },
            { key: 'existing', label: '실제 캐릭터 가져오기' },
          ].map((tab, index) => (
            <button
              key={tab.key}
              className={`flex-1 px-[1rem] py-[0.75rem] text-sm md:text-base font-medium transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-[#413ebc] text-white shadow-lg'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
              } ${index === 0 ? 'rounded-l-lg' : 'rounded-r-lg'}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 px-[1.5rem] overflow-auto">
        <main className="max-w-[100rem] mx-auto no-scrollbar">
          <div className="flex flex-col xl:flex-row gap-8 xl:gap-12 items-start no-scrollbar">
            <div className="flex-1 w-full">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gray-700">
                {activeTab === 'custom' ? (
                  <>
                    <div className="mb-6">
                      <h3 className="text-white text-xl font-bold mb-3">나만의 AI 인격체 만들기</h3>
                      <p className="text-gray-400 text-base">캐릭터의 성격, 말투, 배경 스토리를 직접 설정하세요.</p>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-white text-sm font-medium mb-2">캐릭터 이름</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white" placeholder="이름" />
                      </div>

                      <div>
                        <label className="block text-white text-sm font-medium mb-2">말투</label>
                        <input type="text" value={tone} onChange={(e) => setTone(e.target.value)} className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white" placeholder="예: 정중하고 따뜻한" />
                      </div>

                      <div>
                        <label className="block text-white text-sm font-medium mb-2">성격</label>
                        <input type="text" value={personality} onChange={(e) => setPersonality(e.target.value)} className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white" placeholder="예: 활발하고 긍정적인" />
                      </div>

                      <div>
                        <label className="block text-white text-sm font-medium mb-2">추가 설명</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full h-32 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none" placeholder="배경 스토리 등" />
                      </div>

                      <div>
                        <label className="block text-white text-sm font-medium mb-2">태그 (Enter로 추가)</label>
                        <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown} onCompositionStart={() => setIsComposing(true)} onCompositionEnd={() => setIsComposing(false)} className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white" placeholder="예: 상냥함, 귀여움 등" />
                        <div className="flex flex-wrap gap-2 mt-2">
                          {tags.map((tag, index) => (
                            <span key={index} className="bg-[#413ebc] text-white px-3 py-1 rounded-full text-sm flex items-center">
                              {tag}
                              <button onClick={() => removeTag(index)} className="ml-2 text-gray-200 hover:text-white">×</button>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="bg-gray-700/50 rounded-lg p-4">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} className="mt-1 accent-[#413ebc] w-4 h-4" />
                          <div>
                            <span className="text-white text-sm font-medium">다른 사람에게 공개</span>
                            <p className="text-gray-400 text-xs mt-1">체크 시 이 캐릭터는 공유됩니다.</p>
                          </div>
                        </label>
                      </div>

                      <div className="pt-4">
                        <button 
                          className={`w-full h-12 rounded-lg text-white font-bold transition-all ${
                            isCreating 
                              ? 'bg-gray-500 cursor-not-allowed' 
                              : 'bg-[#413ebc] hover:bg-[#5b58d4]'
                          }`} 
                          onClick={handleCreateCharacter}
                          disabled={isCreating}
                        >
                          {isCreating ? '생성 중...' : '캐릭터 만들기'}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-white text-xl font-bold mb-3">실제 캐릭터 가져오기</h3>
                    <p className="text-gray-400 text-base mb-6">존재하는 캐릭터의 이름을 입력해 검색하세요.</p>
                    <input
                      type="text"
                      value={characterQuery}
                      onChange={(e) => setCharacterQuery(e.target.value)}
                      placeholder="예: 해리 포터"
                      className="w-full px-4 py-3 mb-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                    />
                    <div className="text-gray-400 text-sm">* 검색 API는 추후 연동 예정입니다.</div>
                    <div className="bg-gray-700/50 rounded-lg p-4 mt-6">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} className="mt-1 accent-[#413ebc] w-4 h-4" />
                        <div>
                          <span className="text-white text-sm font-medium">다른 사람에게 공개</span>
                          <p className="text-gray-400 text-xs mt-1">체크 시 이 캐릭터는 공유됩니다.</p>
                        </div>
                      </label>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 미리보기 및 이미지 업로드는 공통 */}
            <div className="w-full xl:w-[25rem]">
              <div className="xl:sticky xl:top-4">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
                  <h3 className="text-white font-bold text-xl mb-6 text-center">미리보기</h3>

                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-600 overflow-hidden shadow-2xl">
                    <div className="relative p-6">
                      <img 
                        src={getSafeImageUrl(imagePreview)} 
                        alt="Preview" 
                        className="w-full h-72 object-contain"
                        onError={(e) => {
                          e.target.src = '/api/uploads/default-character.svg';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>
                    <div className="p-6">
                      <h4 className="text-white font-bold text-xl mb-2">{name || '캐릭터 이름'}</h4>
                      <p className="text-gray-400 text-sm mb-1">{tone && `말투: ${tone}`}</p>
                      <p className="text-gray-400 text-sm mb-1">{personality && `성격: ${personality}`}</p>
                      <p className="text-gray-400 text-sm leading-relaxed mb-2">{description || '여기에 성격, 말투, 설명 등이 표시됩니다.'}</p>
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {tags.map((tag, index) => (
                            <span key={index} className="bg-[#413ebc] text-white px-3 py-1 rounded-full text-xs">#{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>


                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
