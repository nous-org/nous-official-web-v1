export interface Button {
    text: string;
    variant: 'primary' | 'secondary' | 'primaryPurple' | 'secondaryTurquoise' | 'darkBlue';
    href: string;
    scheduleIcon: boolean;
    strokeColor?: string;
    arrowIcon: boolean;
    target: '_blank' | '_self' | '_parent' | '_top';
    ariaLabel: string;
}

export interface CTASection {
    title: string;
    subtitle?: string;
    description: string;
    buttons: Button[];
    style: {
        background: string;
        textColor: string;
        shadowColor?: string;
        titleColor?: string;
        primaryButtonBg?: string;
        primaryButtonText?: string;
    };
}

export interface CallToActionProps {
    sections?: CTASection[];
    className?: string;
    locale?: "en" | "es";
}

export const defaultSections: CTASection[] = [
    {
        title: "Do not wait for the AI transformation to happen around you.",
        subtitle: "",
        description: "Every organization is asking the same question: where does AI actually create value for us? NOUS helps you answer it, prioritize it, and act on it.",
        style: {
            background: "bg-gradient-to-br from-outline to-gradient-middle border border-outline",
            textColor: "text-primary-black/75",
            shadowColor: "accent",
            titleColor: "text-primary-blue",
        },
        buttons: [
            {
                text: "See our approach",
                href: "/services",
                scheduleIcon: false,
                strokeColor: "",
                arrowIcon: false,
                variant: "darkBlue",
                target: "_self",
                ariaLabel: "See our AI transformation approach"
            }
        ]
    },
    {
        title: "Turn AI ambition into working systems.",
        subtitle: "",
        description: "AI does not create value until it is deployed into real workflows. We turn the right opportunities into agents, automations, integrations, and systems your team can use every day.",
        style: {
            background: "bg-gradient-to-bl from-outline/15 to-white/5 border border-outline/40",
            textColor: "text-neutral-300",
            shadowColor: "primary-purple",
            titleColor: "text-outline",
        },
        buttons: [
            {
                text: "Start with a consultation",
                href: "/contact",
                variant: "primary",
                scheduleIcon: false,
                strokeColor: "",
                arrowIcon: false,
                target: "_self",
                ariaLabel: "Start with an AI consultation"
            }
        ]
    }
];

export const defaultSectionsEs: CTASection[] = [
    {
        title: "No esperes a que la transformación con IA ocurra alrededor de tu organización.",
        subtitle: "",
        description: "Todas las organizaciones se están haciendo la misma pregunta: ¿dónde crea valor real la IA para nosotros? NOUS te ayuda a responderla, priorizarla y actuar.",
        style: {
            background: "bg-gradient-to-br from-outline to-gradient-middle border border-outline",
            textColor: "text-primary-black/75",
            shadowColor: "accent",
            titleColor: "text-primary-blue",
        },
        buttons: [
            {
                text: "Ver nuestro enfoque",
                href: "/services",
                scheduleIcon: false,
                strokeColor: "",
                arrowIcon: false,
                variant: "darkBlue",
                target: "_self",
                ariaLabel: "Ver el enfoque de transformación con IA de NOUS"
            }
        ]
    },
    {
        title: "Convierte la ambición con IA en sistemas que funcionan.",
        subtitle: "",
        description: "La IA no crea valor hasta que se despliega en flujos de trabajo reales. Convertimos las oportunidades correctas en agentes, automatizaciones, integraciones y sistemas que tu equipo puede usar todos los días.",
        style: {
            background: "bg-gradient-to-bl from-outline/15 to-white/5 border border-outline/40",
            textColor: "text-neutral-300",
            shadowColor: "primary-purple",
            titleColor: "text-outline",
        },
        buttons: [
            {
                text: "Empezar con una consulta",
                href: "/contact",
                variant: "primary",
                scheduleIcon: false,
                strokeColor: "",
                arrowIcon: false,
                target: "_self",
                ariaLabel: "Empezar con una consulta de IA"
            }
        ]
    }
];
