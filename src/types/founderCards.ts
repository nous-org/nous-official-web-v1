import LinkedInIcon from '@/components/icons/SocialLinks/LinkedInIcon.svg';
import XIcon from '@/components/icons/SocialLinks/XIcon.svg';
import FounderRoberto from '@/assets/founders/rpu.webp';
import FounderAlessandro from '@/assets/founders/adg.webp';
import FounderAndrey from '@/assets/founders/amz.webp';
import FounderAna from '@/assets/founders/ana.webp';
import FounderJeffrey from '@/assets/founders/jeffrey.webp';
import FounderPablo from '@/assets/founders/pablo-studio.webp';
import GitHubIcon from '@/components/icons/SocialLinks/GitHubIcon.svg';
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

const DEFAULT_FOUNDERS_CLASSNAME = "flex flex-col gap-4 relative bg-gradient-to-br border border-outline from-outline/20 to-outline/20 rounded-xl p-4";

export const DEFAULT_FOUNDERS: FounderCard[] = [
    {
        name: "Roberto Pereira Ugalde",
        position: "Chief Executive Officer (CEO) & Founder",
        image: FounderRoberto.src,   
        description: `<span class="font-semibold text-outline">Thinks hard about the future and how we get there.</span> Roberto is focused on the mission behind NOUS: using AI and technology to help build a better world. He shapes the point of view, sharpens the story, and keeps the work anchored to what should actually change for people and organizations.`,
        socialLinks: [
            {
                 icon: GitHubIcon.src,
                 name: "GitHub",
                 url: "https://github.com/robertopereiraugalde"
             },
            {
                icon: LinkedInIcon.src,
                name: "LinkedIn",
                url: "https://www.linkedin.com/in/robertopereiraugalde/"
            },
            {
                icon: XIcon.src,
                name: "X",
                url: "https://x.com/rpereiraugalde"
            }
        ],
        className:  DEFAULT_FOUNDERS_CLASSNAME + "",
        imageClassName: "",
        background: ""
    },
    {
        name: "Alessandro Díaz González",
        position: "Chief Technology Officer (CTO) & Co-Founder",
        image: FounderAlessandro.src,
        description: `<span class="font-semibold text-outline">Turns AI ambition into dependable systems.</span> Alessandro owns the technical path from prototype to production: agents, integrations, automations, infrastructure, and software that can carry real workflows without becoming fragile experiments.`,
        socialLinks: [
            {
                icon: GitHubIcon.src,
                name: "GitHub",
                url: "https://github.com/nous-adg"
            },
            {
                icon: LinkedInIcon.src,
                name: "LinkedIn",
                url: "https://www.linkedin.com/in/alessandrodg"
            },
            {
                icon: XIcon.src,
                name: "X",
                url: "https://x.com/ddiaz_ale"
            }
        ],
        className: DEFAULT_FOUNDERS_CLASSNAME + "",
        imageClassName: "object-center origin-center scale-[1.12] -translate-x-[6%]",
        background: ""
    },
    {
        name: "Andrey Martínez Zambrana",
        position: "Chief Product Officer (CPO) & Co-Founder",
        image: FounderAndrey.src,
        description: `<span class="font-semibold text-outline">Makes intelligence usable.</span> Andrey turns strategy and systems into product experiences people can understand, trust, and adopt: clearer flows, better interfaces, and the product judgment that makes new capabilities feel natural.`,
        socialLinks: [
            {
                icon: GitHubIcon.src,
                name: "GitHub",
                url: "https://github.com/nous-amz"
            },
            {
                icon: LinkedInIcon.src,
                name: "LinkedIn",
                url: "https://www.linkedin.com/in/andrey-mart%C3%ADnez/"
            }
        ],
        className: DEFAULT_FOUNDERS_CLASSNAME + "",
        imageClassName: "",
        background: ""
    },
    {
        name: "Ana Kwok-Ching",
        position: "Chief Business Officer (CBO)",
        image: FounderAna.src,
        description: `<span class="font-semibold text-outline">Turns strategy into commercial momentum.</span> Ana connects markets, partners, and revenue opportunities around the transformation. She helps NOUS shape the business path for AI adoption: strategic relationships, commercial direction, partnerships, and opportunities that can expand into meaningful growth.`,
        socialLinks: [
            {
                icon: LinkedInIcon.src,
                name: "LinkedIn",
                url: "https://www.linkedin.com/in/anakwok/"
            }
        ],
        className: DEFAULT_FOUNDERS_CLASSNAME + "",
        imageClassName: "object-center origin-center scale-[1.38] -translate-x-[8%] translate-y-[15%]",
        background: ""
    },
    {
        name: "Jeffrey Quirós Acuña",
        position: "Head of Marketing",
        image: FounderJeffrey.src,
        description: `<span class="font-semibold text-outline">Turns the NOUS vision into market clarity.</span> Jeffrey shapes the marketing engine that makes the AI transformation story easier to understand, trust, and act on: positioning, content, campaigns, audience insight, and demand that connects the right organizations with the right conversation.`,
        socialLinks: [
            {
                icon: LinkedInIcon.src,
                name: "LinkedIn",
                url: "https://www.linkedin.com/in/jefry-quiros-43a9a2193/"
            }
        ],
        className: DEFAULT_FOUNDERS_CLASSNAME + "",
        imageClassName: "object-[center_30%] origin-center scale-[1.1] translate-x-[5%] translate-y-[3%]",
        background: ""
    },
    {
        name: "Pablo Molina Camareno",
        position: "Head of Marketing",
        image: FounderPablo.src,
        description: `<span class="font-semibold text-outline">Makes the market understand and remember NOUS.</span> Pablo shapes the brand, content, campaigns, and creative direction that carry the AI transformation story into the market. His work builds clarity, trust, and demand around what NOUS believes and what NOUS can help organizations do.`,
        socialLinks: [],
        className: DEFAULT_FOUNDERS_CLASSNAME + "",
        imageClassName: "object-center origin-center scale-[1.85] -translate-x-[36%] translate-y-[18%]",
        background: ""
    }
   
]
