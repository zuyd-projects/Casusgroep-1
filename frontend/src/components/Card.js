export default function Card({
  title,
  children,
  className = "",
  padded = true,
}) {
  return (
    <div
      className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-card transition-colors text-gray-900 dark:text-gray-100 ${className}`}
    >
      {title && (
        <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <h3 className="text-lg font-medium text-zinc-800 dark:text-zinc-100">
            {title}
          </h3>
        </div>
      )}
      <div className={padded ? "p-5" : ""}>{children}</div>
    </div>
  );
}
