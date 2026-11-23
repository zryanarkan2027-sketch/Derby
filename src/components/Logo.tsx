interface LogoProps {
  /** Height in pixels. Width follows the logo's proportions. */
  height?: number;
  /** false = only the round icon, true = icon + "Derby" text */
  withText?: boolean;
  className?: string;
}

export default function Logo({ height = 36, withText = true, className }: LogoProps) {
  const width = withText ? Math.round((height * 419) / 120) : height;
  return (
    <img
      src={withText ? '/derby-logo.svg' : '/derby-icon.svg'}
      alt="Derby"
      width={width}
      height={height}
      className={className}
      style={{ height, width, display: 'block' }}
      draggable={false}
    />
  );
}
