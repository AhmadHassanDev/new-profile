// Tools in their own colours, each on the tile its brand sits on. Next.js, Vercel and Sanity's
// current mark are black and white by design; Figma is its five shapes. Marks from the brands' own
// sites and Simple Icons (simpleicons.org, CC0).

const NEXT =
  "M18.665 21.978C16.758 23.255 14.465 24 12 24 5.377 24 0 18.623 0 12S5.377 0 12 0s12 5.377 12 12c0 3.583-1.574 6.801-4.067 9.001L9.219 7.2H7.2v9.596h1.615V9.251l9.85 12.727Zm-3.332-8.533 1.6 2.061V7.2h-1.6v6.245Z";
// Sanity's current mark (from sanity.io)
const SANITY =
  "M14.49 9.4344L13.9356 8.496L11.2512 10.0848L14.232 6.3972L14.6832 6.1392L14.5716 5.9772L14.7768 5.724L13.836 4.9632L13.4052 5.496L4.7136 10.4352L7.9272 6.6816L13.9128 3.4944L13.344 2.4264L10.0836 4.1616L11.6892 2.2872L10.77 1.5L7.1568 5.7204L3.5676 7.632L6.3156 4.104L8.0364 3.234L7.4904 2.154L2.4744 4.6908L3.8424 2.9316L2.8872 2.1888L0 5.9004L0.0443994 5.9352L0.5844 7.002L3.7848 5.3832L0.8676 9.1296L1.3452 9.5004L1.6296 10.0356L5.0004 8.2404L1.2888 12.576L2.208 13.362L2.3928 13.146L11.346 8.0424L8.3736 11.7192L8.4216 11.7588L8.4168 11.7612L9.0336 12.8028L12.9864 10.464L11.4648 12.8496L12.4848 13.5L14.9088 9.7008L14.49 9.4344Z";

const LOGOS: Record<string, { tile: string; mark: React.ReactNode }> = {
  Figma: {
    tile: "#1e1e1e",
    mark: (
      <svg viewBox="0 0 38 57" className="h-[58%]">
        <path fill="#1abcfe" d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z" />
        <path fill="#0acf83" d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0z" />
        <path fill="#ff7262" d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z" />
        <path fill="#f24e1e" d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z" />
        <path fill="#a259ff" d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z" />
      </svg>
    ),
  },
  "Next.js": {
    tile: "#000000",
    mark: (
      <svg viewBox="0 0 24 24" className="h-[56%]">
        <path fill="#ffffff" d={NEXT} />
      </svg>
    ),
  },
  Sanity: {
    tile: "#0b0b0b",
    mark: (
      <svg viewBox="0 0 15 15" className="h-[52%]">
        <path fill="#ffffff" d={SANITY} />
      </svg>
    ),
  },
  Vercel: {
    tile: "#000000",
    mark: (
      <svg viewBox="0 0 24 24" className="h-[46%]">
        <path fill="#ffffff" d="M24 22.525H0l12-21.05 12 21.05z" />
      </svg>
    ),
  },
};

export default function ToolLogo({ name, className = "" }: { name: string; className?: string }) {
  const logo = LOGOS[name];
  if (!logo) return null;
  return (
    <span
      aria-hidden
      className={`grid place-items-center rounded-2xl ${className}`}
      style={{ background: logo.tile }}
    >
      {logo.mark}
    </span>
  );
}
