'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ToolbarButtonProps extends React.ComponentProps<typeof Button> {
  children?: React.ReactNode;
}

export function ToolbarButton({
  className,
  children,
  ...props
}: ToolbarButtonProps) {
  return (
    <Button
      size="sm"
      className={cn('w-10 gap-1.5 md:w-auto', className)}
      {...props}
    >
      {children}
    </Button>
  );
}
