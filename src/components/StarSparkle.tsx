interface StarSparkleProps {
  size?: number;
  color?: string;
  className?: string;
  animate?: boolean;
}

export default function StarSparkle({
  size = 24,
  color = "#b8e04a",
  className = "",
  animate = false,
}: StarSparkleProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      className={`${animate ? "star-animate" : ""} ${className}`}
      aria-hidden="true"
    >
      {/* 4-pointed star */}
      <path d="M12 0 L13.5 10.5 L24 12 L13.5 13.5 L12 24 L10.5 13.5 L0 12 L10.5 10.5 Z" />
    </svg>
  );
}
