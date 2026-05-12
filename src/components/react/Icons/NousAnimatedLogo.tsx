export const NousAnimatedLogo = () => {
  return (
    <>
    <svg width="99" height="99" viewBox="0 0 99 99" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>
            {`
            .eye-pupil {
                animation: eyeBlink 5.5s infinite;
                transform-origin: 49.5px 49.5px;
            }

            @keyframes eyeBlink {
                0%, 82%, 90%, 98%, 100% {
                    transform: scaleY(1);
                    opacity: 1;
                }
                86%, 94% {
                    transform: scaleY(0.12);
                    opacity: 0.45;
                }
            }
            `}
        </style>

        <path d="M49.5 0C76.838 6.68613e-05 99 22.162 99 49.5C99 76.838 76.838 98.9999 49.5 99C22.1619 99 2.0619e-05 76.8381 0 49.5C0 22.1619 22.1619 0 49.5 0ZM49.3936 8.69238C26.7973 8.69252 8.47949 27.0111 8.47949 49.6074C8.47968 72.2036 26.7974 90.5213 49.3936 90.5215C71.9899 90.5215 90.3084 72.2037 90.3086 49.6074C90.3086 27.011 71.99 8.69238 49.3936 8.69238Z" fill="url(#nous-cta-logo-gradient)"/>

        <circle className="eye-pupil" cx="49.4995" cy="49.499" r="6.042" fill="#F8F7FF"/>

        <defs>
            <linearGradient id="nous-cta-logo-gradient" x1="49.5" y1="0" x2="49.5" y2="99" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFFFFF"/>
                <stop offset="1" stopColor="#DCD4FF"/>
            </linearGradient>
        </defs>
    </svg>
    </>

  )
}
