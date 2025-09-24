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
}

export const defaultSections: CTASection[] = [
    {
        title: "Stop guessing. Start shipping.",
        subtitle: "",
        description: "Get a clear plan and a site that actually converts—done with you, not to you.",
        style: {
            background: "bg-accent to-primary-black/40 border border-accent",
            textColor: "text-primary-blue/70",
            shadowColor: "accent",
            titleColor: "text-primary-blue",
        },
        buttons: [
            {
                text: "Talk to an advisor",
                href: "/contact",
                scheduleIcon: false,
                strokeColor: "",
                arrowIcon: false,
                variant: "darkBlue",
                target: "_self",
                ariaLabel: "Explore our plans"
            },
            {
                text: "See how we build sites",
                href: "/portfolio",
                scheduleIcon: false,
                strokeColor: "",
                arrowIcon: false,
                variant: "secondary",
                target: "_self",
                ariaLabel: "See our products"
            }
        ]
    },
    {
        title: "Your ops, on autopilot.",
        subtitle: "",
        description: "Give your team back hours with AI workflows that reply instantly, reduce errors, and scale with you.",
        style: {
            background: "bg-gradient-to-bl from-outline/40 to-primary-black/40 border border-outline",
            textColor: "text-neutral-300",
            shadowColor: "primary-purple",
            titleColor: "text-outline",
        },
        buttons: [
            {
                text: "Turn busywork off",
                href: "/contact",
                variant: "primary",
                scheduleIcon: false,
                strokeColor: "",
                arrowIcon: false,
                target: "_self",
                ariaLabel: "Contact us"
            },
            {
                text: "Explore automation use cases",
                href: "/services",
                variant: "primaryPurple",
                scheduleIcon: false,
                arrowIcon: false,
                strokeColor: "",
                target: "_self",
                ariaLabel: "See our services"
            }
        ]
    }
];

