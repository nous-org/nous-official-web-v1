"use client";
import React, { useEffect, useRef, useState } from "react";
import { useMotionValueEvent, useScroll } from "motion/react";
import { motion } from "motion/react";

// Función de utilidad cn simulada (reemplaza con tu implementación)
const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(" ");

export const StickyScroll = ({
  content,
  contentClassName,
  className,
}: {
  content: {
    title: string;
    description: string;
    content?: React.ReactNode | any;
  }[];
  contentClassName?: string;
  className?: string;
}) => {
  const [activeCard, setActiveCard] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  
  // Usar el scroll de la página completa, no del contenedor
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start center", "end center"],
  });
  
  const cardLength = content.length;

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const cardsBreakpoints = content.map((_, index) => index / cardLength);
    const closestBreakpointIndex = cardsBreakpoints.reduce(
      (acc, breakpoint, index) => {
        const distance = Math.abs(latest - breakpoint);
        if (distance < Math.abs(latest - cardsBreakpoints[acc])) {
          return index;
        }
        return acc;
      },
      0,
    );
    setActiveCard(closestBreakpointIndex);
  });

  const backgroundColors = [
    "#060114", // slate-900
    "#060114", // black
    "#060114", // neutral-900
  ];
  
  const linearGradients = [
    "linear-gradient(to bottom right, #060114, #060114)", // cyan-500 to emerald-500
    "linear-gradient(to bottom right, #060114, #060114)", // pink-500 to indigo-500
    "linear-gradient(to bottom right, #060114, #060114)", // orange-500 to yellow-500
  ];

  const [backgroundGradient, setBackgroundGradient] = useState(
    linearGradients[0],
  );

  useEffect(() => {
    setBackgroundGradient(linearGradients[activeCard % linearGradients.length]);
  }, [activeCard]);

  // Datos de ejemplo
  const sampleContent = content?.length ? content : [
    {
      title: "Diseño Colaborativo",
      description: "Trabajamos juntos para crear experiencias digitales que conecten con tu audiencia y reflejen la esencia de tu marca.",
      content: (
        <div className="h-full w-full bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center">
          <div className="text-white text-center p-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Colaboración</h3>
            <p className="text-sm opacity-90">Equipos trabajando en armonía</p>
          </div>
        </div>
      ),
    },
    {
      title: "Desarrollo Ágil",
      description: "Implementamos metodologías ágiles para entregar productos de alta calidad de manera eficiente y adaptable.",
      content: (
        <div className="h-full w-ful sflex items-center justify-center">
          <div className="text-white text-center p-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Agilidad</h3>
            <p className="text-sm opacity-90">Procesos optimizados</p>
          </div>
        </div>
      ),
    },
    {
      title: "Innovación Constante",
      description: "Mantenemos un enfoque de mejora continua, adoptando las últimas tecnologías y mejores prácticas del mercado.",
      content: (
        <div className="h-full w-full bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center">
          <div className="text-white text-center p-4">
            <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Innovación</h3>
            <p className="text-sm opacity-90">Siempre hacia el futuro</p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className={cn("w-full px-4", className)}>
      <motion.div
        animate={{
          backgroundColor: backgroundColors[activeCard % backgroundColors.length],
        }}
        className="relative flex min-h-screen justify-center rounded-md "
        ref={ref}
      >
        {/* Contenido de texto */}
        <div className="relative flex items-start w-full max-w-2xl">
          <div className="w-full">
            {sampleContent.map((item, index) => (
              <div key={item.title + index} className="my-20 first:mt-10 last:mb-10">
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: activeCard === index ? 1 : 0.3 }}
                  className="text-2xl md:text-3xl font-bold text-slate-100"
                  transition={{ duration: 0.3 }}
                >
                  {item.title}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: activeCard === index ? 1 : 0.3 }}
                  className="text-base md:text-lg mt-6 md:mt-10 md:max-w-7xl lg:max-w-sm text-slate-300 leading-relaxed"
                  transition={{ duration: 0.3 }}
                >
                  {item.description}
                </motion.p>
              </div>
            ))}
            
            {/* Espaciado final para permitir scroll completo */}
            <div className="h-0 md:h-40 " />
          </div>
        </div>

        {/* Contenido sticky lateral */}
        <div
          style={{ background: backgroundGradient }}
          className={cn(
            "sticky top-[490px] hidden h-60 w-full overflow-hidden rounded-md bg-white lg:block transition-all duration-500",
            contentClassName,
          )}
        >
          <motion.div
            key={activeCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="h-full w-full"
          >
            {sampleContent[activeCard]?.content ?? null}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};