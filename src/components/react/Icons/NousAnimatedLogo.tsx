import React from 'react'

export const NousAnimatedLogo = () => {
  return (
    <>
    <svg width="99" height="99" viewBox="0 0 99 99" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>
            {`
            .eye-pupil {
                animation: eyeBlink 4s infinite;
                transform-origin: 49.5px 49.5px;
            }
            
            @keyframes eyeBlink {
                0%, 90%, 100% { 
                    transform: scaleY(1); 
                    opacity: 1; 
                }
                95% { 
                    transform: scaleY(0.1); 
                    opacity: 0.3; 
                }
            }
            `}
        </style>
        
        <path d="M49.5 0C76.838 6.68613e-05 99 22.162 99 49.5C99 76.838 76.838 98.9999 49.5 99C22.1619 99 2.0619e-05 76.8381 0 49.5C0 22.1619 22.1619 0 49.5 0ZM49.3936 8.69238C26.7973 8.69252 8.47949 27.0111 8.47949 49.6074C8.47968 72.2036 26.7974 90.5213 49.3936 90.5215C71.9899 90.5215 90.3084 72.2037 90.3086 49.6074C90.3086 27.011 71.99 8.69238 49.3936 8.69238Z" fill="url(#paint0_linear_71_1131)"/>
        
        <circle className="eye-pupil" cx="49.4995" cy="49.499" r="6.042" fill="#1AD6B3"/>
        
        <defs>
            <linearGradient id="paint0_linear_71_1131" x1="49.5" y1="0" x2="49.5" y2="99" gradientUnits="userSpaceOnUse">
                <stop stopColor="#1AD6B3"/>
                <stop offset="1" stopColor="#8458FF"/>
            </linearGradient>
        </defs>
    </svg>
    </>

  )
}