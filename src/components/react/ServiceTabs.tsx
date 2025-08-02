"use client";
import ItServiceImage from '@/assets/serviceCards/ITConsulting.png';
import WebDevelopmentImage from '@/assets/serviceCards/WebDevelopment.png';
import AIAutomationImage from '@/assets/serviceCards/IaAtutomation.png';
import { Tabs } from "@/components/react/Tabs";

export function ServiceTabs() {
  const tabs = [
    {
      title: "IT Consulting",
    
      value: "it-consulting",
      description: "We offer IT consulting services focused on identifying opportunities for technological improvement, optimizing infrastructure, and aligning digital solutions with your business's strategic objectives.",
      content: (
        <div className="w-full overflow-hidden relative h-full rounded-2xl p-10 text-xl md:text-4xl font-bold text-white bg-gradient-to-br  from-primary-black to-primary-turquoise group">
          <p className="z-50 relative">IT Consulting</p>
          <ServiceImage image={ItServiceImage} alt="IT Consulting service" description="We offer IT consulting services focused on identifying opportunities for technological improvement, optimizing infrastructure, and aligning digital solutions with your business's strategic objectives." />
        </div>
      ),
    },
    {
      title: "Web Development",
     
      value: "web-development",
      description: "Combining best practices in responsive design, optimized speed, and cutting-edge technologies like React, Astro, and Tailwind CSS. We create personalized, scalable, and user-centric digital experiences.",
      content: (
        <div className="w-full overflow-hidden relative h-full rounded-2xl p-10 text-xl md:text-4xl font-bold text-white bg-gradient-to-br from-primary-black to-primary-turquoise group">
          <p className="z-50 relative">Web Development</p>
          <ServiceImage image={WebDevelopmentImage} alt="Web Development service" description="Combining best practices in responsive design, optimized speed, and cutting-edge technologies like React, Astro, and Tailwind CSS. We create personalized, scalable, and user-centric digital experiences." />
        </div>
      ),
    },
    {
      title: "AI Automation",
      value: "ai-automation",
      description: "We boost operational efficiency through advanced automation powered by artificial intelligence. We design and implement solutions that optimize workflows, integrate chatbots, analyze data in real time, and reduce repetitive tasks. ",
      content: (
        <div className="w-full overflow-hidden relative h-full rounded-2xl p-10 text-xl md:text-4xl font-bold text-white bg-gradient-to-br from-primary-black to-primary-turquoise group">
          <p className="z-50 relative">AI Automation</p>
          <ServiceImage image={AIAutomationImage} alt="AI Automation service" description="We boost operational efficiency through advanced automation powered by artificial intelligence. We design and implement solutions that optimize workflows, integrate chatbots, analyze data in real time, and reduce repetitive tasks." />
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

const ServiceImage = ({ image, alt, description }: { image: any; alt: string; description: string }) => {
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
        <p className="text-center text-white text-sm sm:text-sm md:text-3xl lg:text-4xl md:font-bold font-medium max-w-3xl mt-10">
          {description}
        </p>
      </div>
    </div>
  );
};
