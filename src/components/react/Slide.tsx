import { memo } from "react";
import { ButtonVariant } from "./Buttons/ButtonVariant";
import type { SlideProps } from "@/components/react/types/carouselTypes";
import { useRef, useCallback, useMemo } from "react";

export const Slide = memo(({ slide, index, current, handleSlideClick }: SlideProps) => {
    const slideRef = useRef<HTMLLIElement>(null);
  
    const imageLoaded = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
      event.currentTarget.style.opacity = "1";
    }, []);
  
    const handleClick = useCallback(() => {
      handleSlideClick(index);
    }, [handleSlideClick, index]);
  
    const { src, button, title } = useMemo(() => slide, [slide]);
  
    return (
      <div className="[perspective:1200px] [transform-style:preserve-3d]">
        <li
          ref={slideRef}
          className="flex flex-1 flex-col items-center justify-center relative text-center text-white opacity-100 transition-all duration-300 ease-in-out w-[70vmin] h-[70vmin] mx-[4vmin] z-10 cursor-pointer"
          onClick={handleClick}
          style={{
            transform:
              current !== index
                ? "scale(0.98) rotateX(8deg)"
                : "scale(1) rotateX(0deg)",
            transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
            transformOrigin: "bottom",
          }}
        >
          <div
            className="absolute top-0 left-0 w-full h-full bg-[#1D1F2F] rounded-[1%] overflow-hidden transition-all duration-150 ease-out"
            style={{
              transform:
                current === index
                  ? "translate3d(calc(var(--x) / 30), calc(var(--y) / 30), 0)"
                  : "none",
            }}
          >
            <img
              className="absolute inset-0 w-[120%] h-[120%] object-cover opacity-100 transition-opacity duration-600 ease-in-out"
              style={{
                opacity: current === index ? 1 : 0.5,
              }}
              alt={title}
              src={src}
              onLoad={imageLoaded}
              loading="eager"
              decoding="sync"
            />
            {current === index && (
              <div className="absolute inset-0 bg-black/40 transition-all duration-1000" />
            )}
          </div>
  
          <article
            className={`relative p-[4vmin] transition-opacity duration-1000 ease-in-out ${
              current === index ? "opacity-100 visible" : "opacity-0 invisible"
            }`}
          >
            <h2 className="text-xl md:text-4xl lg:text-6xl font-archivo-black relative bg-gradient-to-b from-primary-turquoise to-primary-purple bg-clip-text text-transparent">
              {title}
            </h2>
            <div className="flex justify-center mt-6">
              <ButtonVariant
                variant="primary"
                text={button}
                href="/contact"
                target="_blank"
                ariaLabel="Button to request a demo"
              />
            </div>
          </article>
        </li>
      </div>
    );
  });
  
  Slide.displayName = 'Slide';