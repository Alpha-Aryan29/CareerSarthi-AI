import React from 'react';

interface Props {
  className?: string;
}

const CareerSarthiLogo: React.FC<Props> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 48 48"
    aria-hidden="true"
    focusable="false"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="24" cy="24" r="21" stroke="currentColor" strokeWidth="1.8" opacity=".35" />
    <path d="M13 34.5C18 31.8 17 27.4 22 25c4.4-2.1 8.2.5 12.8-5.1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <path d="m29.7 19.7 5.4-.3-.7 5.3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="21.5" cy="16.5" r="3.2" fill="currentColor" />
    <path d="M15.8 24.1c.7-2.2 2.7-3.6 5.7-3.6s5 1.4 5.7 3.6" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" />
    <path d="M24 3v4M45 24h-4M24 45v-4M3 24h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".7" />
  </svg>
);

export default CareerSarthiLogo;
