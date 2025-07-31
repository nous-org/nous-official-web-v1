export interface Button {
    text: string;
    variant: 'primary' | 'secondary' | 'primaryPurple' | 'secondaryTurquoise';
    href: string;
    icon: boolean;
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
        title: "Identify opportunities",
        subtitle: "",
        description: "Optimize processes, and achieve your goals with high-impact technology.",
        style: {
            background: "bg-primary-turquoise/5 border border-primary-turquoise",
            textColor: "text-white",
            shadowColor: "primary-turquoise",
            titleColor: "text-primary-turquoise",
        },
        buttons: [
            {
                text: "Explore our plans",
                href: "/Pricing",
                icon: false,
                variant: "secondary",
                target: "_self",
                ariaLabel: "Explore our plans"
            },
            {
                text: "See our products",
                href: "/Services",
                icon: false,
                variant: "secondaryTurquoise",
                target: "_self",
                ariaLabel: "See our products"
            }
        ]
    },
    {
        title: "Boost your businesss",
        subtitle: "",
        description: "Customized digital solutions in web development, artificial intelligence automation, and technology consulting.",
        style: {
            background: "bg-primary-purple/5 border border-primary-purple",
            textColor: "text-white",
            shadowColor: "primary-purple",
            titleColor: "text-primary-purple",
        },
        buttons: [
            {
                text: "Contact us",
                href: "/Contact",
                variant: "primary",
                icon: false,
                target: "_self",
                ariaLabel: "Contact us"
            },
            {
                text: "Schedule a meeting",
                href: "https://calendly.com/stellarteamcr",
                variant: "primaryPurple",
                icon: true,
                target: "_blank",
                ariaLabel: "Schedule a meeting"
            }
        ]
    }
];

