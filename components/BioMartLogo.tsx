import React from 'react';

interface BioMartLogoProps {
  className?: string;
  size?: number | string;
  color?: string;
  withText?: boolean;
  textClassName?: string;
}

/**
 * Official BioMart Brand Logo (512x512 vector path)
 * Shopping bag with lightning bolt and dynamic notch, clean without box container.
 */
export const BioMartLogo: React.FC<BioMartLogoProps> = ({
  className = 'w-8 h-8',
  size,
  color = '#1F7A5A',
  withText = false,
  textClassName = 'text-base font-bold tracking-tight text-content-primary',
}) => {
  const icon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      fill="currentColor"
      className={className}
      style={{
        color: color,
        ...(size ? { width: size, height: size } : {}),
      }}
      aria-label="BioMart Logo"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M256 104C217.34 104 186 135.34 186 174V184H148C138.059 184 130 192.059 130 202V386C130 395.941 138.059 404 148 404H364C373.941 404 382 395.941 382 386V236L354 264V376H158V212H354V228L382 200V198C382 190.268 375.732 184 368 184H326V174C326 135.34 294.66 104 256 104ZM214 184V174C214 150.804 232.804 132 256 132C279.196 132 298 150.804 298 174V184H214Z"
      />
      <path d="M225 238C225.8 235.6 228 234 230.5 234H260C263.1 234 265.1 237.3 263.6 240L246 273H304C307.3 273 309.2 276.8 307.2 279.4L246.5 362.5C244.2 365.6 239.3 363.6 239.9 359.8L248.5 308H204C200.9 308 198.8 304.9 199.8 302L225 238Z" />
    </svg>
  );

  if (!withText) return icon;

  return (
    <div className="inline-flex items-center gap-[1px]">
      {icon}
      <span className={textClassName}>
        BioMart
      </span>
    </div>
  );
};

export default BioMartLogo;
