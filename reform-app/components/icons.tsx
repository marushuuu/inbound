import type { SVGProps } from "react";

function base(props: SVGProps<SVGSVGElement>) {
  return {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...props,
  };
}

export function IconHome(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M3 10.5L12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </svg>
  );
}

export function IconSearch(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.5" y2="16.5" />
    </svg>
  );
}

export function IconDoc(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M6 3h9l4 4v14H6z" />
      <line x1="9" y1="11" x2="15" y2="11" />
      <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  );
}

export function IconCatalog(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M4 5a2 2 0 0 1 2-2h6v18H6a2 2 0 0 0-2 2z" />
      <path d="M20 5a2 2 0 0 0-2-2h-6v18h6a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export function IconCalendar(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="8" y1="3" x2="8" y2="7" />
      <line x1="16" y1="3" x2="16" y2="7" />
    </svg>
  );
}

export function IconAlert(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export function IconCheck(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base({ strokeWidth: 3, ...props })}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function IconChevronLeft(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

export function IconPlus(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export function IconArrowUpRight(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="9 7 17 7 17 15" />
    </svg>
  );
}

export function IconPen(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M12 19l7-7 3 3-7 7-3-3z" />
      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
      <path d="M2 2l7.586 7.586" />
      <circle cx="11" cy="11" r="2" />
    </svg>
  );
}

export function IconLock(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export function IconSettings(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M4 21V4a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v17" />
      <path d="M15 9h4a1 1 0 0 1 1 1v11" />
      <line x1="2" y1="21" x2="22" y2="21" />
      <line x1="8" y1="7" x2="11" y2="7" />
      <line x1="8" y1="11" x2="11" y2="11" />
      <line x1="8" y1="15" x2="11" y2="15" />
    </svg>
  );
}

export function IconClock(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15.5 14" />
    </svg>
  );
}

export function IconBath(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base({ strokeWidth: 1.6, ...props })}>
      <path d="M3 12h18v2a6 6 0 0 1-6 6H9a6 6 0 0 1-6-6z" />
      <path d="M5 12V5a2 2 0 0 1 4 0" />
      <line x1="12" y1="8" x2="12" y2="9.5" />
      <line x1="15" y1="8" x2="15" y2="9.5" />
      <line x1="18" y1="8" x2="18" y2="9.5" />
    </svg>
  );
}

export function IconVanity(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base({ strokeWidth: 1.6, ...props })}>
      <rect x="6" y="3" width="12" height="6" rx="1" />
      <line x1="4" y1="15" x2="20" y2="15" />
      <path d="M7 15a5 4 0 0 0 10 0" />
      <line x1="12" y1="11" x2="12" y2="13" />
    </svg>
  );
}
