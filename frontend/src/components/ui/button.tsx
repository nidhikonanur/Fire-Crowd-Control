import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--background))] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] shadow-[0_12px_24px_hsl(var(--accent)/0.24)] hover:bg-[hsl(var(--accent-2))]',
        secondary: 'border border-[hsl(var(--border))] bg-[hsl(var(--panel))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--panel-2))]',
        ghost: 'text-[hsl(var(--foreground))] hover:bg-[hsl(var(--panel-2))]',
        danger: 'bg-[hsl(var(--danger))] text-white hover:bg-[hsl(var(--danger-2))]',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-xl px-3 text-xs',
        lg: 'h-11 rounded-2xl px-6',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...props }, ref) => {
  return <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = 'Button';

export { Button, buttonVariants };
