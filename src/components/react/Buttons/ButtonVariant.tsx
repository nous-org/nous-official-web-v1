import React from 'react';

interface ButtonVariantProps {
    href?: string;
    text?: string;
    variant?: 'primary' | 'secondary' | 'primaryPurple' | 'secondaryTurquoise';
    className?: string;
    icon?: boolean;
    strokeColor?: string;
    width?: string;
    target?: '_blank' | '_self' | '_parent' | '_top';
    ariaLabel?: string;
    isActionButton?: boolean;
}

export const ButtonVariant: React.FC<ButtonVariantProps> = ({
  
  target = '_self',
  width = '',
  href = '#',
  text = 'Button',
  variant = 'primary',
  className = '',
  icon = false,
  strokeColor = '#DCD4FF',
  ariaLabel = 'Button',

}) => {
  const baseStyles = `min-h-11 px-5 py-2.5 text-sm sm:text-base font-medium tracking-normal rounded-full transition-all duration-200 group inline-flex justify-center items-center gap-2 w-auto border focus:outline-none focus-visible:ring-2 focus-visible:ring-outline/60 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-black active:scale-[0.98] ${width ? `md:w-${width}` : ''}`;
  
  const variants = {
    primary: "border-transparent bg-outline text-primary-black shadow-sm shadow-outline/10 hover:bg-hover hover:shadow-outline/20",
    secondary: "border-white/10 bg-white/5 text-neutral-100 hover:border-outline/50 hover:bg-white/10",
    primaryPurple: "border-outline/45 bg-transparent text-outline hover:bg-outline/10 hover:border-outline",
    secondaryTurquoise: "border-primary-turquoise/45 bg-transparent text-primary-turquoise hover:bg-primary-turquoise/10 hover:border-primary-turquoise",
  };
  return (
    <a 
      href={href}
      target={target}
      className={[
        baseStyles,
        variants[variant],
        className
      ].join(' ')}
      aria-label={ariaLabel}
    >
      {text}
      {icon && (
        <span className=" transition-transform duration-300">
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 16 16" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip0_2068_1350)">
              <path 
                d="M6.00016 13.334H4.00016C3.29292 13.334 2.61464 13.053 2.11454 12.5529C1.61445 12.0528 1.3335 11.3746 1.3335 10.6673V4.66732C1.3335 3.96007 1.61445 3.2818 2.11454 2.7817C2.61464 2.2816 3.29292 2.00065 4.00016 2.00065H11.3335C12.0407 2.00065 12.719 2.2816 13.2191 2.7817C13.7192 3.2818 14.0002 3.96007 14.0002 4.66732V6.66732M5.3335 1.33398V2.66732M10.0002 1.33398V2.66732M1.3335 5.33398H14.0002M12.3335 10.4293L11.3335 11.4293" 
                stroke={strokeColor} 
                strokeWidth="1.33333" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              <path 
                d="M11.3333 14.6667C13.1743 14.6667 14.6667 13.1743 14.6667 11.3333C14.6667 9.49238 13.1743 8 11.3333 8C9.49238 8 8 9.49238 8 11.3333C8 13.1743 9.49238 14.6667 11.3333 14.6667Z" 
                stroke={strokeColor} 
                strokeWidth="1.33333" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </g>
            <defs>
              <clipPath id="clip0_2068_1350">
                <rect width="16" height="16" fill="white"/>
              </clipPath>
            </defs>
          </svg>
        </span>
      )}
    </a>
  );
};
