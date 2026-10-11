interface LogoMarkProps {
  /** Size classes, for example `h-10 w-10`. */
  sizeClass: string;
}

/** The gold mark of the logo, shared by the Desktop and the compact header (ENG-F07 R1, R10). */
export function LogoMark({ sizeClass }: LogoMarkProps) {
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-lg border border-gold text-xl text-gold ${sizeClass}`}
    >
      帥
    </span>
  );
}
