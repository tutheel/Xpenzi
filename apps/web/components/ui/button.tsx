import { Slot } from '@radix-ui/react-slot';
import type { ButtonHTMLAttributes } from 'react';
import { forwardRef } from 'react';

import { cn } from '@/lib/utils';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: 'default' | 'secondary' | 'ghost' | 'destructive';
};

const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
  default:
    'bg-primary text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline-primary',
  secondary:
    'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 focus-visible:outline-secondary',
  ghost:
    'bg-transparent text-foreground hover:bg-muted focus-visible:outline-border focus-visible:ring-1 focus-visible:ring-border',
  destructive:
    'bg-destructive text-destructive-foreground shadow hover:bg-destructive/90 focus-visible:outline-destructive',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild = false, className, type = 'button', variant = 'default', ...rest }, ref) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-60',
          variantStyles[variant],
          className,
        )}
        type={asChild ? undefined : type}
        {...rest}
      />
    );
  },
);

Button.displayName = 'Button';
