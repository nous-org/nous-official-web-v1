"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type Tab = {
  title: string;
  value: string;
  content?: string | React.ReactNode | any;
};

export const Tabs = ({
  tabs: propTabs,
  containerClassName,
  activeTabClassName,
  tabClassName,
  contentClassName,
}: {
  tabs: Tab[];
  containerClassName?: string;
  activeTabClassName?: string;
  tabClassName?: string;
  contentClassName?: string;
}) => {
  const [active, setActive] = useState<Tab>(propTabs[0]);
  const [tabs, setTabs] = useState<Tab[]>(propTabs);

  const moveSelectedTabToTop = (idx: number) => {
    const newTabs = [...propTabs];
    const selectedTab = newTabs.splice(idx, 1);
    newTabs.unshift(selectedTab[0]);
    setTabs(newTabs);
    setActive(newTabs[0]);
  };

  const [hovering, setHovering] = useState(false);

  return (
    <>
      <div
        className={cn(
          "flex flex-row items-center justify-start [perspective:1000px] relative overflow-auto sm:overflow-visible no-visible-scrollbar max-w-full w-full h-[4rem] z-50 gap-2 sm:gap-4 px-2 sm:px-0 pb-6",
          containerClassName
        )}
      >
        {propTabs.map((tab, idx) => (
          <button
            key={tab.title}
            onClick={() => {
              moveSelectedTabToTop(idx);
            }}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            className={cn("relative px-2 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 h-auto rounded-full min-w-0 flex-shrink-0", tabClassName)}
            style={{
              transformStyle: "preserve-3d",
            }}
          >
            {active.value === tab.value && (
              <motion.div
                layoutId="clickedbutton"
                transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                className={cn(
                  "absolute inset-0 bg-accent/30 border border-outline rounded-full h-8 sm:h-10 md:h-12 lg:h-auto",
                  activeTabClassName
                )}
              />
            )}

            <span className="relative block text-white text-xs sm:text-sm md:text-base lg:text-lg font-medium whitespace-nowrap hover:cursor-pointer">
              {tab.title}
            </span>
          </button>
        ))}
      </div>
      <FadeInDiv
        tabs={tabs}
        active={active}
        key={active.value}
        hovering={hovering}
        className={cn("mt-6 sm:mt-8 md:mt-12 lg:mt-14", contentClassName)}
      />
    </>
  );
};

export const FadeInDiv = ({
  className,
  tabs,
}: {
  className?: string;
  key?: string;
  tabs: Tab[];
  active: Tab;
  hovering?: boolean;
}) => {
  const [animationValue, setAnimationValue] = useState(40);

  useEffect(() => {
    const updateAnimationValue = () => {
      setAnimationValue(window.innerWidth >= 768 ? 80 : 40);
    };

    // Set initial value
    updateAnimationValue();

    // Add resize listener
    window.addEventListener('resize', updateAnimationValue);

    // Cleanup
    return () => window.removeEventListener('resize', updateAnimationValue);
  }, []);

  const isActive = (tab: Tab) => {
    return tab.value === tabs[0].value;
  };
  return (
    <div className="relative w-full h-full ">
      {tabs.map((tab, idx) => (
        <motion.div
          key={tab.value}
          layoutId={tab.value}
          style={{
            zIndex: -idx,
          }}
          animate={{
            y: isActive(tab) ? [0, 30, 0] : 0,
            top: idx * -animationValue,
            scale: 1 - idx * 0.2,
            opacity: idx < 3 ? 1 - idx * 0.1 : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            mass: 0.8,
            top: { duration: 0.5, ease: "easeInOut" },
            y: { duration: 0.8, ease: "easeInOut" },
            scale: { duration: 0.6, ease: "easeInOut" },
            opacity: { duration: 0.4, ease: "easeInOut" },
            layout: { duration: 0.6, ease: "easeInOut" }
          }}
          className={cn("w-full h-full absolute top-0 left-0", className)}
        >
          {tab.content}
        </motion.div>
      ))}
    </div>
  );
};
