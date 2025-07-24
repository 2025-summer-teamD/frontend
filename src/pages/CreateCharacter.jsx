import React, { useState } from 'react'
import Sidebar from '../components/SideBar'
import CAMERA from '/assets/image-preview.png'
import { useAuth, useUser } from "@clerk/clerk-react";
import { getSafeImageUrl } from '../utils/imageUtils';
import NeonPageLayout from '../components/NeonPageLayout';
import TabButton from '../components/TabButton';
import Button from '../components/Button';
import Input from '../components/Input';
import Textarea from '../components/Textarea';
import Checkbox from '../components/Checkbox';
import SwipeableImageGallery from '../components/SwipeableImageGallery';

export default function CreateCharacter() {
  const [activeTab, setActiveTab] = useState('custom')
  const [isPublic, setIsPublic] = useState(true)
  const [imagePreview, setImagePreview] = useState(CAMERA)
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [isComposing, setIsComposing] = useState(false)

  const [name, setName] = useState('')
  const [tone, setTone] = useState('')
  const [personality, setPersonality] = useState('')
  const [description, setDescription] = useState('')
  const [characterQuery, setCharacterQuery] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [imageFile, setImageFile] = useState(null);
  const [fetchingAi, setFetchingAi] = useState(false);
  const [fetchAiError, setFetchAiError] = useState('');
  const [imageUrls, setImageUrls] = useState([]); // 이미지 URL 목록

  const { getToken } = useAuth();
  const { user } = useUser(); // username을 가져오기 위해 useUser 추가

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


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
    setTags(tags.filter((_, i) => i !== indexToRemove))
  }

  // 캐릭터 생성 API 연동 함수
  const handleCreateCharacter = async (e) => {
    e.preventDefault();
    if (!name || !tone || !personality || !description) {
      alert("모든 필드를 입력해주세요.");
      return;
    }
    if (!imageFile && imagePreview === CAMERA) {
      alert("사진을 넣어주세요.");
      return;
    }
    try {
      setIsCreating(true);
      const token = await getToken();

      const formData = new FormData();
      formData.append('name', name);
      formData.append('isPublic', isPublic ? 'true' : 'false'); // 문자열로 변환
      formData.append('description', description);
      formData.append('creatorName', user?.username || user?.firstName || user?.fullName || '사용자');
      formData.append('prompt', JSON.stringify({ tone, personality, tag: tags.join(",") }));
      if (imageFile) {
        formData.append('image', imageFile);
      } else if (imagePreview && imagePreview !== CAMERA) {
        try {
          // URL에서 이미지 다운로드
          const response = await fetch(imagePreview);
          const blob = await response.blob();

          // 파일명 생성 (URL에서 추출하거나 기본값 사용)
          const filename = imagePreview.split('/').pop() || 'image.jpg';

          // File 객체로 변환
          const file = new File([blob], filename, { type: blob.type });

          formData.append('image', file);
        } catch (error) {
          console.error('이미지 다운로드 실패:', error);
          // 실패시 URL 그대로 사용
          formData.append('imageUrl', imagePreview);
        }
      }
      const response = await fetch(`${API_BASE_URL}/characters/custom`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Content-Type은 직접 지정하지 마세요!
        },
        body: formData,
      });
      if (!response.ok) {
        const err = await response.json();
        console.error('서버 응답:', err); // 서버 응답 전체 로그
        throw new Error(err.message || "캐릭터 생성 실패");
      }

      // 폼 초기화
      setName('');
      setTone('');
      setPersonality('');
      setDescription('');
      setTags([]);
      setImagePreview(imagePreview);
      setIsPublic(true);

      window.location.href = '/characterList';

    } catch (err) {
      alert(err.message || "에러가 발생했습니다.");
    } finally {
      setIsCreating(false);
    }
  };

  // --- 실제 캐릭터 가져오기(기존 캐릭터 AI 생성) 핸들러 추가 ---
  async function handleFetchExistingCharacter(name) {
    setFetchingAi(true);
    setFetchAiError('');
    try {
      const token = await getToken();
      const res = await fetch('/api/characters/existing/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
        credentials: 'include', // 인증 필요시
      });
      const data = await res.json();
      if (res.ok && data && (data.persona || data.data)) {
        const persona = data.persona || data.data;
        setName(persona.name || '');
        setTone(persona.tone || (persona.prompt && persona.prompt.tone) || '');
        setPersonality(persona.personality || (persona.prompt && persona.prompt.personality) || '');
        setDescription(persona.description || '');
        setTags(persona.tag ? persona.tag.split(',') : (persona.prompt && persona.prompt.tag ? persona.prompt.tag.split(',') : []));
        setImagePreview(persona.image || persona.imageUrl || persona.prompt.imageUrl[1] || persona.imageUrlPreview || persona.imageUrlOriginal || CAMERA);
        setImageUrls(persona.imageUrl || persona.prompt.imageUrl || []); // 이미지 URL 목록 설정
      } else {
        setFetchAiError(data.error || '캐릭터 정보를 가져오지 못했습니다.');
      }
    } catch (err) {
      setFetchAiError('네트워크 오류 또는 서버 에러');
    } finally {
      setFetchingAi(false);
    }
  }

  return (
    <NeonPageLayout
      title="새 캐릭터 만들기"
      subtitle="나만의 AI 인격체를 만들어보세요"
    >
      <div className="flex justify-center gap-4 mb-12">
        <button className={`neon-btn px-6 py-2 ${activeTab === 'custom' ? 'bg-neonBlue text-darkBg' : ''}`} onClick={() => setActiveTab('custom')}>나만의 AI 인격체 만들기</button>
        <button className={`neon-btn px-6 py-2 ${activeTab === 'existing' ? 'bg-neonPurple text-darkBg' : ''}`} onClick={() => setActiveTab('existing')}>실제 캐릭터 가져오기</button>
      </div>
      {/* 폼과 미리보기 영역을 하나의 flex-col md:flex-row로 묶어서 배치 */}
      <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start justify-center w-full max-w-5xl mx-auto">
        <div className="flex-1 w-full max-w-2xl neon-card p-8">
          {activeTab === 'custom' ? (
            <>
              <div className="mb-6">
                <h3 className="text-white text-xl font-bold mb-3">나만의 AI 인격체 만들기</h3>
                <p className="text-gray-400 text-base">캐릭터의 성격, 말투, 배경 스토리를 직접 설정하세요.</p>
              </div>

              <div className="space-y-6">
                <Input
                  label="캐릭터 이름"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="이름"
                />

                <Input
                  label="말투"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  placeholder="예: 정중하고 따뜻한"
                />

                <Input
                  label="성격"
                  value={personality}
                  onChange={(e) => setPersonality(e.target.value)}
                  placeholder="예: 활발하고 긍정적인"
                />

                <Textarea
                  label="추가 설명"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="배경 스토리 등"
                />

                <div>
                  <label className="block text-white text-sm font-medium mb-2">태그 (Enter로 추가)</label>
                  <Input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    onCompositionStart={() => setIsComposing(true)}
                    onCompositionEnd={() => setIsComposing(false)}
                    placeholder="예: 상냥함, 귀여움 등"
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag, index) => (
                      <span key={index} className="bg-[#413ebc] text-white px-3 py-1 rounded-full text-sm flex items-center">
                        {tag}
                        <button onClick={() => removeTag(index)} className="ml-2 text-gray-200 hover:text-white">×</button>
                      </span>
                    ))}
                  </div>
                </div>
                <Checkbox
                  label="다른 사람에게 공개"
                  checked={isPublic}
                  onChange={e => setIsPublic(e.target.checked)}
                  className="bg-transparent px-1 py-1"
                />

                <Button
                  onClick={handleCreateCharacter}
                  disabled={isCreating}
                  fullWidth
                >
                  {isCreating ? '생성 중...' : '캐릭터 만들기'}
                </Button>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-white text-xl font-bold mb-3">실제 캐릭터 가져오기</h3>
              <p className="text-gray-400 text-base mb-6">존재하는 캐릭터의 이름을 입력해 검색하세요. 사진은 직접 업로드 해주세요.</p>
              <Input
                type="text"
                value={characterQuery}
                onChange={(e) => setCharacterQuery(e.target.value)}
                placeholder="존재하는 캐릭터의 이름을 입력하세요."
              />
              <div className="flex items-center gap-2 mt-2 justify-between">
                <Checkbox
                  label="다른 사람에게 공개"
                  checked={isPublic}
                  onChange={e => setIsPublic(e.target.checked)}
                  className="bg-transparent px-1 py-1"
                />
                <button
                  onClick={() => handleFetchExistingCharacter(characterQuery)}
                  disabled={fetchingAi || !characterQuery.trim()}
                  className="bg-[#413ebc] text-white px-3 py-1 rounded disabled:opacity-50"
                >
                  {fetchingAi ? '가져오는 중...' : '가져오기'}
                </button>
              </div>
              {fetchAiError && <div className="text-red-500 text-xs mt-1">{fetchAiError}</div>}
              <Button
                onClick={handleCreateCharacter}
                disabled={isCreating}
                fullWidth
                className="mt-6"
              >
                {isCreating ? '생성 중...' : '캐릭터 만들기'}
              </Button>
            </>
          )}
        </div>
        {/* 미리보기 */}
        <div className="w-full md:w-[28rem] neon-card p-8 flex flex-col items-center">
          <h3 className="neon-text font-bold text-2xl mb-6 text-center">미리보기</h3>
          <div className="w-full h-80 bg-gray-900 rounded-xl flex items-center justify-center mb-4 overflow-hidden">
            {imageUrls && imageUrls.length > 1 ? (
              <SwipeableImageGallery
                imageUrls={imageUrls}
                getSafeImageUrl={getSafeImageUrl}
                setImagePreview={setImagePreview}
                imagePreview={imagePreview}
              />
            ) : (
              <img 
                src={getSafeImageUrl(imagePreview)} 
                alt="Preview" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.src = '/api/uploads/default-character.svg';
                }}
              />
            )}
          </div>
          <div className="flex flex-col items-center mt-2 mb-4 w-full">
            <label className="block neon-label text-xs font-medium mb-1">캐릭터 이미지 업로드</label>
            <input
              type="file"
              accept="image/*"
              onChange={e => {
                const file = e.target.files[0];
                setImageFile(file);
                if (file) {
                  setImagePreview(URL.createObjectURL(file));
                } else {
                  setImagePreview(CAMERA);
                }
              }}
              className="text-white text-xs text-center file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-[#413ebc] file:text-white file:text-xs hover:file:bg-[#5a4ee5] transition-colors duration-150"
            />
          </div>
          <div className="w-full p-4">
            <h4 className="neon-text font-bold text-xl mb-2 text-center">{name || '캐릭터 이름'}</h4>
            {/* 미리보기 설명 영역 */}
            {!(tone || personality || description) && (
              <p className="text-gray-400 text-sm leading-relaxed mb-2 text-center">여기에 성격, 말투, 설명 등이 표시됩니다.</p>
            )}
            {tone && <p className="text-neonBlue text-sm mb-1 text-center">말투: {tone}</p>}
            {personality && <p className="text-neonBlue text-sm mb-1 text-center">성격: {personality}</p>}
            {description && <p className="text-neonBlue text-sm leading-relaxed mb-2 text-center">{description}</p>}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 justify-center">
                {tags.map((tag, index) => (
                  <span key={index} className="bg-neonPurple text-white px-3 py-1 rounded-full text-xs">#{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </NeonPageLayout>
  );
}
