"use client";
import AIStrategyImage from '@/assets/serviceCards/ai-transformation-strategy.jpg';
import IntelligenceDeploymentImage from '@/assets/serviceCards/intelligence-deployment.jpg';
import AISystemsImage from '@/assets/serviceCards/ai-systems-infrastructure.jpg';
import { Tabs } from "@/components/react/Tabs";
import type { ReactNode } from 'react';

export function ServiceTabs() {
  const tabs = [
    {
      title: "AI Transformation Strategy",
    
      value: "it-consulting",
      description: (<><strong className="text-outline font-medium">Decide where AI creates the most leverage.</strong> We map opportunities, risks, teams, and first moves so leadership can turn ambition into an executable transformation plan.</>),
      content: (
        <div className="w-full overflow-hidden relative h-full rounded-2xl p-10 text-xl md:text-5xl font-medium text-white bg-gradient-to-br  from-primary-black to-outline/60 group leading-relaxed">
          <p className="z-50 relative">AI Transformation Strategy</p>
          <ServiceImage image={AIStrategyImage} alt="Abstract AI strategy map with connected decision nodes" description={<><strong className="text-outline font-medium md:text-3xl text-normal">Decide where AI creates the most leverage.</strong> We map opportunities, risks, teams, and first moves so leadership can turn ambition into an executable transformation plan.</>} />
        </div>
      ),
    },
    {
      title: "Intelligence Deployment",
     
      value: "web-development",
      description: (<><strong className="text-outline font-medium">Deploy intelligence into the work itself.</strong> We build agents, copilots, automations, and decision tools that plug into real workflows and create measurable operational advantage.</>),
      content: (
        <div className="w-full overflow-hidden relative h-full rounded-2xl p-10 text-xl md:text-4xl font-medium leading-relaxed text-white bg-gradient-to-br from-primary-black to-outline/60 group">
          <p className="z-50 relative">Intelligence Deployment</p>
          <ServiceImage image={IntelligenceDeploymentImage} alt="Abstract intelligence deployment streams flowing into workflows" description={<><strong className="text-outline font-medium md:text-3xl text-normal">Deploy intelligence into the work itself.</strong> We build agents, copilots, automations, and decision tools that plug into real workflows and create measurable operational advantage.</>} />
        </div>
      ),
    },
    {
      title: "AI-Ready Systems",
      value: "ai-automation",
      description: (<><strong className="text-outline font-medium">Build the foundation AI needs to work.</strong> We connect data, tools, interfaces, integrations, security, and governance so intelligence is reliable, usable, and ready to scale.</>),
      content: (
        <div className="w-full overflow-hidden relative h-full rounded-2xl p-10 text-xl md:text-4xl font-medium leading-relaxed text-white bg-gradient-to-br from-primary-black to-outline/60 group">
          <p className="z-50 relative">AI-Ready Systems</p>
          <ServiceImage image={AISystemsImage} alt="Abstract AI systems infrastructure with secure data layers" description={<><strong className="text-outline font-medium md:text-3xl text-normal">Build the foundation AI needs to work.</strong> We connect data, tools, interfaces, integrations, security, and governance so intelligence is reliable, usable, and ready to scale.</>} />
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
        <div className="object-cover object-left-top h-[95%] md:h-[95%] absolute -bottom-5 inset-x-0 w-[95%] rounded-xl mx-auto bg-gradient-to-b from-[#060114]/45 via-[#060114]/72 to-[#060114]/88 z-40 group-hover:scale-[1.02] transition-transform duration-500"/>
      <img
        src={image.src}
        alt={alt}
        width="1000"
        height="1000"
        className="object-cover object-left-top h-[95%] md:h-[95%] absolute -bottom-5 inset-x-0 w-[95%] rounded-xl mx-auto group-hover:scale-[1.02] transition-transform duration-500"
      />
      <div className="relative z-50 flex items-center justify-center h-full px-4 pb-8">
        <p className="text-left md:text-justify text-neutral-200 text-sm sm:text-sm md:text-2xl lg:text-3xl md:font-normal font-normal max-w-4xl mt-10 leading-snug">
          {description}
        </p>
      </div>
    </div>
  );
};
