
import { Globe } from "./Globe";
import type { Locale } from "@/lib/i18n";

interface MethodOfWorkProps {
    title?: string;
    subtitle?: string;
    locale?: Locale;
    description?: string;

   // Card content interfaces
    automationCard?: {
        title?: string;
        subtitle?: string;
        description?: string;
        
    };
    consultingCard?: {
        title?: string;
        subtitle?: string;
        description?: string;
    };
    webDevCard?: {
        title?: string;
        subtitle?: string;
        description?: string;
    };
    
    className?: string;
   
}



export const MethodOfWork = ({ 
    locale = "en",
    title = "", 
    subtitle,
    automationCard = {
        title: locale === "es" ? "Entender la organización." : "Understand the organization.",
        subtitle: "",
        description: locale === "es"
            ? "Aprendemos cómo funciona el negocio, dónde se pierde tiempo, dónde se frenan las decisiones y dónde clientes o equipos sienten fricción."
            : "We learn how your business works, where time is lost, where decisions slow down, and where customers or teams feel friction."
    },
    consultingCard = {
        title: locale === "es" ? "Elegir el primer despliegue útil." : "Choose the first useful deployment.",
        subtitle: "",
        description: locale === "es"
            ? "Convertimos la ambición en una secuencia práctica: el primer flujo a mejorar, los sistemas que necesita, los riesgos a gestionar y las métricas que prueban valor."
            : "We turn ambition into a practical sequence: the first workflow to improve, the systems it needs, the risks to manage, and the metrics that prove value."
    },
    webDevCard = {
        title: locale === "es" ? "Construir, desplegar, entrenar y mejorar." : "Build, deploy, train, and improve.",
        subtitle: "",
        description: locale === "es"
            ? "Lanzamos el sistema funcional, lo conectamos con las herramientas que las personas ya usan, entrenamos al equipo y lo seguimos mejorando con feedback operacional real."
            : "We ship the working system, connect it to the tools people already use, train the team around it, and keep improving it with real operational feedback."
    },
    className = "",
}: MethodOfWorkProps) => {
  const finalSubtitle =
    subtitle ||
    (locale === "es"
      ? "No empezamos con herramientas. Empezamos con la organización: objetivos, flujos de trabajo, restricciones, personas y los momentos donde la IA puede crear más ventaja."
      : "We do not start with tools. We start with the organization: goals, workflows, constraints, people, and the moments where AI can create the most leverage.");

  return (
    <div className={className}>
        {title && (
            <h2 className="text-4xl font-medium md:text-4xl mb-4 text-white max-w-4xl">
          {title}
        </h2>
        )}
        <h3 className="text-lg font-medium md:text-xl mb-4 text-neutral-300 max-w-4xl">
          {finalSubtitle}
        </h3>

      <div className="grid gap-4 
                    grid-cols-1 
                    sm:grid-cols-2 
                    lg:grid-cols-5 lg:grid-rows-2 
                    xl:gap-6">

        {/* Automation Card */}
        <div className="bg-primary-blue rounded-xl relative overflow-hidden
                      p-4 min-h-auto
                      sm:col-span-2 sm:p-4 sm:min-h-[180px] md:p-4 md:min-h-[220px]
                      lg:col-span-3 lg:row-span-1 lg:p-4 lg:min-h-auto
                      xl:p-4 border border-outline/30">
         
          <div className="relative z-20 h-full
                        flex flex-col
                        md:flex-row md:gap-4
                        lg:grid lg:grid-cols-1 lg:gap-4">
            <div className="flex-1 lg:col-span-2">
              <h3 className="font-medium mb-2 lg:mb-3
                           text-lg
                           md:text-xl
                           lg:text-xl xl:text-2xl">
                {automationCard.title}
              </h3>
              {automationCard.subtitle && (
                <h4 className="font-medium mb-2 lg:mb-3
                           text-sm
                           md:text-base
                           lg:text-base xl:text-lg text-outline">
                  {automationCard.subtitle}
                </h4>
              )}
              <p className="text-neutral-300
                          text-sm mb-4
                          md:text-base md:mb-0
                          lg:text-base lg:mb-0
                          xl:text-lg font-normal leading-relaxed">
                {automationCard.description}
              </p>
            </div>
          </div>
        </div>

        {/* Consulting Card */}
        <div className="bg-primary-blue relative rounded-xl
                      p-4 min-h-[160px]
                      sm:p-4 sm:min-h-[160px] md:p-4 md:min-h-[180px]
                      lg:col-span-2 sm:col-span-2 md:col-span-2 lg:row-span-1 lg:p-6 lg:min-h-auto
                      xl:p-4 border border-outline/30 overflow-hidden">
          
          
          <div className="flex-1 lg:col-span-2 z-20 relative">
            <h3 className="font-semibold mb-2 lg:mb-3
                        text-lg
                        md:text-xl
                        lg:text-xl xl:text-2xl">
              {consultingCard.title}
            </h3>
            {consultingCard.subtitle && (
              <h4 className="font-medium mb-2 lg:mb-3
                            text-sm
                            md:text-base
                            lg:text-base xl:text-lg text-outline">
                {consultingCard.subtitle}
              </h4>
            )}
            <p className="text-neutral-200
                        text-sm
                        md:text-base
                        lg:text-base
                        xl:text-lg">
              {consultingCard.description}
            </p>
          </div>
        </div>

        {/* AI-ready systems card */}
        <div className="bg-primary-blue rounded-xl relative overflow-hidden group
                      p-4 min-h-[140px]
                      sm:col-span-2 sm:p-4 sm:min-h-[160px] md:p-4 md:min-h-[180px]
                      lg:col-span-5 lg:row-span-1 lg:p-4 lg:min-h-auto
                      xl:p-4 border border-outline/30">
          
          <div className="flex-1 lg:col-span-2 z-20 relative">
            <h3 className="font-medium mb-2 lg:mb-3
                       text-lg
                       md:text-xl
                       lg:text-xl xl:text-2xl">
              {webDevCard.title}
            </h3>
            {webDevCard.subtitle && (
              <h4 className="font-medium mb-2 lg:mb-3
                            text-sm
                            md:text-base
                            lg:text-base xl:text-lg text-outline">
                {webDevCard.subtitle}
              </h4>
            )}
            <p className="text-neutral-300
                      text-sm
                      md:text-base
                      lg:text-base
                      xl:text-lg font-normal">
              {webDevCard.description}
            </p>

    
                <Globe className="top-16 opacity-80" />
            
          </div>
          
        </div>
      </div>
    </div>
  )
}
