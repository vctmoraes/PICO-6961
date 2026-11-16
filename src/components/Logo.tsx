export function Logo() {
  return (
    <div className="logo" aria-label="Pico Trip">
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 4L4 20H20L12 4Z" fill="#D9480F" />
        <path d="M12 4L16 11H8L12 4Z" fill="#FFFFFF" opacity="0.35" />
      </svg>
      <div>
        Pico<span>Trip</span>
      </div>
    </div>
  );
}
