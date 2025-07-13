import Hero from "../components/hero";
import PopularCharacters from "../components/popularCharacters";
import Features from "../components/features";
import ChatPreview from "../components/chatPreview";

function Home() {
  return (
    <div className="text-white">
      <Hero />
      <div className="bg-[linear-gradient(to_bottom,_#000034,_#6B7595)] px-8 py-16">
        <PopularCharacters />
        <Features />
        <ChatPreview />
      </div>
    </div>
  );
}

export default Home;
