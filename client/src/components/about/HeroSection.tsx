import { ChevronsDown } from "lucide-react";

import { Section } from "@/components/about/Section.tsx";
import { Button } from "@/components/ui/button";

export const HeroSection = () => {
  const scrollToBottom = () => {
    const ctaSection = document.querySelector("#cta-section");
    if (ctaSection) {
      ctaSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <Section className="min-h-screen relative flex flex-col">
      <div className="flex-shrink-0 min-h-[400px] md:min-h-[45vh] flex items-center justify-center p-8">
        <div className="text-center max-w-4xl">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <img
              src="https://denamu.site/files/Denamu_Logo_ENG.svg"
              alt="Denamu English Logo"
              className="w-32 md:w-52"
            />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#27ae60] via-[#2596be] to-[#228be6]">
            개발자를 위한 최고의 블로그 허브
          </h1>
          <p className="text-lg md:text-xl mb-8">기술 블로그를 한눈에 모아보고, 개발자들과 함께 성장하세요.</p>
          <div className="flex items-center justify-center space-x-4">
            <Button size="lg" onClick={scrollToBottom}>
              바로 시작하기
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-grow flex items-start justify-center p-4 md:p-8">
        <img
          src="https://denamu.site/files/about-first.png"
          alt="Service Preview"
          className="max-w-[90%] md:max-w-[80%] h-auto object-contain"
        />
      </div>

      <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2">
        <ChevronsDown className="w-8 h-8 md:w-12 md:h-12 text-gray-400 animate-slow-bounce" />
      </div>
    </Section>
  );
};
