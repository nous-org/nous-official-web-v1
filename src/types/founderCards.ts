import InstagramIcon from '@/components/icons/SocialLinks/InstagramIcon.svg';
import LinkedInIcon from '@/components/icons/SocialLinks/LinkedInIcon.svg';
import XIcon from '@/components/icons/SocialLinks/XIcon.svg';
import FounderRoberto from '@/assets/founders/FounderRoberto.webp';
import FounderAlessandro from '@/assets/founders/FounderAlessandro.webp';
import FounderAndrey from '@/assets/founders/FounderAndrey.webp';
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
        position: "Chief Executive Officer (CEO) & Co-founder",
        image: FounderRoberto.src,   
        description: "Sets the vision. Edits to the essential. Owns the experience. Roberto makes the future feel inevitable. He frames the why, cuts everything that’s not essential, and aligns design, engineering, and go-to-market around one clear story customers can feel. He sets the bar—and keeps it there—owning the product end-to-end from first pixel to last mile across LatAm.",
        socialLinks: [
            {
                icon: XIcon.src,
                name: "X",
                url: "https://x.com/rpereiraugalde"
            },
            {
                icon: LinkedInIcon.src,
                name: "LinkedIn",
                url: "https://www.linkedin.com/in/robertopereiraugalde/"
            },
            {
                icon: InstagramIcon.src,
                name: "Instagram",
                url: "https://www.instagram.com/robertopereiraugalde/"
            },
            {
                 icon: GitHubIcon.src,
                 name: "GitHub",
                 url: "https://github.com/nous-rpu"
             }
        ],
        className:  DEFAULT_FOUNDERS_CLASSNAME + "",
        imageClassName: "w-20 h-auto rounded-full object-cover absolute -top-12 right-5",
        background: ""
    },
    {
        name: "Alessandro Díaz González",
        position: "Chief Technology Officer (CTO) & Co-founder",
        image: FounderAlessandro.src,
        description: "The engineer who makes it “just work”—fast, stable, elegant. Alessandro reduces complexity to the essential and turns it into systems that carry real load. He prototypes quickly, measures ruthlessly, and simplifies again until latency drops, reliability climbs, and the code feels inevitable. He obsesses over clear architecture, automation by default, and durability in production. He doesn’t just direct—he builds—leaving behind platforms the business can scale on without drama.",
        socialLinks: [
            {
                icon: XIcon.src,
                name: "X",
                url: "https://x.com/ddiaz_ale"
            },
            {
                icon: LinkedInIcon.src,
                name: "LinkedIn",
                url: "https://www.linkedin.com/in/alessandrodg"
            },
            {
                icon: InstagramIcon.src,
                name: "Instagram",
                url: "https://www.instagram.com/this._is_.ale/"
            },
            {
                icon: GitHubIcon.src,
                name: "GitHub",
                url: "https://github.com/nous-adg"
            }
        ],
        className: DEFAULT_FOUNDERS_CLASSNAME + "",
        imageClassName: "w-20 h-auto rounded-full object-cover absolute -top-12 right-5",
        background: ""
    },
    {
        name: "Andrey Martínez Zambrana",
        position: "Chief Product Officer (CPO) & Co-founder",
        image: FounderAndrey.src,
        description: "Simplicity with intent. Design that feels inevitable. Andrey turns strategy into experiences you can feel: fewer, better decisions; typography with rhythm; motion that guides, not distracts. He treats product and design as one craft—clarity, tactility, and care in every detail. He listens to customers, tests with users, and edits without mercy until each flow is obvious and every choice has purpose. The result: products people want to use—and that the business can scale.",
        socialLinks: [
            {
                icon: XIcon.src,
                name: " X",
                url: ""
            },
            {
                icon: LinkedInIcon.src,
                name: "LinkedIn",
                url: "https://www.linkedin.com/in/andrey-mart%C3%ADnez/"
            },
            {
                icon: InstagramIcon.src,
                name: "Instagram",
                url: "https://www.instagram.com/andrey26mz/"
            },
            {
                icon: GitHubIcon.src,
                name: "GitHub",
                url: "https://github.com/nous-amz"
            }
        ],
        className: DEFAULT_FOUNDERS_CLASSNAME + "",
        imageClassName: "w-20 h-auto rounded-full object-cover absolute -top-12 right-5",
        background: ""
    }
   
]

