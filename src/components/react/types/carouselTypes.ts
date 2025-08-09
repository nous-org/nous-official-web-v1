export interface SlideData {
    title: string;
    button: string;
    src: string;
  }
  
export interface SlideProps {
    slide: SlideData;
    index: number;
    current: number;
    handleSlideClick: (index: number) => void;
  }
  
export interface CarouselControlProps {
    type: string;
    title: string;
    handleClick: () => void;
  }
  
export interface CarouselProps {
    slides: SlideData[];
    initialSlide?: number;
    swipeThreshold?: number;
  }