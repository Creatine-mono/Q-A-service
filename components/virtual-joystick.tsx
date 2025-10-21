"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"

type Direction = "up" | "down" | "left" | "right" | null

type Props = {
  onDirectionChange?: (direction: Direction) => void
  className?: string
}

export default function VirtualJoystick({ onDirectionChange, className = "" }: Props) {
  const [activeDirection, setActiveDirection] = useState<Direction>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const handlePress = (direction: Direction) => {
    setActiveDirection(direction)
    onDirectionChange?.(direction)

    // Continue sending direction while pressed
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      onDirectionChange?.(direction)
    }, 100)
  }

  const handleRelease = () => {
    setActiveDirection(null)
    onDirectionChange?.(null)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const buttonClass = (direction: Direction) =>
    `touch-none select-none flex items-center justify-center w-16 h-16 rounded-lg border-2 transition-all ${
      activeDirection === direction
        ? "bg-blue-500 border-blue-600 scale-95"
        : "bg-white/90 border-black/30 active:scale-95"
    }`

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      {/* Up button */}
      <button
        onTouchStart={() => handlePress("up")}
        onTouchEnd={handleRelease}
        onMouseDown={() => handlePress("up")}
        onMouseUp={handleRelease}
        onMouseLeave={handleRelease}
        className={buttonClass("up")}
        aria-label="Move up"
      >
        <ChevronUp className="w-8 h-8" />
      </button>

      {/* Left, Center, Right */}
      <div className="flex gap-2">
        <button
          onTouchStart={() => handlePress("left")}
          onTouchEnd={handleRelease}
          onMouseDown={() => handlePress("left")}
          onMouseUp={handleRelease}
          onMouseLeave={handleRelease}
          className={buttonClass("left")}
          aria-label="Move left"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>

        {/* Center dot (visual only) */}
        <div className="w-16 h-16 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-black/40" />
        </div>

        <button
          onTouchStart={() => handlePress("right")}
          onTouchEnd={handleRelease}
          onMouseDown={() => handlePress("right")}
          onMouseUp={handleRelease}
          onMouseLeave={handleRelease}
          className={buttonClass("right")}
          aria-label="Move right"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>

      {/* Down button */}
      <button
        onTouchStart={() => handlePress("down")}
        onTouchEnd={handleRelease}
        onMouseDown={() => handlePress("down")}
        onMouseUp={handleRelease}
        onMouseLeave={handleRelease}
        className={buttonClass("down")}
        aria-label="Move down"
      >
        <ChevronDown className="w-8 h-8" />
      </button>
    </div>
  )
}
