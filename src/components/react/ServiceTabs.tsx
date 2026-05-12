"use client";
import AIStrategyImage from '@/assets/serviceCards/ai-transformation-strategy.jpg';
import IntelligenceDeploymentImage from '@/assets/serviceCards/intelligence-deployment.jpg';
import AISystemsImage from '@/assets/serviceCards/ai-systems-infrastructure.jpg';
import { Tabs } from "@/components/react/Tabs";
import type { ReactNode } from 'react';
import type { Locale } from '@/lib/i18n';

export function ServiceTabs({ locale = "en" }: { locale?: Locale }) {
  const isEs = locale === "es";
  const copy = isEs
    ? {
        strategy: {
          title: "Estrategia de Transformación con IA",
          hook: "Decide dónde la IA crea más ventaja.",
          description: "Mapeamos oportunidades, riesgos, equipos y primeros movimientos para que el liderazgo convierta la ambición en un plan de transformación ejecutable.",
          alt: "Mapa abstracto de estrategia de IA con nodos de decisión conectados",
        },
        deployment: {
          title: "Despliegue de Inteligencia",
          hook: "Despliega inteligencia dentro del trabajo real.",
          description: "Construimos agentes, copilotos, automatizaciones y herramientas de decisión que se conectan con flujos reales y crean ventaja operacional medible.",
          alt: "Flujos abstractos de despliegue de inteligencia entrando en sistemas de trabajo",
        },
        systems: {
          title: "Sistemas Listos para IA",
          hook: "Construye la base que la IA necesita para funcionar.",
          description: "Conectamos datos, herramientas, interfaces, integraciones, seguridad y gobernanza para que la inteligencia sea confiable, usable y lista para escalar.",
          alt: "Infraestructura abstracta de sistemas para IA con capas de datos seguras",
        },
      }
    : {
        strategy: {
          title: "AI Transformation Strategy",
          hook: "Decide where AI creates the most leverage.",
          description: "We map opportunities, risks, teams, and first moves so leadership can turn ambition into an executable transformation plan.",
          alt: "Abstract AI strategy map with connected decision nodes",
        },
        deployment: {
          title: "Intelligence Deployment",
          hook: "Deploy intelligence into the work itself.",
          description: "We build agents, copilots, automations, and decision tools that plug into real workflows and create measurable operational advantage.",
          alt: "Abstract intelligence deployment streams flowing into workflows",
        },
        systems: {
          title: "AI-Ready Systems",
          hook: "Build the foundation AI needs to work.",
          description: "We connect data, tools, interfaces, integrations, security, and governance so intelligence is reliable, usable, and ready to scale.",
          alt: "Abstract AI systems infrastructure with secure data layers",
        },
      };

  const tabs = [
    {
      title: copy.strategy.title,
    
      value: "it-consulting",
      description: (<><strong className="text-outline font-medium">{copy.strategy.hook}</strong> {copy.strategy.description}</>),
      content: (
        <div className="w-full overflow-hidden relative h-full rounded-2xl p-10 text-xl md:text-5xl font-medium text-white bg-gradient-to-br  from-primary-black to-outline/60 group leading-relaxed">
          <p className="z-50 relative">{copy.strategy.title}</p>
          <ServiceImage image={AIStrategyImage} alt={copy.strategy.alt} description={<><strong className="text-outline font-medium md:text-3xl text-normal">{copy.strategy.hook}</strong> {copy.strategy.description}</>} />
        </div>
      ),
    },
    {
      title: copy.deployment.title,
     
      value: "web-development",
      description: (<><strong className="text-outline font-medium">{copy.deployment.hook}</strong> {copy.deployment.description}</>),
      content: (
        <div className="w-full overflow-hidden relative h-full rounded-2xl p-10 text-xl md:text-4xl font-medium leading-relaxed text-white bg-gradient-to-br from-primary-black to-outline/60 group">
          <p className="z-50 relative">{copy.deployment.title}</p>
          <ServiceImage image={IntelligenceDeploymentImage} alt={copy.deployment.alt} description={<><strong className="text-outline font-medium md:text-3xl text-normal">{copy.deployment.hook}</strong> {copy.deployment.description}</>} />
        </div>
      ),
    },
    {
      title: copy.systems.title,
      value: "ai-automation",
      description: (<><strong className="text-outline font-medium">{copy.systems.hook}</strong> {copy.systems.description}</>),
      content: (
        <div className="w-full overflow-hidden relative h-full rounded-2xl p-10 text-xl md:text-4xl font-medium leading-relaxed text-white bg-gradient-to-br from-primary-black to-outline/60 group">
          <p className="z-50 relative">{copy.systems.title}</p>
          <ServiceImage image={AISystemsImage} alt={copy.systems.alt} description={<><strong className="text-outline font-medium md:text-3xl text-normal">{copy.systems.hook}</strong> {copy.systems.description}</>} />
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
