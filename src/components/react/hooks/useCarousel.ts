import { useState, useRef, useId, useCallback, useMemo, memo } from "react";

interface UseCarouselOptions {
    slidesLength: number;
    initialSlide?: number;
    swipeThreshold?: number;
    velocityThreshold?: number;
  }
  
  interface UseCarouselReturn {
    // Estado
    current: number;
    isDragging: boolean;
    dragOffset: number;
    
    // Acciones de navegación
    handlePreviousClick: () => void;
    handleNextClick: () => void;
    handleSlideClick: (index: number) => void;
    goToSlide: (index: number) => void;
    
    // Eventos touch/drag
    handleTouchStart: (e: React.TouchEvent) => void;
    handleTouchMove: (e: React.TouchEvent) => void;
    handleTouchEnd: (e: React.TouchEvent) => void;
    
    // Propiedades calculadas
    transform: string;
    isTouchDevice: boolean;
    
    // Utilidades
    id: string;
  }
  
  export const useCarousel = ({
    slidesLength,
    initialSlide = 1,
    swipeThreshold = 50,
    velocityThreshold = 0.3
  }: UseCarouselOptions): UseCarouselReturn => {
    const [current, setCurrent] = useState(initialSlide);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [dragOffset, setDragOffset] = useState(0);
    
    const id = useId();
  
    // Detección de dispositivo táctil - memoizado
    const isTouchDevice = useMemo(() => 
      typeof window !== 'undefined' && 'ontouchstart' in window, []
    );
  
    // Handlers de navegación - memoizados
    const handlePreviousClick = useCallback(() => {
      const previous = current - 1;
      setCurrent(previous < 0 ? slidesLength - 1 : previous);
    }, [current, slidesLength]);
  
    const handleNextClick = useCallback(() => {
      const next = current + 1;
      setCurrent(next === slidesLength ? 0 : next);
    }, [current, slidesLength]);
  
    const handleSlideClick = useCallback((index: number) => {
      if (current !== index && !isDragging) {
        setCurrent(index);
      }
    }, [current, isDragging]);
  
    const goToSlide = useCallback((index: number) => {
      if (index >= 0 && index < slidesLength) {
        setCurrent(index);
      }
    }, [slidesLength]);
  
    // Handlers touch/drag - memoizados
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX, y: touch.clientY });
      setDragOffset(0);
    }, []);
  
    const handleTouchMove = useCallback((e: React.TouchEvent) => {
      if (!isDragging) return;
      
      const touch = e.touches[0];
      const deltaX = touch.clientX - dragStart.x;
      const deltaY = touch.clientY - dragStart.y;
      
      // Solo manejar swipes horizontales
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        e.preventDefault();
        setDragOffset(deltaX);
      }
    }, [isDragging, dragStart.x, dragStart.y]);
  
    const handleTouchEnd = useCallback((e: React.TouchEvent) => {
      if (!isDragging) return;
      
      setIsDragging(false);
      
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - dragStart.x;
      const deltaY = touch.clientY - dragStart.y;
      
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        const distance = Math.abs(deltaX);
        
        if (distance > swipeThreshold) {
          if (deltaX > 0) {
            handlePreviousClick();
          } else {
            handleNextClick();
          }
        }
      }
      
      setDragOffset(0);
    }, [isDragging, dragStart.x, dragStart.y, swipeThreshold, handlePreviousClick, handleNextClick]);
  
    // Cálculo de transform - memoizado
    const transform = useMemo(() => {
      const baseTransform = -current * (100 / slidesLength);
      const dragTransform = isDragging && isTouchDevice ? (dragOffset / (typeof window !== 'undefined' ? window.innerWidth : 1000)) * 20 : 0;
      return `translateX(${baseTransform + dragTransform}%)`;
    }, [current, slidesLength, isDragging, isTouchDevice, dragOffset]);
  
    return {
      // Estado
      current,
      isDragging,
      dragOffset,
      
      // Acciones
      handlePreviousClick,
      handleNextClick,
      handleSlideClick,
      goToSlide,
      
      // Eventos touch
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
      
      // Propiedades calculadas
      transform,
      isTouchDevice,
      
      // Utilidades
      id
    };
  };
  