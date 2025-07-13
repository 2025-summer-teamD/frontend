
import React, { useState } from 'react'
import Sidebar from '../components/sideBar'
import AndrewImg from '/assets/andrew.png'

export default function CreateCharacter() {
  const [activeTab, setActiveTab] = useState('existing')

  return (
    <Sidebar>
      {/* 페이지 본문: Header 높이 만큼 패딩 */}
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
              <p className="text-gray-400 text-sm">
                RAG 기술을 활용하여 실제 인물 정보를 자동으로 가져옵니다.
              </p>
              <input
                type="text"
                placeholder="실존 인물 또는 캐릭터의 이름을 입력하세요."
                className="w-full px-3 py-2 bg-white rounded-lg border border-gray-600 text-gray-700 mb-73"
              />
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
              <p className="text-gray-400 text-sm ">
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
              src={AndrewImg}
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
        </div>
      </div>
    </Sidebar>
  )
}
