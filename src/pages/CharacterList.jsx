<<<<<<< HEAD
import Sidebar from '../components/sideBar'
// 내 캐릭터 페이지
export default function CharacterList() {
    return (
      <Sidebar>
        <div className="pt-[60px] px-8 flex-1 flex overflow-auto">
          <div className="flex-1 pr-8 flex flex-col items-center">
            <h2 className="text-white text-2xl font-bold mb-4">
              내 캐릭터
            </h2>
          </div>
        </div>
      </Sidebar>
=======

// 내 캐릭터 페이지
export default function CharacterList() {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-gray-900 text-white">
        <h1 className="text-3xl font-bold">내 캐릭터</h1>
      </div>
>>>>>>> d5356a3aa336112c67fd9fe06fae3e734853fdcd
    )
  }