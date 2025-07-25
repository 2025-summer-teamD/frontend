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
    <div className="text-white no-scrollbar" style={{background: 'linear-gradient(to bottom, #2D1B69 0%, #1A1A2E 50%, #16213E 100%)'}}>
      <Hero />
      <section className="w-full animate-fadeIn">
        <PopularCharacters />
      </section>
      <section className="w-full animate-fadeIn">
        <Features />
      </section>
      <section className="w-full animate-fadeIn">
        <ChatPreview />
      </section>
    </div>
  );
}

export default Home;

