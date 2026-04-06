import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';

const badgeVariants = cva('inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide', {
  variants: {
    variant: {
      default: 'border-[hsl(var(--border))] bg-[hsl(var(--panel-2))] text-[hsl(var(--foreground))]',
      success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      warning: 'border-amber-200 bg-amber-50 text-amber-700',
      danger: 'border-red-200 bg-red-50 text-red-700',
      muted: 'border-[hsl(var(--border))] bg-[hsl(var(--panel))] text-[hsl(var(--muted-foreground))]',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

function Badge({ className, variant, ...props }: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>): JSX.Element {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
