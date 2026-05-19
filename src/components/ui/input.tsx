import * as React from 'react'

import { cn } from '@/lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        data-slot="input"
        className={cn(
          'bg-white file:bg-gray-200 placeholder:text-gray-700 selection:text-gray-500 border-border h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base  outline-none file:inline-flex file:h-7 file:border-0 file:text-sm disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
