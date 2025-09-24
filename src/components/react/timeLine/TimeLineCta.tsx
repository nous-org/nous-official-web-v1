import { NousAnimatedLogo } from "@/components/react/Icons/NousAnimatedLogo";
import { ButtonVariant } from "@/components/react/Buttons/ButtonVariant";
import ctaBg from '@/assets/ctaBg.webp'


export const TimeLineCta = () => {
    return (
        <>
            <div className="flex flex-col md:mx-0 justify-center items-center border group p-4 border-primary-purple rounded-lg relative overflow-hidden">
                <img src={ctaBg.src} alt="cta-bg" className="absolute -z-10 blur-[4px] top-0 left-0 w-full h-full object-cover group-hover:blur-[2px] md:group-hover:scale-[1.02] transition-all duration-300" />
                <NousAnimatedLogo />
                <h2 className="text-2xl font-bold sm:text-4xl md:text-5xl lg:text-6xl text-black dark:text-white max-w-4xl text-center mb-4">Start your project now</h2>
                <h3 className="text-md font-bold sm:text-lg md:text-3xl lg:text-4xl text-black dark:text-white max-w-4xl text-center">We’re one conversation away.</h3>
                <p className="text-neutral-700 dark:text-neutral-300 text-md md:text-lg lg:text-xl text-center py-8">We turn ambition into momentum—clear plan, short sprints, and outcomes you can feel in weeks.</p>
                <footer className='flex gap-4'>
                    <ButtonVariant
                        text="Book a 15-min intro call "
                        icon={false}
                        strokeColor="#1AD6B3"
                        variant="primary"
                        href="/contact"
                        target="_self"
                        ariaLabel="Book a 15-min intro call"
                    />
                    <ButtonVariant
                        text="See services"
                        icon={false}
                        variant="primaryPurple"
                        href="/services"
                        target="_self"
                        ariaLabel="See services"
                    />
                </footer>
            </div>
        </>
    )
}
