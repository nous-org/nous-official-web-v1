import { memo, useMemo } from "react";
import type { CarouselProps, SlideData } from "@/components/react/types/carouselTypes";
import { useCarousel } from "@/components/react/hooks/useCarousel";
import { Slide } from "@/components/react/Slide";
import { CarouselControl } from "@/components/react/CarouselControl";

export const Carousel = memo(({ slides, initialSlide = 1, swipeThreshold = 50 }: CarouselProps) => {
  // Usar el hook personalizado para toda la lógica del carousel
  const carousel = useCarousel({
    slidesLength: slides.length,
    initialSlide,
    swipeThreshold
  });

  // Clases memoizadas para optimización
  const containerClassName = useMemo(() => 
    `relative w-[70vmin] h-[70vmin] mx-auto ${carousel.isTouchDevice ? 'select-none' : ''}`, 
    [carousel.isTouchDevice]
  );

  const ulClassName = useMemo(() => 
    `absolute flex mx-[-4vmin] ${carousel.isDragging && carousel.isTouchDevice ? 'transition-none' : 'transition-transform duration-1000 ease-in-out'}`,
    [carousel.isDragging, carousel.isTouchDevice]
  );

  const ulStyle = useMemo(() => ({
    transform: carousel.transform,
    cursor: carousel.isTouchDevice ? (carousel.isDragging ? 'grabbing' : 'grab') : 'default',
  }), [carousel.transform, carousel.isTouchDevice, carousel.isDragging]);

  const controlsClassName = useMemo(() => 
    `absolute flex justify-center w-full top-[calc(100%+1rem)] ${carousel.isDragging && carousel.isTouchDevice ? 'pointer-events-none opacity-50' : ''} hidden sm:flex`,
    [carousel.isDragging, carousel.isTouchDevice]
  );

  // Datos de ejemplo
  const sampleSlides: SlideData[] = slides?.length ? slides : [
    {
      title: "Demo",
      button: "Descubrir más",
      src: ''
    },
    {
      title: "Demo", 
      button: "Ver experiencias",
      src: ''
    },
    {
      title: "Portfolio",
      button: "Crear recuerdos", 
      src: ''
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-auto p-[2vmin]">
      <div
        className={containerClassName}
        aria-labelledby={`carousel-heading-${carousel.id}`}
        onTouchStart={carousel.isTouchDevice ? carousel.handleTouchStart : undefined}
        onTouchMove={carousel.isTouchDevice ? carousel.handleTouchMove : undefined}
        onTouchEnd={carousel.isTouchDevice ? carousel.handleTouchEnd : undefined}
      >
        <ul
          className={ulClassName}
          style={ulStyle}
        >
          {sampleSlides.map((slide, index) => (
            <Slide
              key={`slide-${index}-${slide.title}`}
              slide={slide}
              index={index}
              current={carousel.current}
              handleSlideClick={carousel.handleSlideClick}
            />
          ))}
        </ul>

        {/* Controles de escritorio */}
        <div className={controlsClassName}>
          <CarouselControl
            type="previous"
            title="Go to previous slide"
            handleClick={carousel.handlePreviousClick}
          />

          <CarouselControl
            type="next"
            title="Go to next slide"
            handleClick={carousel.handleNextClick}
          />
        </div>
        
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 sm:hidden">
          <div className="flex space-x-2">
            {sampleSlides.map((_, index) => (
              <button
                key={`dot-${index}`}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === carousel.current ? 'bg-white' : 'bg-white/30'
                }`}
                onClick={() => carousel.goToSlide(index)}
                aria-label={`Ir al slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

    </div>
  );
});

Carousel.displayName = 'Carousel';