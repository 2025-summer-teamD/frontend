import { useAuth } from '@clerk/clerk-react';
import { useEffect } from 'react'; // useEffect를 사용하려면 import 해야 합니다.
import Hero from "../components/Hero";
import PopularCharacters from "../components/PopularCharacters";
import Features from "../components/features";
import ChatPreview from "../components/chatPreview";

function Home() {
  // useAuth 훅은 반드시 함수 컴포넌트 내부의 최상위에서 호출되어야 합니다.
  const { getToken, userId, isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      const getClerkToken = async () => {
        const token = await getToken();
        console.log("Clerk Session Token:", token);
        console.log("User ID:", userId);
      };
      getClerkToken();
    }
  }, [isLoaded, isSignedIn, getToken, userId]); // 의존성 배열에 필요한 값들을 포함합니다.

  return (
    <div className="text-white no-scrollbar">
      <Hero />
      <div className="font-rounded w-full mx-auto px-4 py-8 flex flex-col gap-10 items-center justify-center" style={{background:'rgba(10,20,40,0.7)', borderRadius:'2rem', boxShadow:'0 0 32px #0ff8, 0 0 64px #a0f, 0 0 8px #fff2', border:'2px solid #0ff4', backdropFilter:'blur(8px)'}}>
        <section className="w-full mt-8 animate-fadeIn">
          <PopularCharacters />
        </section>
        <section className="w-full mt-8 animate-fadeIn">
          <Features />
        </section>
        <section className="w-full mt-8 animate-fadeIn">
          <ChatPreview />
        </section>
      </div>
    </div>
  );
}

export default Home;

