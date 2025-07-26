import Hero from "../components/Hero";
import PopularCharacters from "../components/PopularCharacters";
import Features from "../components/Features";
import ChatPreview from "../components/ChatPreview";

function Home() {
  return (
    <div className="text-white no-scrollbar" style={{background: 'linear-gradient(to bottom, #1A1A2E 0%, #1a237e 25%, #2E3A8C 50%, #483D8B 75%, #7b68ee 100%)'}}>
      <Hero />
      <section className="w-full animate-fadeIn pt-16 md:pt-24 lg:pt-32">
        <PopularCharacters />
      </section>
      <section className="w-full animate-fadeIn pt-16 md:pt-24 lg:pt-32">
        <Features />
      </section>
      <section className="w-full animate-fadeIn pt-16 md:pt-24 lg:pt-32">
        <ChatPreview />
      </section>
    </div>
  );
}

export default Home;

