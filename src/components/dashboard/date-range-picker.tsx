// src/components/dashboard/date-range-picker.tsx
"use client"

import * as React from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { addDays, format } from "date-fns"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
    dateRange?: DateRange;
    onDateChange: (dateRange: DateRange | undefined) => void;
}

export function DateRangePicker({
  className,
  dateRange,
  onDateChange
}: DateRangePickerProps) {
  
  const handlePresetChange = (value: string) => {
    const now = new Date();
    switch (value) {
        case "today":
            onDateChange({ from: now, to: now });
            break;
        case "last7":
            onDateChange({ from: addDays(now, -6), to: now });
            break;
        case "last30":
            onDateChange({ from: addDays(now, -29), to: now });
            break;
        case "last90":
            onDateChange({ from: addDays(now, -89), to: now });
            break;
        case "ytd":
             onDateChange({ from: new Date(now.getFullYear(), 0, 1), to: now });
            break;
    }
  }

  return (
    <div className={cn("grid gap-2 md:flex md:items-center", className)}>
        <Select onValueChange={handlePresetChange}>
            <SelectTrigger className="w-full md:w-auto">
                <SelectValue placeholder="Select a preset" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="last7">Last 7 days</SelectItem>
                <SelectItem value="last30">Last 30 days</SelectItem>
                <SelectItem value="last90">Last 90 days</SelectItem>
                <SelectItem value="ytd">Year-to-date</SelectItem>
            </SelectContent>
        </Select>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full md:w-[300px] justify-start text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} -{" "}
                  {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={onDateChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
