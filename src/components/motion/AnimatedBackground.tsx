"use client";

export default function AnimatedBackground({
  variant = "hero",
  className = "",
}: {
  variant?: "hero" | "soft";
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <div
        className="bg-orb bg-orb--blue h-[420px] w-[420px] -left-24 -top-28"
        style={{ animationDelay: "-3s" }}
      />
      <div
        className="bg-orb bg-orb--cyan h-[380px] w-[380px] -right-28 top-1/4"
        style={{ animationDelay: "-8s" }}
      />
      {variant === "hero" && (
        <>
          <div className="bg-orb bg-orb--amber h-[300px] w-[300px] left-1/3 top-2/3 opacity-60" />
          <div className="hero-grid absolute inset-0" />
        </>
      )}
    </div>
  );
}