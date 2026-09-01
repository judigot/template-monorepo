export function FrameworkBadge() {
  return (
    <p className="mb-6 flex justify-center">
      <span
        data-testid="framework-badge"
        className="rounded-full bg-gradient-to-r from-green-600 to-teal-600 px-4 py-1 text-sm font-semibold uppercase tracking-widest text-white"
      >
        Next.js
      </span>
    </p>
  );
}
