
"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const tabsListVariants = cva(
  "inline-flex items-center justify-center rounded-lg p-1 text-muted-foreground",
  {
    variants: {
      variant: {
        default: "bg-muted",
        underline: "bg-transparent border-b-2 rounded-none p-0",
      }
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const tabsTriggerVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-sm",
        underline: "bg-transparent rounded-none p-2 data-[state=active]:font-bold data-[state=active]:text-foreground data-[state=active]:shadow-[inset_0_-2px_0_0_hsl(var(--primary))] data-[state=inactive]:hover:bg-muted/50",
      }
    },
    defaultVariants: {
      variant: "default",
    },
  }
)


interface TabsListProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>, VariantProps<typeof tabsListVariants> {}
const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, variant, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(tabsListVariants({variant}), className)}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

interface TabsTriggerProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>, VariantProps<typeof tabsTriggerVariants> {}
const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, variant, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(tabsTriggerVariants({variant}), className)}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
