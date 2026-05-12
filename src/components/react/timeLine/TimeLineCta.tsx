import { NousAnimatedLogo } from "@/components/react/Icons/NousAnimatedLogo";
import { ButtonVariant } from "@/components/react/Buttons/ButtonVariant";
import aiOpportunityCta from "@/assets/timeLine/ai-opportunity-cta.jpg"


export const TimeLineCta = () => {
    return (
        <>
            <div className="group relative overflow-hidden rounded-lg border border-outline/35 bg-primary-black p-8 md:mx-0 md:p-12">
                <img src={aiOpportunityCta.src} alt="" className="absolute inset-0 z-0 h-full w-full object-cover opacity-75 blur-[1px] transition-all duration-500 group-hover:blur-0 md:group-hover:scale-[1.015]" />
                <div className="absolute inset-0 z-10 bg-primary-black/50" />
                <div className="relative z-20 flex flex-col items-center justify-center space-y-5 sm:space-y-6 md:space-y-8">
                <NousAnimatedLogo />
                <h2 className="max-w-3xl text-center text-2xl font-medium text-white sm:text-3xl md:text-4xl lg:text-5xl">Start with a real business problem.</h2>
                <h3 className="max-w-3xl text-center text-base font-normal text-outline sm:text-lg md:text-xl lg:text-2xl">Bring the workflow, bottleneck, or system question.</h3>
                <p className="max-w-2xl text-center text-sm text-neutral-300 sm:text-base md:text-lg">We will help you think through where AI fits, what needs to change around it, and what a practical first version could look like.</p>
                <footer className='flex flex-col gap-4 md:flex-row'>
                    <ButtonVariant
                        text="Start the conversation"
                        icon={false}
                        strokeColor="#060114"
                        variant="primary"
                        href="/contact"
                        target="_self"
                        ariaLabel="Start the conversation"
                    />
                    <ButtonVariant
                        text="Explore services"
                        icon={false}
                        variant="primaryPurple"
                        href="/services"
                        target="_self"
                        ariaLabel="See services"
                    />
                </footer>
                </div>
            </div>
        </>
    )
}
