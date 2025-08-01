
import { Globe } from "./Globe";

interface MethodOfWorkProps {
    title?: string;
    subtitle?: string;
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
    title = "Our Methodology", 
    subtitle = "Nous accompany you throughout the process with transparency and consultancy. ",
    automationCard = {
        title: "Strategy & Design?",
        subtitle: "Define your vision",
        description: "We listen to your goals, analyze processes, and design a customized plan that blends AI, web development, and automation to meet your needs"
    },
    consultingCard = {
        title: "Build & Integrate",
        subtitle: "Create and connect",
        description: "We develop your solution using modern technologies and AI, ensuring full integration with your current tools and scalable performance"
    },
    webDevCard = {
        title: "Launch & Evolve",
        subtitle: "Launch & Evolve",
        description: "We validate with MVPs, optimize for quality, launch your product, and keep evolving it with real-world data and support"
    },
    className = "",
}: MethodOfWorkProps) => {
  return (
    <div className={className}>
        <h2 className="text-4xl font-bold md:text-4xl mb-4 text-white max-w-4xl">
          {title}
        </h2>
        <h3 className="text-lg font-medium md:text-xl mb-4 text-neutral-300 max-w-4xl">
          {subtitle}
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
                      xl:p-4 border border-primary-purple">
         
          <div className="relative z-20 h-full
                        flex flex-col
                        md:flex-row md:items-center md:gap-4
                        lg:grid lg:grid-cols-1 lg:gap-4">
            <div className="flex-1 lg:col-span-2">
              <h3 className="font-bold mb-2 lg:mb-3
                           text-lg
                           md:text-xl
                           lg:text-xl xl:text-4xl">
                {automationCard.title}
              </h3>
              <h4 className="font-medium mb-2 lg:mb-3
                           text-sm
                           md:text-md
                           lg:text-md xl:text-lg text-primary-purple">
                {automationCard.subtitle}
              </h4>
              <p className="text-neutral-300
                          text-sm mb-4
                          md:text-base md:mb-0
                          lg:text-base lg:mb-0
                          xl:text-lg font-medium">
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
                      xl:p-4 border border-primary-purple overflow-hidden">
          
          
          <div className="flex-1 lg:col-span-2 z-20 relative">
            <h3 className="font-semibold mb-2 lg:mb-3
                        text-lg
                        md:text-xl
                        lg:text-xl xl:text-4xl">
              {consultingCard.title}
            </h3>
            <h4 className="font-medium mb-2 lg:mb-3
                            text-sm
                            md:text-md
                            lg:text-md xl:text-lg text-primary-purple">
                {consultingCard.subtitle}
              </h4>
            <p className="text-neutral-200
                        text-sm
                        md:text-base
                        lg:text-base
                        xl:text-lg">
              {consultingCard.description}
            </p>
          </div>
        </div>

        {/* Web Development Card */}
        <div className="bg-primary-blue rounded-xl relative overflow-hidden group
                      p-4 min-h-[140px]
                      sm:col-span-2 sm:p-4 sm:min-h-[160px] md:p-4 md:min-h-[180px]
                      lg:col-span-5 lg:row-span-1 lg:p-4 lg:min-h-auto
                      xl:p-4 border border-primary-purple">
          
          <div className="flex-1 lg:col-span-2 z-20 relative">
            <h3 className="font-bold mb-2 lg:mb-3
                       text-lg
                       md:text-xl
                       lg:text-xl xl:text-4xl">
              {webDevCard.title}
            </h3>
            <h4 className="font-medium mb-2 lg:mb-3
                            text-sm
                            md:text-md
                            lg:text-md xl:text-lg text-primary-purple">
                {webDevCard.subtitle}
              </h4>
            <p className="text-neutral-300
                      text-sm
                      md:text-base
                      lg:text-base
                      xl:text-lg font-medium">
              {webDevCard.description}
            </p>

    
                <Globe/>
            
          </div>
          
        </div>
      </div>
    </div>
  )
}
