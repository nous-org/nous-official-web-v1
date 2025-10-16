import { Timeline } from "@/components/react/TimeLine";
import { Bento } from '@/components/react/timeLine/Bento'
import { MethodOfWork } from '@/components/react/timeLine/MethodOfWork'
import { TimeLineCta } from '@/components/react/timeLine/TimeLineCta'

export function TimeLineNous() {
  const data = [
    {
      title: "Boost your business!",
      content: (
        <Bento />
      ),
    },
    {
      title: "How do we work?",
      content: (
        <MethodOfWork />
      ),
    },
    {
      title: "Ready to go to the next level?",
      content: (
        <TimeLineCta />
      ),
    },
  ];
  return (
    <div className="relative w-full overflow-clip">
      <Timeline data={data} />
    </div>
  );
}
