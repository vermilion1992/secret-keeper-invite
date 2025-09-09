import React from 'react';
import { cn } from '@/lib/utils';

interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  selected?: boolean;
  count?: number;
  className?: string;
}

const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  ({ children, selected = false, count, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        role="button"
        aria-pressed={selected}
        
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full border transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "hover:bg-accent hover:text-accent-foreground",
          selected
            ? "bg-primary text-primary-foreground border-primary shadow-sm"
            : "bg-background text-foreground border-border hover:border-accent-foreground/20",
          className
        )}
        {...props}
      >
        <span>{children}</span>
        {count !== undefined && count > 0 && (
          <span className={cn(
            "inline-flex items-center justify-center w-5 h-5 text-xs rounded-full",
            selected
              ? "bg-primary-foreground/20 text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}>
            {count}
          </span>
        )}
      </button>
    );
  }
);

Chip.displayName = "Chip";

interface ChipGroupProps {
  label: string;
  options: Array<{ value: string; label: string; count?: number }>;
  selected: string[];
  onSelectionChange: (selected: string[]) => void;
  className?: string;
}

const ChipGroup = React.forwardRef<HTMLFieldSetElement, ChipGroupProps>(
  ({ label, options, selected, onSelectionChange, className }, ref) => {
    const handleChipClick = (value: string) => {
      const newSelected = selected.includes(value)
        ? selected.filter(s => s !== value)
        : [...selected, value];
      onSelectionChange(newSelected);
    };

    const handleKeyDown = (event: React.KeyboardEvent, value: string) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleChipClick(value);
      }
    };

    return (
      <fieldset ref={ref} className={cn("space-y-2", className)}>
        <legend className="text-sm font-medium text-foreground">{label}</legend>
        <div className="flex flex-wrap gap-2">
          {options.map(({ value, label: optionLabel, count }) => (
            <Chip
              key={value}
              selected={selected.includes(value)}
              count={count}
              onClick={() => handleChipClick(value)}
              onKeyDown={(e) => handleKeyDown(e, value)}
            >
              {optionLabel}
            </Chip>
          ))}
        </div>
      </fieldset>
    );
  }
);

ChipGroup.displayName = "ChipGroup";

export { Chip, ChipGroup };