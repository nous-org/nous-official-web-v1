import InstagramIcon from '@/components/icons/SocialLinks/InstagramIcon.svg';
import LinkedInIcon from '@/components/icons/SocialLinks/LinkedInIcon.svg';
import XIcon from '@/components/icons/SocialLinks/XIcon.svg';
import FounderRoberto from '@/assets/founders/FounderRoberto.webp';
import FounderAlessandro from '@/assets/founders/FounderAlessandro.webp';
import FounderAndrey from '@/assets/founders/FounderAndrey.webp';
export interface FounderCard {
    name: string;
    position: string;
    image: string;
    description: string;
    socialLinks: {
        icon: string;
        name: string;
        url: string;
    }[],
    className?: string;
    imageClassName?: string;
    background?: string;
}

const DEFAULT_FOUNDERS_CLASSNAME = "flex flex-col gap-4 relative bg-gradient-to-br border border-primary-turquoise from-primary-blue/20 to-primary-turquoise/20 rounded-xl p-4";

export const DEFAULT_FOUNDERS: FounderCard[] = [
    {
        name: "Roberto Pereira Ugalde",
        position: "CEO/COO/CMO",
        image: FounderRoberto.src,   
        description: "Expert in business administration and technology-driven strategies, Roberto combines leadership and innovation to align IT solutions with business goals. With extensive experience in social media management, operations, and market positioning, he drives our company’s vision and growth through creative and results-oriented strategies",
        socialLinks: [
            {
                icon: XIcon.src,
                name: "X",
                url: ""
            },
            {
                icon: LinkedInIcon.src,
                name: "LinkedIn",
                url: ""
            },
            {
                icon: InstagramIcon.src,
                name: "Instagram",
                url: ""
            }
        ],
        className:  DEFAULT_FOUNDERS_CLASSNAME + "",
        imageClassName: "w-20 h-auto rounded-full object-cover absolute -top-12 right-5",
        background: ""
    },
    {
        name: "Alessandro Díaz González",
        position: "CTO/CIO",
        image: FounderAlessandro.src,
        description: "Full-stack developer and software engineer specialized in building scalable digital products. Alessandro excels in aligning technology with business strategies, ensuring robust IT infrastructure, seamless integrations, and data-driven solutions that foster growth and innovation",
        socialLinks: [
            {
                icon: XIcon.src,
                name: "X",
                url: ""
            },
            {
                icon: LinkedInIcon.src,
                name: "LinkedIn",
                url: ""
            },
            {
                icon: InstagramIcon.src,
                name: "Instagram",
                url: ""
            }
        ],
        className: DEFAULT_FOUNDERS_CLASSNAME + "",
        imageClassName: "w-20 h-auto rounded-full object-cover absolute -top-12 right-5",
        background: ""
    },
    {
        name: "Andrey Martínez Zambrana",
        position: "CSO/CTIO",
        image: FounderAndrey.src,
        description: "Specialist in digital transformation and technology architecture, Andrey leads innovation strategies that align cutting-edge software development with business goals. His expertise spans scalable system design, AI-powered solutions, and building high-performance products that drive sustainable growth",
        socialLinks: [
            {
                icon: XIcon.src,
                name: " X",
                url: ""
            },
            {
                icon: LinkedInIcon.src,
                name: "LinkedIn",
                url: ""
            },
            {
                icon: InstagramIcon.src,
                name: "Instagram",
                url: ""
            }
        ],
        className: DEFAULT_FOUNDERS_CLASSNAME + "",
        imageClassName: "w-20 h-auto rounded-full object-cover absolute -top-12 right-5",
        background: ""
    }
   
]

