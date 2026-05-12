import { Ripple } from "@/components/react/Ripple";
import { ButtonVariant } from "@/components/react/Buttons/ButtonVariant";

export function RippleCta() {
  return (
    <div className="relative flex h-[80dvh] sm:h-[65vh] md:h-[70vh] lg:h-[75vh] w-full flex-col items-center justify-center rounded-lg overflow-hidden px-4">

      <h2 className="z-10 mt-4 whitespace-pre-wrap text-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-7xl font-medium tracking-tighter text-white max-w-6xl ">
        Find the AI opportunity worth building next
      </h2>
      <p className="z-10 mt-4 sm:mt-6 whitespace-pre-wrap text-center text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-medium tracking-tighter text-neutral-400 max-w-3xl">
        Bring us a workflow, a customer problem, or a process that should work better. We will help turn it into a clear deployment path.
      </p>
      <div className="flex flex-col sm:flex-row justify-center mt-4 sm:mt-6 gap-3 sm:gap-4 w-full sm:w-auto">

        <ButtonVariant
          variant="primary"
          text="Talk to NOUS"
          href="/contact"
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
