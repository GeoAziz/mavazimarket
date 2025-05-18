
"use client"

import * as React from "react"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangePickerProps
  extends React.ComponentPropsWithoutRef<typeof PopoverTrigger> {
  initialDateFrom?: Date
  initialDateTo?: Date
  onUpdate?: (values: { range: DateRange; rangeCompare?: DateRange }) => void
  align?: "start" | "center" | "end"
  locale?: string
  showCompare?: boolean
}

export function DateRangePicker({
  className,
  initialDateFrom,
  initialDateTo,
  onUpdate,
  align = "start",
  locale = "en-US",
  showCompare = true,
}: DateRangePickerProps) {
  const [range, setRange] = React.useState<DateRange | undefined>({
    from: initialDateFrom,
    to: initialDateTo,
  })
  const [rangeCompare, setRangeCompare] = React.useState<DateRange | undefined>(
    undefined
  )

  // Update the parent component when the range changes
  React.useEffect(() => {
    if (onUpdate && range) {
      onUpdate({ range, rangeCompare })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range, rangeCompare]) // Do not add onUpdate to deps, it might cause infinite loop


  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[260px] justify-start text-left font-normal",
              !range && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {range?.from ? (
              range.to ? (
                <>
                  {format(range.from, "LLL dd, y")} -{" "}
                  {format(range.to, "LLL dd, y")}
                </>
              ) : (
                format(range.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={align}>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={range?.from}
            selected={range}
            onSelect={setRange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
