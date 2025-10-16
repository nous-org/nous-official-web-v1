import bgBento from "@/assets/bg-bento.webp"
import whatsApp from "@/assets/whats.webp"
import webDev from "@/assets/WebDev.webp"
import BgBentoCard from "@/assets/bg.webp"

export const Bento = () => {
  return (
    <div>
      <p className="mb-4 text-sm font-normal sm:mb-6 sm:text-base md:mb-8 md:text-lg lg:text-xl text-neutral-200">
      Move faster, reduce busywork, and turn more visits into wins—starting now.
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
                Automate conversations.
              </h3>
              <p className="text-neutral-300
                          text-sm mb-4
                          md:text-base md:mb-0
                          lg:text-base lg:pr-20 lg:mb-0
                          xl:text-lg font-medium">
                Instant replies on WhatsApp, web, or voice. Capture details, route requests, and hand off to your team when it matters.
              </p>
            </div>
          </div>
          {/* WhatsApp Image */}
          <img src={whatsApp.src} alt="whatsapp" className="w-auto h-[60%] lg:block md:block sm:block xl:w-auto xl:h-44 absolute -bottom-12 -right-5 sm:-right-4 md:-right-12 lg:-right-28  md:-bottom-16 lg:-bottom-12 sm:-bottom-12 opacity-100 contrast-100" />
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
              Design your technology strategy.
            </h3>
            <p className="text-neutral-200
                        text-sm
                        md:text-base
                        lg:text-base
                        xl:text-lg">
              Cut through the noise. We align your goals with a staged plan—what to build, what to buy, and what to skip—so progress is fast and de-risked.
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
              Launch a site that converts.
            </h3>
            <p className="text-neutral-300
                      text-sm
                      md:text-base
                      lg:text-base
                      xl:text-lg font-medium">
              Fast, accessible, SEO-ready—and built on a system you can evolve weekly. Look premium, load instantly, sell more.
            </p>
          </div>
          {/* WebDev Image - Desktop Only */}
          <img src={webDev.src} alt="web development" className=" z-0 w-auto h-[60%] lg:block md:block sm:block absolute -bottom-5 -right-14 opacity-50 md:opacity-100 " />
        </div>
      </div>
    </div>
  )
}
