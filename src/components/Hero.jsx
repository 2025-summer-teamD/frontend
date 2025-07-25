import React, { useState, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';

// 메인화면 컴포넌트 (최적화)
const Hero = memo(() => {
    const navigate = useNavigate();

    // 네비게이션 핸들러 최적화
    const handleCreateCharacter = useCallback(() => {
        navigate('/createCharacter');
    }, [navigate]);

    const handleCommunities = useCallback(() => {
        navigate('/communities');
    }, [navigate]);

    // 마우스 이벤트 최적화
    const handleMouseEnter = useCallback((e) => {
        e.target.style.textShadow = '0 0 8px #0ff, 0 0 16px #f0f';
    }, []);

    const handleMouseLeave = useCallback((e) => {
        e.target.style.textShadow = '0 0 4px #0ff';
    }, []);

    return (
        <section id="home" className="relative w-full h-screen overflow-hidden">
            {/* 지연 로딩을 위한 이미지 최적화 */}
            <img
                src="/assets/_ (1).gif"
                alt="Hero Background"
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
                decoding="async"
            />
            <div className="absolute inset-0 flex flex-col justify-center items-center text-white text-center px-4 md:px-8">
                <h1 className="hero-title text-3xl md:text-5xl lg:text-6xl xl:text-[75px] font-extrabold mb-4 max-w-6xl">
                    나만의 AI 인격체와<br/>자유롭게 대화하세요
                </h1>
                <p className="hero-text max-w-xs md:max-w-2xl lg:max-w-3xl mb-8 md:mb-12 text-sm md:text-lg lg:text-xl xl:text-[20px] text-center font-bold leading-relaxed">
                    지금 이 순간에도 누군가는 새로운 AI를 만나고,나만의 AI친구를 성장시키고 있어요. <br className="hidden md:block"/> 대화로 시작해,연결로 이어지는 특별한 경험을 함께하세요.
                </p>
                <div className="flex flex-col md:flex-row gap-4 md:gap-6 lg:gap-10 w-full max-w-lg md:max-w-none justify-center mt-8 md:mt-12">
                    <button 
                        onClick={handleCreateCharacter}
                        className="flex items-center justify-center w-full md:w-[280px] lg:w-[353px] h-[60px] md:h-[73px] px-4 py-2 text-lg md:text-xl font-semibold rounded-full transition-colors bg-black/30 border-2 border-gray-700 text-gray-400 hover:border-cyan-400 hover:text-cyan-200 hover:shadow-[0_0_8px_#0ff,0_0_16px_#f0f] hover:animate-neonPulse"
                        style={{
                            fontFamily: 'Share Tech Mono, monospace',
                            textShadow: '0 0 4px #0ff',
                        }}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        aria-label="새 인격체 만들기"
                    >
                        새 인격체 만들기
                    </button>
                    <button 
                        onClick={handleCommunities}
                        className="flex items-center justify-center w-full md:w-[280px] lg:w-[353px] h-[60px] md:h-[73px] px-4 py-2 text-lg md:text-xl font-semibold rounded-full transition-colors bg-black/30 border-2 border-gray-700 text-gray-400 hover:border-cyan-400 hover:text-cyan-200 hover:shadow-[0_0_8px_#0ff,0_0_16px_#f0f] hover:animate-neonPulse"
                        style={{
                            fontFamily: 'Share Tech Mono, monospace',
                            textShadow: '0 0 4px #0ff',
                        }}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        aria-label="커뮤니티 둘러보기"
                    >
                        커뮤니티 둘러보기
                    </button>
                </div>
            </div>
        </section>
    );
});

Hero.displayName = 'Hero';

export default Hero;