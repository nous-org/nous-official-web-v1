"use client";
import { useRef, useState, useEffect } from "react";
import { StickyScroll } from "@/components/react/StickyScroll";
import AiAutomation from "@/assets/products/AiAuto.webp";
import SeamlessIntegration from "@/assets/products/SystemIntegration.webp";
import FutureReadyScalability from "@/assets/products/futureReady.webp";
import CustomDevelopmentPartnership from "@/assets/products/CustomDev.webp";
import { ButtonVariant } from "@/components/react/Buttons/ButtonVariant";

export function StickyServices() {
    const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.001; // 0.5 = mitad de velocidad, 2 = doble velocidad
    }
  }, []);

    const content = [
        {
          title: "Custom Development Partnership",
          description:
            "Our development teams work directly with your business to create tailored technology solutions that fit seamlessly into your existing workflows. From initial planning through final deployment, we maintain constant communication to ensure the delivered software meets your exact operational requirements and business objectives.",
          content: (
            <div className="flex h-full w-full bg-[linear-gradient(to_bottom_right,var(--cyan-500),var(--emerald-500))] text-white ">
             
           <img
                src={CustomDevelopmentPartnership.src}
                width={800}
                height={800}
                className="h-full w-full object-cover opacity-80"
                alt="Custom Development Partnership demo"
              /> 
            </div>
          ),
        },
        {
          title: "AI-Powered Automation",
          description:
            "We transform your repetitive manual processes into intelligent automated systems that operate around the clock. Using artificial intelligence and machine learning, we build solutions that don't just execute tasks but continuously learn and optimize themselves, reducing human error while freeing your team to focus on strategic initiatives.",
          content: (
            <div className="flex h-full w-full text-white">
              
              <img
                src={AiAutomation.src}
                width={800}
                height={800}
                className="h-full w-full object-cover opacity-80"
                alt="AI automation demo"
              />
              
            </div>
          ),
        },
        {
          title: "Seamless System Integration",
          description:
            "We connect all your existing tools and platforms into one cohesive ecosystem. Our integration solutions eliminate data silos and create automated workflows between departments. The result is streamlined operations where information flows freely and processes execute in perfect synchronization across your entire organization.",
          content: (
            <div className="flex h-full w-full bg-[linear-gradient(to_bottom_right,var(--orange-500),var(--yellow-500))] text-white">
               
              <img
                src={SeamlessIntegration.src}
                width={800}
                height={800}
                className="h-full w-full object-cover opacity-80"
                alt="Seamless System Integration demo"
              />
            </div>
          ),
        },
        {
          title: "Future-Ready Scalability",
          description:
            "Every solution we develop is engineered to grow alongside your business. We use modern architectures and cloud technologies that automatically adapt to increased workloads, more users, or new functionality requirements. Your technology investment remains relevant and efficient as your company evolves and expands.",
          content: (
            <div className="flex h-full w-full bg-[linear-gradient(to_bottom_right,var(--cyan-500),var(--emerald-500))] text-white">
              <img
                src={FutureReadyScalability.src}
                width={800}
                height={800}
                className="h-full w-full object-cover opacity-80"
                alt="Future-Ready Scalability demo"
              />
            </div>
          ),
        },
       ];
  return (
    <div className="w-full pt-5 md:pt-44">
      <StickyScroll content={content} />
    </div>
  );
}