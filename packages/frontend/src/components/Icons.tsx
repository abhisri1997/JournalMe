type IconProps = {
  className?: string;
  size?: number;
};

const baseProps = (size?: number) => ({
  width: size ?? 18,
  height: size ?? 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
});

export function HomeIcon({ className, size }: IconProps) {
  return (
    <svg {...baseProps(size)} className={className}>
      <path d='M3 11l9-8 9 8' />
      <path d='M9 22V12h6v10' />
    </svg>
  );
}

export function JournalIcon({ className, size }: IconProps) {
  return (
    <svg {...baseProps(size)} className={className}>
      <path d='M6 2h9a3 3 0 013 3v15a2 2 0 01-2 2H6a3 3 0 01-3-3V5a3 3 0 013-3z' />
      <path d='M6 2v20' />
      <path d='M10 8h6' />
      <path d='M10 12h6' />
      <path d='M10 16h6' />
    </svg>
  );
}

export function UserIcon({ className, size }: IconProps) {
  return (
    <svg {...baseProps(size)} className={className}>
      <circle cx='12' cy='7' r='4' />
      <path d='M5.5 21a8.5 8.5 0 0113 0' />
    </svg>
  );
}
