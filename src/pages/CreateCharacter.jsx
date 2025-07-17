import React, { useState } from 'react'
import Sidebar from '../components/SideBar'
import AndrewImg from '/assets/andrew.png'

export default function CreateCharacter() {
  const [activeTab, setActiveTab] = useState('existing')
  const [isPublic, setIsPublic] = useState(true)
  const [imagePreview, setImagePreview] = useState(AndrewImg)

  // 이미지 업로드 핸들러
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 파일 형식 검사: 이미지만 허용
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드할 수 있습니다.');
        return;
      }
      // 파일 크기 검사: 5MB 제한
      if (file.size > 5 * 1024 * 1024) {
        alert('이미지 크기는 5MB 이하여야 합니다.');
        return;
      }
      const reader = new FileReader();

      // 성공 처리
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      // 오류 처리
      reader.onerror = () => {
        alert('이미지 읽기에 실패했습니다.');
      };

      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* 상단 타이틀 & 탭 */}
      <div className="relative flex flex-col items-center justify-center gap-6 mt-[2rem] mb-[2rem] px-[1.5rem] max-w-[100rem] mx-auto w-full">
        {/* 타이틀 */}
        <div className="text-center">
          <h1 className="text-white font-bold md:text-[1.5rem] text-center">새 캐릭터 만들기</h1>
          <p className="md:text-[1rem] text-gray-400">나만의 AI 인격체를 만들어보세요. 실제 캐릭터를 가져오거나 직접 만들 수 있습니다.</p>
        </div>

        {/* 탭 네비게이션 */}
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

      {/* 메인 컨텐츠 */}
      <div className="flex-1 px-[1.5rem] overflow-auto">
        <main className="max-w-[100rem] mx-auto no-scrollbar">
          <div className="flex flex-col xl:flex-row gap-8 xl:gap-12 items-start no-scrollbar">
            {/* 왼쪽 폼 영역 */}
            <div className="flex-1 w-full">
              {activeTab === 'existing' ? (
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gray-700">
                  <div className="mb-6">
                    <h3 className="text-white text-xl font-bold mb-3">실제 캐릭터 가져오기</h3>
                    <p className="text-gray-400 text-base">
                      RAG 기술을 활용하여 실제 인물 정보를 자동으로 가져옵니다.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">캐릭터 이름</label>
                      <input
                        type="text"
                        placeholder="실존 인물 또는 캐릭터의 이름을 입력하세요."
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#413ebc] focus:border-transparent transition-all"
                      />
                    </div>

                    {/* 공개 여부 체크박스 */}
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isPublic}
                          onChange={e => setIsPublic(e.target.checked)}
                          className="mt-1 accent-[#413ebc] w-4 h-4"
                        />
                        <div>
                          <span className="text-white text-sm font-medium">다른 사람에게 캐릭터를 공개</span>
                          <p className="text-gray-400 text-xs mt-1">체크 시, 이 캐릭터가 다른 사용자에게도 보여집니다.</p>
                        </div>
                      </label>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                      <button className="flex-1 h-12 bg-[#413ebc] hover:bg-[#5b58d4] rounded-lg text-white font-bold transition-all duration-200 hover:shadow-lg">
                        캐릭터 검색하기
                      </button>
                      <button className="flex-1 h-12 bg-gray-600 hover:bg-gray-500 rounded-lg text-white font-bold transition-all duration-200">
                        캐릭터 생성하기
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gray-700">
                  <div className="mb-6">
                    <h3 className="text-white text-xl font-bold mb-3">나만의 AI 인격체 만들기</h3>
                    <p className="text-gray-400 text-base">
                      직접 캐릭터의 성격, 말투, 배경 스토리를 설정하여 나만의 AI 인격체를 만들어보세요.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">캐릭터 이름</label>
                      <input
                        type="text"
                        placeholder="생성할 캐릭터 이름을 입력하세요."
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#413ebc] focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-white text-sm font-medium mb-2">말투</label>
                      <input
                        type="text"
                        placeholder="캐릭터의 말투를 입력하세요. (예: 정중하고 친근한 말투)"
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#413ebc] focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-white text-sm font-medium mb-2">성격</label>
                      <input
                        type="text"
                        placeholder="캐릭터의 성격을 입력하세요. (예: 활발하고 긍정적인 성격)"
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#413ebc] focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-white text-sm font-medium mb-2">추가 설명</label>
                      <textarea
                        placeholder="캐릭터의 배경 스토리, 특징, 취미 등을 자세히 설명해주세요."
                        className="w-full h-32 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#413ebc] focus:border-transparent transition-all resize-none"
                      />
                    </div>

                    {/* 공개 여부 체크박스 */}
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isPublic}
                          onChange={e => setIsPublic(e.target.checked)}
                          className="mt-1 accent-[#413ebc] w-4 h-4"
                        />
                        <div>
                          <span className="text-white text-sm font-medium">다른 사람에게 캐릭터를 공개</span>
                          <p className="text-gray-400 text-xs mt-1">체크 시, 이 캐릭터가 다른 사용자에게도 보여집니다.</p>
                        </div>
                      </label>
                    </div>

                    <div className="pt-4">
                      <button className="w-full h-12 bg-[#413ebc] hover:bg-[#5b58d4] rounded-lg text-white font-bold transition-all duration-200 hover:shadow-lg">
                        캐릭터 만들기
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 오른쪽 미리보기 사이드바 */}
            <div className="w-full xl:w-[25rem] xl:flex-shrink-0">
              <div className="xl:sticky xl:top-4">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
                  <h3 className="text-white font-bold text-xl mb-6 text-center">미리보기</h3>

                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-600 overflow-hidden shadow-2xl">
                    <div className="relative p-6">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-72 object-contain"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    </div>
                    <div className="p-6">
                      <h4 className="text-white font-bold text-xl mb-3">
                        캐릭터 이름
                      </h4>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        여기에 캐릭터의 성격, 말투, 스토리가 표시됩니다.
                        입력을 시작하면 내용이 자동으로 업데이트됩니다.
                      </p>
                    </div>
                  </div>

                  {/* 이미지 업로드 */}
                  <div className="mt-6">
                    <label className="block text-white text-sm font-medium mb-3">캐릭터 이미지 업로드</label>
                    <label className="group flex flex-col items-center justify-center w-full h-24 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer hover:bg-gray-700/50 transition-all">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-6 h-6 mb-2 text-gray-400 group-hover:text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17,8 12,3 7,8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        <p className="text-xs text-gray-400 group-hover:text-gray-300">이미지 파일을 선택하거나 드래그하세요</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">JPG, PNG, GIF 파일만 업로드 가능 (최대 5MB)</p>
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
