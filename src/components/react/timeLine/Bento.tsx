import decisionHandoffs from "@/assets/timeLine/decision-handoffs.jpg"
import systemsModernization from "@/assets/timeLine/ai-systems-modernization.jpg"
import type { Locale } from "@/lib/i18n"

export const Bento = ({ locale = "en" }: { locale?: Locale }) => {
  const isEs = locale === "es";
  const copy = isEs
    ? {
        intro: "Nos enfocamos en los lugares donde mejores sistemas de IA cambian el ritmo de la organización.",
        automationTitle: "Automatiza decisiones y traspasos.",
        automationText: "Captura contexto, enruta solicitudes, redacta respuestas, analiza información y escala a tu equipo cuando el criterio humano importa.",
        roadmapTitle: "Prioriza la hoja de ruta de IA.",
        roadmapText: "Convierte ideas dispersas de IA en un plan por etapas: qué construir primero, qué automatizar después, qué evitar y cómo medir el éxito.",
        systemsTitle: "Moderniza los sistemas alrededor de la IA.",
        systemsText: "Conecta sitios web, herramientas internas, CRMs, documentos, datos, analítica y APIs para que la IA trabaje dentro del flujo real del negocio.",
        automationAlt: "Ruteo abstracto de decisiones y traspasos con IA",
        systemsAlt: "Modernización abstracta de sistemas listos para IA",
      }
    : {
        intro: "We focus on the places where better AI systems change the pace of the organization.",
        automationTitle: "Automate decisions and handoffs.",
        automationText: "Capture context, route requests, draft replies, analyze information, and escalate to your team when human judgment matters.",
        roadmapTitle: "Prioritize the AI roadmap.",
        roadmapText: "Turn scattered AI ideas into a staged plan: what to build first, what to automate later, what to avoid, and how to measure success.",
        systemsTitle: "Modernize the systems around AI.",
        systemsText: "Connect websites, internal tools, CRMs, documents, data, analytics, and APIs so AI can work inside the real flow of the business.",
        automationAlt: "Abstract AI decision routing and handoffs",
        systemsAlt: "Abstract AI-ready systems modernization",
      };
  return (
    <div>
      <p className="mb-4 text-sm font-normal sm:mb-6 sm:text-base md:mb-8 md:text-lg lg:text-xl text-neutral-200">
      {copy.intro}
      </p>

      {/* Single Adaptive Bento Grid */}
      <div className="grid gap-4 
                    grid-cols-1 
                    sm:grid-cols-2 
                    lg:grid-cols-5 lg:grid-rows-2 
                    xl:gap-6">

        {/* Automation Card */}
        <div className="bg-primary-black rounded-xl relative overflow-hidden
                      p-4 min-h-auto
                      sm:col-span-2 sm:p-4 sm:min-h-[180px] md:p-6 md:min-h-[220px]
                      lg:col-span-3 lg:row-span-1 lg:p-4 lg:min-h-auto
                      xl:p-6 border border-outline/30">
          
          <div className=" bg-primary-black/60 absolute inset-0 w-full h-full z-20  " />
          <div className="relative z-20 h-full
                        flex flex-col
                        md:flex-row md:items-center md:gap-4
                        lg:grid lg:grid-cols-1 lg:gap-4">
            <div className="flex-1 lg:col-span-2">
              <h3 className="font-medium mb-2 lg:mb-3
                           text-lg
                           md:text-xl
                           lg:text-xl xl:text-2xl">
                {copy.automationTitle}
              </h3>
              <p className="text-neutral-300
                          text-sm mb-4
                          md:text-base md:mb-0
                          lg:text-base lg:pr-20 lg:mb-0
                          xl:text-lg font-normal">
                {copy.automationText}
              </p>
            </div>
          </div>
          <img src={decisionHandoffs.src} alt={copy.automationAlt} className="absolute inset-0 z-0 h-full w-full object-cover object-right opacity-70" />
        </div>

        {/* Consulting Card */}
        <div className="bg-primary-black relative rounded-xl
                      p-4 min-h-[160px]
                      sm:p-4 sm:min-h-[160px] md:p-6 md:min-h-[180px]
                      lg:col-span-2 sm:col-span-2 md:col-span-2 lg:row-span-1 lg:p-6 lg:min-h-auto
                      xl:p-8 border border-outline/30 overflow-hidden">
          
          <div className=" bg-primary-black/60 absolute inset-0 w-full h-full z-20 " />
          <div className="flex-1 lg:col-span-2 z-20 relative">
            <h3 className="font-semibold mb-2 lg:mb-3
                        text-lg
                        md:text-xl
                        lg:text-xl xl:text-2xl">
              {copy.roadmapTitle}
            </h3>
            <p className="text-neutral-200
                        text-sm
                        md:text-base
                        lg:text-base
                        xl:text-lg">
              {copy.roadmapText}
            </p>
          </div>
        </div>

        {/* AI-ready systems card */}
        <div className="bg-primary-black rounded-xl relative overflow-hidden
                      p-4 min-h-[140px]
                      sm:col-span-2 sm:p-4 sm:min-h-[160px] md:p-6 md:min-h-[180px]
                      lg:col-span-5 lg:row-span-1 lg:p-6 lg:min-h-auto
                      xl:p-8 border border-outline/30">
          <div className=" bg-primary-black/60 absolute inset-0 w-full h-full z-20 " />
          <div className="flex-1 lg:col-span-2 z-20 relative">
            <h3 className="font-medium mb-2 lg:mb-3
                       text-lg
                       md:text-xl
                       lg:text-xl xl:text-2xl">
              {copy.systemsTitle}
            </h3>
            <p className="text-neutral-300
                      text-sm
                      md:text-base
                      lg:text-base
                      xl:text-lg font-normal">
              {copy.systemsText}
            </p>
          </div>
          <img src={systemsModernization.src} alt={copy.systemsAlt} className="absolute inset-0 z-0 h-full w-full object-cover object-right opacity-55 md:opacity-70" />
        </div>
      </div>
    </div>
  )
}
