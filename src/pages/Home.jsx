import Hero from "../components/hero";
import PopularCharacters from "../components/popularCharacters";
import Features from "../components/features";
import ChatPreview from "../components/chatPreview";
import { Link } from 'react-router-dom';

// 메인 홈 페이지
function Home() {
  return (
    <>
        <Hero/>
        <div
          className="
            bg-[linear-gradient(to_bottom,_#000034,_#6B7595)] text-white px-8 py-16
          "
        >
          <PopularCharacters />
          <Features />
          <ChatPreview />
        </div>
    </>
  );
}
export default Home;