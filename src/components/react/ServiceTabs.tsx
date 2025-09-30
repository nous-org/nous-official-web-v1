"use client";
import ItServiceImage from '@/assets/serviceCards/ITConsulting.webp';
import WebDevelopmentImage from '@/assets/serviceCards/WebDevelopment.webp';
import AIAutomationImage from '@/assets/serviceCards/IaAtutomation.webp';
import { Tabs } from "@/components/react/Tabs";
import type { ReactNode } from 'react';

export function ServiceTabs() {
  const tabs = [
    {
      title: "Technology Advisory",
    
      value: "it-consulting",
      description: (<><strong className="text-accent font-extrabold text-shadow-lg text-shadow-accent">We help you make confident technology decisions.</strong> From current-state audit to a 90-day roadmap, we design the right architecture, pick the right tools, and plan a realistic rollout—secure, scalable, and maintainable.</>),
      content: (
        <div className="w-full overflow-hidden relative h-full rounded-2xl p-10 text-xl md:text-5xl font-semibold text-white bg-gradient-to-br  from-primary-black to-accent group leading-relaxed">
          <p className="z-50 relative">Technology Advisory</p>
          <ServiceImage image={ItServiceImage} alt="Technology Advisory service" description={<><strong className="text-neutral-200 font-extrabold text-shadow-sm text-shadow-accent md:text-4xl text-normal">We help you make confident technology decisions.</strong> From current-state audit to a 90-day roadmap, we design the right architecture, pick the right tools, and plan a realistic rollout—secure, scalable, and maintainable.</>} />
        </div>
      ),
    },
    {
      title: "Web Development",
     
      value: "web-development",
      description: (<><strong className="text-accent font-extrabold text-shadow-lg text-shadow-accent">We build fast, accessible web experiences that convert.</strong> From UX/UI and design systems to Astro/React builds and Core Web Vitals, we ship clean, maintainable code and measurable performance—robust, standards-based, and SEO-ready.</>),
      content: (
        <div className="w-full overflow-hidden relative h-full rounded-2xl p-10 text-xl md:text-4xl font-semibold leading-relaxed text-white bg-gradient-to-br from-primary-black to-accent group">
          <p className="z-50 relative">Web Development</p>
          <ServiceImage image={WebDevelopmentImage} alt="Web Development service" description={<><strong className="text-neutral-200 font-extrabold text-shadow-sm text-shadow-accent md:text-4xl text-normal">We build fast, accessible web experiences that convert.</strong> From UX/UI and design systems to Astro/React builds and Core Web Vitals, we ship clean, maintainable code and measurable performance—robust, standards-based, and SEO-ready.</>} />
        </div>
      ),
    },
    {
      title: "AI Automation",
      value: "ai-automation",
      description: (<><strong className="text-accent font-extrabold text-shadow-lg text-shadow-accent">We turn repetitive processes into AI-powered workflows.</strong> WhatsApp intake & routing, scheduling, document extraction, email-to-ticket triage, and CRM & payment sync—reliable by design, measurable end-to-end, and compliant.</>),
      content: (
        <div className="w-full overflow-hidden relative h-full rounded-2xl p-10 text-xl md:text-4xl font-semibold leading-relaxed text-white bg-gradient-to-br from-primary-black to-accent group">
          <p className="z-50 relative">AI Automation</p>
          <ServiceImage image={AIAutomationImage} alt="AI Automation service" description={<><strong className="text-neutral-200 font-extrabold text-shadow-sm text-shadow-accent md:text-4xl text-normal">We turn repetitive processes into AI-powered workflows.</strong> WhatsApp intake & routing, scheduling, document extraction, email-to-ticket triage, and CRM & payment sync—reliable by design, measurable end-to-end, and compliant.</>} />
        </div>
      ),
    },
    
  ];

  return (
    <div className="h-[20rem] md:h-[40rem] [perspective:1000px] relative flex flex-col max-w-7xl mx-auto w-full  items-start justify-start mb-28">
      <Tabs tabs={tabs}  />
    </div>
  );
}

const ServiceImage = ({ image, alt, description }: { image: any; alt: string; description: ReactNode }) => {
  return (
    <div className="relative w-full h-full flex flex-col justify-end items-center ">
        <div className="object-cover object-left-top h-[95%] md:h-[95%] absolute -bottom-5 inset-x-0 w-[95%] rounded-xl mx-auto bg-black opacity-64 z-40 group-hover:scale-[1.02] transition-transform duration-500"/>
      <img
        src={image.src}
        alt={alt}
        width="1000"
        height="1000"
        className="object-cover object-left-top h-[95%] md:h-[95%] absolute -bottom-5 inset-x-0 w-[95%] rounded-xl mx-auto blur-[0.5px] group-hover:scale-[1.02] transition-transform duration-500"
      />
      <div className="relative z-50 flex items-center justify-center h-full px-4 pb-8">
        <p className="text-center text-neutral-200 text-sm sm:text-sm md:text-3xl lg:text-4xl md:font-medium font-medium max-w-3xl mt-10">
          {description}
        </p>
      </div>
    </div>
  );
};
