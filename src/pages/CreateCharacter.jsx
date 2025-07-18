import React, { useState } from 'react'
import Sidebar from '../components/SideBar'
import AndrewImg from '/assets/andrew.png'

export default function CreateCharacter() {
  const [activeTab, setActiveTab] = useState('existing')
  const [isPublic, setIsPublic] = useState(true)
  const [imagePreview, setImagePreview] = useState(AndrewImg)
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드할 수 있습니다.')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('이미지 크기는 5MB 이하여야 합니다.')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result)
      reader.onerror = () => alert('이미지 읽기에 실패했습니다.')
      reader.readAsDataURL(file)
    }
  }

  const handleTagKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault()

      if (tags.length >= 5) {
        alert('태그는 최대 5개까지 입력할 수 있어요.')
        return
      }

      const rawTag = tagInput.trim().replace(/^#+/, '').replace(/[,]+$/, '')

      if (rawTag && !tags.includes(rawTag)) {
        setTags([...tags, rawTag])
      }

      setTagInput('')
    }
  }

  const removeTag = (indexToRemove) => {
    setTags(tags.filter((_, index) => index !== indexToRemove))
  }

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
              } ${
                index === 0 ? 'rounded-l-lg' : 'rounded-r-lg'
              }`}
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
                <div className="mb-6">
                  <h3 className="text-white text-xl font-bold mb-3">나만의 AI 인격체 만들기</h3>
                  <p className="text-gray-400 text-base">
                    캐릭터의 성격, 말투, 배경 스토리를 직접 설정하세요.
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">캐릭터 이름</label>
                    <input
                      type="text"
                      placeholder="이름"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#413ebc] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">말투</label>
                    <input
                      type="text"
                      placeholder="예: 정중하고 따뜻한"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#413ebc] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">성격</label>
                    <input
                      type="text"
                      placeholder="예: 활발하고 긍정적인"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#413ebc] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">추가 설명</label>
                    <textarea
                      placeholder="배경 스토리 등"
                      className="w-full h-32 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-[#413ebc] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">태그 (Enter 또는 , 로 추가)</label>
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      placeholder="예: #상냥함, #귀여움"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#413ebc] focus:outline-none"
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

                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isPublic}
                        onChange={e => setIsPublic(e.target.checked)}
                        className="mt-1 accent-[#413ebc] w-4 h-4"
                      />
                      <div>
                        <span className="text-white text-sm font-medium">다른 사람에게 공개</span>
                        <p className="text-gray-400 text-xs mt-1">체크 시 이 캐릭터는 공유됩니다.</p>
                      </div>
                    </label>
                  </div>

                  <div className="pt-4">
                    <button className="w-full h-12 bg-[#413ebc] hover:bg-[#5b58d4] rounded-lg text-white font-bold transition-all">
                      캐릭터 만들기
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full xl:w-[25rem]">
              <div className="xl:sticky xl:top-4">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
                  <h3 className="text-white font-bold text-xl mb-6 text-center">미리보기</h3>

                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-600 overflow-hidden shadow-2xl">
                    <div className="relative p-6">
                      <img src={imagePreview} alt="Preview" className="w-full h-72 object-contain" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>
                    <div className="p-6">
                      <h4 className="text-white font-bold text-xl mb-3">캐릭터 이름</h4>
                      <p className="text-gray-400 text-sm leading-relaxed mb-2">
                        여기에 성격, 말투, 설명 등이 표시됩니다.
                      </p>
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {tags.map((tag, index) => (
                            <span key={index} className="bg-[#413ebc] text-white px-3 py-1 rounded-full text-xs">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-white text-sm font-medium mb-3">캐릭터 이미지 업로드</label>
                    <label className="group flex flex-col items-center justify-center w-full h-24 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer hover:bg-gray-700/50 transition-all">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-6 h-6 mb-2 text-gray-400 group-hover:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17,8 12,3 7,8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        <p className="text-xs text-gray-400 group-hover:text-gray-300">이미지 선택 또는 드래그</p>
                      </div>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">최대 5MB, JPG/PNG/GIF</p>
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
