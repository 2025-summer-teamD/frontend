
import React, { useState } from 'react'
import Sidebar from '../components/sideBar'
import AndrewImg from '/assets/andrew.png'

export default function CreateCharacter() {
  const [activeTab, setActiveTab] = useState('existing')
  const [isPublic, setIsPublic] = useState(true)
  // const [imageFile, setImageFile] = useState(null) // (제거: 미사용)
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
      <div className="pt-[60px] px-8 flex-1 flex overflow-auto">
        {/* 왼쪽 컨텐츠 */}
        <div className="flex-1 pr-8 flex flex-col items-center">
          {/* 페이지 타이틀 */}
          <h2 className="text-white text-2xl font-bold mb-4">
            새 캐릭터 만들기
          </h2>

          {/* 탭 네비 */}
          <div className=" border-b w-[552px] border-gray-600 mb-10">
            {[
              { key: 'custom',   label: '나만의 AI 인격체 만들기' },
              { key: 'existing', label: '실제 캐릭터 가져오기'  },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 ${
                  activeTab === tab.key
                    ? 'text-white border-b-2 border-white'
                    : 'text-gray-400'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 탭 컨텐츠 */}
          {activeTab === 'existing' ? (
            <div className="space-y-6 mb-8 w-[552px]">
              <p className="text-gray-400 text-base font-semibold">
                RAG 기술을 활용하여 실제 인물 정보를 자동으로 가져옵니다.
              </p>
              <input
                type="text"
                placeholder="실존 인물 또는 캐릭터의 이름을 입력하세요."
                className="w-full px-3 py-2 bg-white rounded-lg border border-gray-600 text-gray-700 mb-73"
              />
              {/* 공개 여부 체크박스 */}
              <div className="flex flex-col items-start mb-2">
                <label className="flex items-center gap-2 text-gray-400 text-sm mb-0">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={e => setIsPublic(e.target.checked)}
                    className="accent-[#413ebc]"
                  />
                  다른 사람에게 캐릭터를 공개
                </label>
                <span className="text-sm font-medium text-gray-500 ml-6 mt-0.5">체크 시, 이 캐릭터가 다른 사용자에게도 보여집니다.</span>
              </div>
              <div className="flex gap-4">
                <button className="flex-1 h-10 bg-[#413ebc] hover:bg-[#413ebc]/90 rounded-lg text-white font-bold">
                  캐릭터 검색하기
                </button>
                <button className="flex-1 h-10 bg-[#2d2d2d] hover:bg-[#2d2d2d]/90 rounded-lg text-white font-bold">
                  캐릭터 생성하기
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 mb-8 flex flex-col items-center">
              <p className="text-gray-400 text-base font-semibold ">
                직접 캐릭터의 성격, 말투, 배경 스토리를 설정하여 나만의 AI 인격체를 만들어보세요.
              </p>
              {/* 나만의 캐릭터 생성 폼 */}
              <input
                type="text"
                placeholder="생성할 캐릭터 이름을 입력하세요."
                className="w-[552px] px-3 py-2 bg-white rounded-lg border border-gray-600 text-gray-700"
              />
              <input
                type="text"
                placeholder="캐릭터의 말투를 입력하세요."
                className="w-[552px] px-3 py-2 bg-white rounded-lg border border-gray-600 text-gray-700"
              />
              <input
                type="text"
                placeholder="캐릭터의 성격을 입력하세요."
                className="w-[552px] px-3 py-2 bg-white rounded-lg border border-gray-600 text-gray-700"
              />
              <textarea
                placeholder="추가 설명을 입력하세요."
                className="w-[552px] h-28 p-3 bg-white rounded-lg border border-gray-600 text-gray-700 resize-none"
              />
              {/* 공개 여부 체크박스 */}
              <div className="flex flex-col items-start w-[552px] mb-2">
                <label className="flex items-center gap-2 text-gray-400 text-sm mb-0">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={e => setIsPublic(e.target.checked)}
                    className="accent-[#413ebc]"
                  />
                  다른 사람에게 캐릭터를 공개
                </label>
                <span className="text-sm font-medium text-gray-500 ml-6 mt-0.5">체크 시, 이 캐릭터가 다른 사용자에게도 보여집니다.</span>
              </div>
              <div className="flex gap-4">
                <button className="flex-1 w-[552px] h-10 bg-[#413ebc] hover:bg-[#413ebc]/90 rounded-lg text-white font-bold">
                  캐릭터 만들기
                </button>
              </div>
              
            </div>
          )}
        </div>

        {/* 오른쪽 미리보기 카드 */}
        <div className="w-[328px] flex flex-col items-center mr-20">
          <h3 className="text-white font-bold text-lg mb-4">미리보기</h3>
          <div className="bg-black rounded-xl border border-gray-700 overflow-hidden">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-[338px] object-cover"
            />
            <div className="p-4">
              <h4 className="text-white font-bold text-xl mb-2">
                캐릭터 이름
              </h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                여기에 캐릭터의 성격, 말투, 스토리가 표시됩니다.
                <br />
                입력을 시작하면 내용이 자동으로 업데이트됩니다.
              </p>
            </div>
          </div>
          {/* 이미지 업로드 */}
          <div className="flex flex-col items-start w-full mt-4">
            <span className="text-gray-400 text-base font-semibold mb-2">캐릭터 이미지 업로드</span>
            <label className="inline-block cursor-pointer bg-[#413ebc] hover:bg-[#413ebc]/90 text-white text-sm font-bold py-2 px-4 rounded-lg">
              이미지 선택
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
  )
}
