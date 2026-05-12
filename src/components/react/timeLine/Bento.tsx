import decisionHandoffs from "@/assets/timeLine/decision-handoffs.jpg"
import systemsModernization from "@/assets/timeLine/ai-systems-modernization.jpg"

export const Bento = () => {
  return (
    <div>
      <p className="mb-4 text-sm font-normal sm:mb-6 sm:text-base md:mb-8 md:text-lg lg:text-xl text-neutral-200">
      We focus on the places where better AI systems change the pace of the organization.
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
                Automate decisions and handoffs.
              </h3>
              <p className="text-neutral-300
                          text-sm mb-4
                          md:text-base md:mb-0
                          lg:text-base lg:pr-20 lg:mb-0
                          xl:text-lg font-normal">
                Capture context, route requests, draft replies, analyze information, and escalate to your team when human judgment matters.
              </p>
            </div>
          </div>
          <img src={decisionHandoffs.src} alt="Abstract AI decision routing and handoffs" className="absolute inset-0 z-0 h-full w-full object-cover object-right opacity-70" />
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
              Prioritize the AI roadmap.
            </h3>
            <p className="text-neutral-200
                        text-sm
                        md:text-base
                        lg:text-base
                        xl:text-lg">
              Turn scattered AI ideas into a staged plan: what to build first, what to automate later, what to avoid, and how to measure success.
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
              Modernize the systems around AI.
            </h3>
            <p className="text-neutral-300
                      text-sm
                      md:text-base
                      lg:text-base
                      xl:text-lg font-normal">
              Connect websites, internal tools, CRMs, documents, data, analytics, and APIs so AI can work inside the real flow of the business.
            </p>
          </div>
          <img src={systemsModernization.src} alt="Abstract AI-ready systems modernization" className="absolute inset-0 z-0 h-full w-full object-cover object-right opacity-55 md:opacity-70" />
        </div>
      </div>
    </div>
  )
}
