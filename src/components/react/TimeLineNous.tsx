import { Timeline } from "@/components/react/TimeLine";
import { Bento } from '@/components/react/timeLine/Bento'
import { MethodOfWork } from '@/components/react/timeLine/MethodOfWork'
import { TimeLineCta } from '@/components/react/timeLine/TimeLineCta'
import type { Locale } from '@/lib/i18n';

export function TimeLineNous({ locale = "en" }: { locale?: Locale }) {
  const isEs = locale === "es";
  const data = [
    {
      title: isEs ? "Dónde la IA crea ventaja" : "Where AI creates leverage",
      content: (
        <Bento locale={locale} />
      ),
    },
    {
      title: isEs ? "Cómo NOUS guía la transformación" : "How NOUS guides the transformation",
      content: (
        <MethodOfWork locale={locale} />
      ),
    },
    {
      title: isEs ? "¿Listo para hacer útil la IA?" : "Ready to make AI useful?",
      content: (
        <TimeLineCta locale={locale} />
      ),
    },
  ];
  return (
    <div className="relative w-full overflow-clip">
      <Timeline data={data} locale={locale} />
    </div>
  );
}
