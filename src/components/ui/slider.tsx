"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

interface SliderProps {
  className?: string
  defaultValue?: number | readonly number[]
  value?: number | readonly number[]
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  orientation?: "horizontal" | "vertical"
  onValueChange?: (value: number) => void
  onValueCommitted?: (value: number) => void
}

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  onValueChange,
  onValueCommitted,
  ...props
}: SliderProps) {
  const resolvedValue = React.useMemo(() => {
    if (typeof value === "number") return value
    if (Array.isArray(value)) return value[0] ?? min
    if (typeof defaultValue === "number") return defaultValue
    if (Array.isArray(defaultValue)) return defaultValue[0] ?? min
    return min
  }, [value, defaultValue, min])

  const percentage = max === min ? 0 : ((resolvedValue - min) / (max - min)) * 100

  return (
    <div
      data-slot="slider"
      className={cn("relative flex w-full items-center", className)}
    >
      <div className="pointer-events-none absolute left-0 right-0 h-1 rounded-full bg-muted" />
      <div
        className="pointer-events-none absolute left-0 h-1 rounded-full bg-primary"
        style={{ width: `${percentage}%` }}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={props.step}
        disabled={props.disabled}
        value={resolvedValue}
        onChange={(event) => onValueChange?.(Number(event.target.value))}
        onMouseUp={(event) => onValueCommitted?.(Number((event.target as HTMLInputElement).value))}
        onTouchEnd={(event) => onValueCommitted?.(Number((event.target as HTMLInputElement).value))}
        className="relative z-10 h-5 w-full cursor-pointer appearance-none bg-transparent disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:mt-[-4px] [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-ring [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-sm [&::-moz-range-track]:h-1 [&::-moz-range-track]:bg-transparent [&::-moz-range-thumb]:size-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-ring [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:box-border"
      />
    </div>
  )
}

export { Slider }
