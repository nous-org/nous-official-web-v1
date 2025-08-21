import bgBento from "@/assets/bg-bento.webp"
import whatsApp from "@/assets/whats.webp"
import webDev from "@/assets/WebDev.webp"
import BgBentoCard from "@/assets/bg.webp"

export const Bento = () => {
  return (
    <div>
      <p className="mb-4 text-sm font-normal sm:mb-6 sm:text-base md:mb-8 md:text-lg lg:text-xl text-neutral-200">
        We offer a range of services to help you boost your business and take it to the next level.
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
                      xl:p-6 border border-primary-purple">
          
          <div className=" bg-primary-black/60 absolute inset-0 w-full h-full z-20  " />
          <div className="relative z-20 h-full
                        flex flex-col
                        md:flex-row md:items-center md:gap-4
                        lg:grid lg:grid-cols-1 lg:gap-4">
            <div className="flex-1 lg:col-span-2">
              <h3 className="font-bold mb-2 lg:mb-3
                           text-lg
                           md:text-xl
                           lg:text-xl xl:text-2xl">
                Need to automate a message or voice assistant?
              </h3>
              <p className="text-neutral-300
                          text-sm mb-4
                          md:text-base md:mb-0
                          lg:text-base lg:pr-20 lg:mb-0
                          xl:text-lg font-medium">
                Our team automates your workflow and creates a bot that adapts to your needs.
              </p>
            </div>
          </div>
          {/* WhatsApp Image */}
          <img src={whatsApp.src} alt="whatsapp" className="w-auto h-[60%] lg:block md:block sm:block xl:w-auto xl:h-44 absolute bottom-0 -right-5 md:-right-14 opacity-100 contrast-100" />
        </div>

        {/* Consulting Card */}
        <div className="bg-primary-black relative rounded-xl
                      p-4 min-h-[160px]
                      sm:p-4 sm:min-h-[160px] md:p-6 md:min-h-[180px]
                      lg:col-span-2 sm:col-span-2 md:col-span-2 lg:row-span-1 lg:p-6 lg:min-h-auto
                      xl:p-8 border border-primary-purple overflow-hidden">
          
          <div className=" bg-primary-black/60 absolute inset-0 w-full h-full z-20 " />
          <div className="flex-1 lg:col-span-2 z-20 relative">
            <h3 className="font-semibold mb-2 lg:mb-3
                        text-lg
                        md:text-xl
                        lg:text-xl xl:text-2xl">
              We offer professional technological consulting
            </h3>
            <p className="text-neutral-200
                        text-sm
                        md:text-base
                        lg:text-base
                        xl:text-lg">
              Schedule with us and we will identify your company's pain points and provide professional advice.
            </p>
          </div>
        </div>

        {/* Web Development Card */}
        <div className="bg-primary-black rounded-xl relative overflow-hidden
                      p-4 min-h-[140px]
                      sm:col-span-2 sm:p-4 sm:min-h-[160px] md:p-6 md:min-h-[180px]
                      lg:col-span-5 lg:row-span-1 lg:p-6 lg:min-h-auto
                      xl:p-8 border border-primary-purple">
          <div className=" bg-primary-black/60 absolute inset-0 w-full h-full z-20 " />
          <div className="flex-1 lg:col-span-2 z-20 relative">
            <h3 className="font-bold mb-2 lg:mb-3
                       text-lg
                       md:text-xl
                       lg:text-xl xl:text-2xl">
              Professional web development adapted to all types of businesses
            </h3>
            <p className="text-neutral-300
                      text-sm
                      md:text-base
                      lg:text-base
                      xl:text-lg font-medium">
              Give your brand a professional identity with modern, optimized designs and integrate it with AI to stand out in the market.
            </p>
          </div>
          {/* WebDev Image - Desktop Only */}
          <img src={webDev.src} alt="web development" className=" z-0 w-auto h-[60%] lg:block md:block sm:block absolute -bottom-5 -right-14 opacity-50 md:opacity-100 " />
        </div>
      </div>
    </div>
  )
}
