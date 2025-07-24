import { useAuth } from '@clerk/clerk-react';
import { useEffect } from 'react'; // useEffect를 사용하려면 import 해야 합니다.
import Hero from "../components/Hero";
import PopularCharacters from "../components/PopularCharacters";
import Features from "../components/features";
import ChatPreview from "../components/chatPreview";

function Home() {
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
  }, [isLoaded, isSignedIn, getToken, userId]);

  return (
    <div className="text-white no-scrollbar">
      <Hero />
      <div className="bg-[linear-gradient(to_bottom,_#000034,_#6B7595)] px-4 md:px-8 py-8 md:py-16">
        <PopularCharacters />
        <Features />
        <ChatPreview />
      </div>
    </div>
  );
}

export default Home;
