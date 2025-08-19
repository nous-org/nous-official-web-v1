"use client";
import { ThreeDMarquee } from "@/components/react/Marquee";
import aiAuto from '@/assets/marquee/aiAuto.webp'
import webDev from '@/assets/marquee/CustomDev.webp'
import futureReady from '@/assets/marquee/futureReady.webp'
import chatBot from '@/assets/marquee/chatBot.webp'
import smartProcess from '@/assets/marquee/smartProcess.webp'
import modernWebDev from '@/assets/marquee/modernwebdev.webp'
import nous from '@/assets/marquee/nous.webp'
import ourSolutions from '@/assets/marquee/oursolutions.webp'
import innovation from '@/assets/marquee/innovation.webp'
import powerfulTool from '@/assets/marquee/powerfultool.webp'
import standOut from '@/assets/marquee/standOut.webp'
import AiConsulting from '@/assets/marquee/AIConsulting.webp'
export function ServicesMarquee() {
  const images = [
   
    chatBot.src,
    smartProcess.src,
    standOut.src,
    AiConsulting.src,
    webDev.src,
    futureReady.src,
    modernWebDev.src,
    AiConsulting.src,
    ourSolutions.src,
    innovation.src,
    powerfulTool.src,
    standOut.src,
    aiAuto.src,
    modernWebDev.src,
    nous.src,
    innovation.src,
    smartProcess.src,
    standOut.src,
    aiAuto.src,
    webDev.src,
    nous.src,
    chatBot.src,
    smartProcess.src,
    standOut.src,
    aiAuto.src,
    webDev.src,
    futureReady.src,
    AiConsulting.src,
    ourSolutions.src,
    innovation.src,
    powerfulTool.src,
    futureReady.src,
    AiConsulting.src,
    ourSolutions.src,
    innovation.src,
    powerfulTool.src,
    
  ];
  return (
    <div className="mx-auto my-10 max-w-7xl rounded-md mt-64 mb-64">
      <ThreeDMarquee images={images} />
    </div>
  );
}
