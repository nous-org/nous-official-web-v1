import { Ripple } from "@/components/react/Ripple";
import {ButtonVariant} from "@/components/react/Buttons/ButtonVariant";
import {NousAnimatedLogo} from '@/components/react/Icons/NousAnimatedLogo';
export function RippleCta() {
  return (
    <div className="relative flex h-[80dvh] sm:h-[65vh] md:h-[70vh] lg:h-[75vh] w-full flex-col items-center justify-center rounded-lg overflow-hidden px-4">
      
      <h2 className="z-10 mt-4 whitespace-pre-wrap text-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-7xl font-medium tracking-tighter text-white max-w-6xl">
      Discover how our solutions can optimize your business operations in minutes
      </h2>
      <p className="z-10 mt-4 sm:mt-6 whitespace-pre-wrap text-center text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-medium tracking-tighter text-neutral-400 max-w-3xl">
      Quick, no-obligation consultation. See how AI and automation can save time and improve efficiency.
      </p>
      <div className="flex flex-col sm:flex-row justify-center mt-4 sm:mt-6 gap-3 sm:gap-4 w-full sm:w-auto">
      <ButtonVariant
      variant="primary"
      text="Demos"
      href="/contact"
      target="_blank"
      />
      <ButtonVariant
      variant="primary"
      text="Portfolio"
      href="/about"
      target="_blank"
      />
      </div>
      <Ripple
      mainCircleSize={190}
      mainCircleOpacity={0.20}
      numCircles={8}
       />
    </div>
  );
}
