import { Timeline } from "@/components/react/TimeLine";
import { Bento } from '@/components/react/timeLine/Bento'
import { MethodOfWork } from '@/components/react/timeLine/MethodOfWork'
import { TimeLineCta } from '@/components/react/timeLine/TimeLineCta'

export function TimeLineNous() {
  const data = [
    {
      title: "Where AI creates leverage",
      content: (
        <Bento />
      ),
    },
    {
      title: "How NOUS guides the transformation",
      content: (
        <MethodOfWork />
      ),
    },
    {
      title: "Ready to make AI useful?",
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
