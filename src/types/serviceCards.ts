
export interface Button {
    text: string;
    variant: 'primary' | 'secondary' | 'primaryPurple' | 'secondaryTurquoise';
    href: string;
    target: '_blank' | '_self' | '_parent' | '_top';
    ariaLabel: string;
}


export interface ServiceCard {
    title: string;
    description: string;
    img: string;
    buttons: Button[];
}