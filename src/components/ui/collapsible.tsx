"use client"

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"
import { cn } from "@/lib/utils"

const Collapsible = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Root> & {
    asChild?: boolean
  }
>(({ className, asChild, ...props }, ref) => (
  <CollapsiblePrimitive.Root
    ref={ref}
    className={cn("ui-open:some-class ui-closed:some-other-class", className)}
    asChild={asChild}
    {...props}
  />
))
Collapsible.displayName = "Collapsible"


const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger

const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
