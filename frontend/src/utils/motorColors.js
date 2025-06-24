// Motor type color utility
// Provides consistent colors for motor types throughout the application

export const getMotorTypeColors = (motorType) => {
  switch (motorType) {
    case 'A':
      return {
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        text: 'text-emerald-800 dark:text-emerald-300',
        border: 'border-emerald-200 dark:border-emerald-700',
        hover: 'hover:bg-emerald-200 dark:hover:bg-emerald-900/50',
        full: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
      };
    case 'B':
      return {
        bg: 'bg-amber-100 dark:bg-amber-900/30',
        text: 'text-amber-800 dark:text-amber-300',
        border: 'border-amber-200 dark:border-amber-700',
        hover: 'hover:bg-amber-200 dark:hover:bg-amber-900/50',
        full: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
      };
    case 'C':
      return {
        bg: 'bg-violet-100 dark:bg-violet-900/30',
        text: 'text-violet-800 dark:text-violet-300',
        border: 'border-violet-200 dark:border-violet-700',
        hover: 'hover:bg-violet-200 dark:hover:bg-violet-900/50',
        full: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300'
      };
    default:
      return {
        bg: 'bg-zinc-100 dark:bg-zinc-900/30',
        text: 'text-zinc-800 dark:text-zinc-300',
        border: 'border-zinc-200 dark:border-zinc-700',
        hover: 'hover:bg-zinc-200 dark:hover:bg-zinc-900/50',
        full: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-300'
      };
  }
};

// Helper function for motor type badges
export const MotorTypeBadge = ({ motorType, className = "" }) => {
  const colors = getMotorTypeColors(motorType);
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.full} ${className}`}>
      Motor {motorType}
    </span>
  );
};
