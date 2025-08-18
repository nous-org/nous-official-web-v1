import { memo, useMemo } from "react";
import type { CarouselControlProps } from "@/components/react/types/carouselTypes";
import { ArrowRight } from "@/components/react/Icons/Arrows";

export const CarouselControl = memo(({ type, title, handleClick }: CarouselControlProps) => {
    const buttonClassName = useMemo(() => 
      `w-8 h-8 flex items-center mx-2 justify-center bg-neutral-800 border-3 border-transparent rounded-full ${
        type === "previous" ? "rotate-180" : ""
      }`, [type]
    );
  
    return (
      <button
        className={buttonClassName}
        title={title}
        onClick={handleClick}
      >
        <ArrowRight />
      </button>
    );
  });
  
  CarouselControl.displayName = 'CarouselControl';