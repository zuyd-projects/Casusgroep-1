// Common Card component for dashboard sections
export default function Card({ title, children, className = "" }) {
  return (
    <div className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm ${className}`}>
      {title && (
        <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <h3 className="text-lg font-medium">{title}</h3>
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
