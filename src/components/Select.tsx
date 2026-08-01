import { forwardRef, type ComponentPropsWithoutRef, type ComponentRef } from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * Styled Radix Select — replaces the native `<select>` (which can't be
 * themed consistently across browsers) with an accessible custom dropdown.
 */
export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;

export const SelectTrigger = forwardRef<
  ComponentRef<typeof SelectPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...rest }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      'flex h-9 w-full items-center justify-between gap-2 rounded-md border border-border',
      'bg-surface px-3 text-sm text-fg transition focus:outline-none focus:border-action',
      'focus:shadow-focus disabled:cursor-not-allowed disabled:opacity-50',
      'data-[placeholder]:text-fg-3',
      className,
    )}
    {...rest}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-3.5 w-3.5 shrink-0 text-fg-3" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

export const SelectContent = forwardRef<
  ComponentRef<typeof SelectPrimitive.Content>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...rest }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      position={position}
      sideOffset={4}
      className={cn(
        'z-50 max-h-72 overflow-hidden rounded-md border border-border bg-surface shadow-lg',
        position === 'popper' && 'min-w-[var(--radix-select-trigger-width)]',
        className,
      )}
      {...rest}
    >
      <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

export const SelectItem = forwardRef<
  ComponentRef<typeof SelectPrimitive.Item>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...rest }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-pointer select-none items-center whitespace-nowrap rounded-sm py-1.5',
      'pl-7 pr-3 text-[13px] text-fg outline-none data-[highlighted]:bg-surface-muted',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className,
    )}
    {...rest}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-3.5 w-3.5" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;
