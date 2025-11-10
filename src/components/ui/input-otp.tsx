import * as React from "react"

import { cn } from "@/lib/utils"

type InputOTPContextValue = {
  slots: string[]
  maxLength: number
  setSlots: (slots: string[]) => void
  registerSlot: (index: number, ref: HTMLInputElement | null) => void
  focusSlot: (index: number) => void
  disabled?: boolean
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]
  clearSlots: () => void
}

const InputOTPContext = React.createContext<InputOTPContextValue | null>(null)

function useInputOTPContext(component: string) {
  const context = React.useContext(InputOTPContext)

  if (!context) {
    throw new Error(`${component} must be used within <InputOTP />`)
  }

  return context
}

export interface InputOTPProps extends React.HTMLAttributes<HTMLDivElement> {
  maxLength: number
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  disabled?: boolean
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]
  allowClear?: boolean
  onClear?: () => void
}

export const InputOTP = React.forwardRef<HTMLDivElement, InputOTPProps>(
  (
    {
      maxLength,
      value,
      defaultValue,
      className,
      onChange,
      disabled,
      inputMode = "numeric",
      children,
      allowClear = true,
      onClear,
      ...rest
    },
    ref
  ) => {
    const isControlled = value !== undefined

    const toSlots = React.useCallback(
      (source?: string): string[] => {
        const initial = source ? source.split("").slice(0, maxLength) : []
        return Array.from({ length: maxLength }, (_, idx) => initial[idx] ?? "")
      },
      [maxLength]
    )

    const [uncontrolledSlots, setUncontrolledSlots] = React.useState<string[]>(
      () => toSlots(defaultValue)
    )

    const slots = React.useMemo(
      () => (isControlled ? toSlots(value) : uncontrolledSlots),
      [isControlled, toSlots, value, uncontrolledSlots]
    )

    const slotRefs = React.useRef<Array<HTMLInputElement | null>>([])

    const setSlots = React.useCallback(
      (nextSlots: string[]) => {
        if (!isControlled) {
          setUncontrolledSlots(nextSlots)
        }
        const normalized = nextSlots.join("")
        onChange?.(normalized)
      },
      [isControlled, onChange]
    )

    const registerSlot = React.useCallback((index: number, slot: HTMLInputElement | null) => {
      slotRefs.current[index] = slot ?? null
    }, [])

    const focusSlot = React.useCallback((index: number) => {
      const next = slotRefs.current[index]
      if (!next) return

      if (typeof window !== "undefined") {
        window.requestAnimationFrame(() => {
          next.focus()
          next.select()
        })
      } else {
        next.focus()
        next.select()
      }
    }, [])

    const clearSlots = React.useCallback(() => {
      const emptySlots = Array.from({ length: maxLength }, () => "")
      setSlots(emptySlots)
      onClear?.()
      focusSlot(0)
    }, [focusSlot, maxLength, onClear, setSlots])

    const contextValue = React.useMemo<InputOTPContextValue>(
      () => ({
        slots,
        maxLength,
        setSlots,
        registerSlot,
        focusSlot,
        disabled,
        inputMode,
        clearSlots,
      }),
      [slots, maxLength, setSlots, registerSlot, focusSlot, disabled, inputMode, clearSlots]
    )

    return (
      <InputOTPContext.Provider value={contextValue}>
        <div ref={ref} className={cn("flex w-full items-center gap-3", className)} {...rest}>
          <div className="flex items-center gap-3">{children}</div>
          {allowClear && !disabled && (
            <button
              type="button"
              onClick={clearSlots}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition hover:bg-muted/80 focus:outline-none"
              aria-label="Clear code"
            >
              ×
            </button>
          )}
        </div>
      </InputOTPContext.Provider>
    )
  }
)
InputOTP.displayName = "InputOTP"

export interface InputOTPGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

export const InputOTPGroup = React.forwardRef<HTMLDivElement, InputOTPGroupProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center flex-nowrap overflow-hidden rounded-xl border border-gray-300 bg-white",
        className
      )}
      {...props}
    />
  )
)
InputOTPGroup.displayName = "InputOTPGroup"

export interface InputOTPSeparatorProps extends React.HTMLAttributes<HTMLSpanElement> {}

export const InputOTPSeparator = React.forwardRef<HTMLSpanElement, InputOTPSeparatorProps>(
  ({ className, children = "—", ...props }, ref) => (
    <span
      ref={ref}
      role="presentation"
      className={cn("text-sm font-medium text-muted-foreground mx-1.5", className)}
      {...props}
    >
      {children}
    </span>
  )
)
InputOTPSeparator.displayName = "InputOTPSeparator"

export interface InputOTPSlotProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  index: number
}

export const InputOTPSlot = React.forwardRef<HTMLInputElement, InputOTPSlotProps>(
  ({ index, className, onChange, onKeyDown, onPaste, ...rest }, forwardedRef) => {
    const { slots, maxLength, setSlots, registerSlot, focusSlot, disabled, inputMode } =
      useInputOTPContext("InputOTPSlot")
    const localRef = React.useRef<HTMLInputElement>(null)

    React.useImperativeHandle(forwardedRef, () => localRef.current as HTMLInputElement)

    React.useEffect(() => {
      registerSlot(index, localRef.current)
    }, [index, registerSlot])

    const safeValue = React.useMemo(() => slots[index] ?? "", [slots, index])

    const updateValueAtIndex = React.useCallback(
      (nextChar: string, startIndex = index) => {
        const nextSlots = [...slots]

        if (startIndex >= 0 && startIndex < maxLength) {
          nextSlots[startIndex] = nextChar
        }

        setSlots(nextSlots)
      },
      [slots, maxLength, setSlots, index]
    )

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = event.target.value
      const lastChar = inputValue.slice(-1)
      const sanitized = lastChar.replace(/\s+/g, "")

      if (!sanitized) {
        updateValueAtIndex("", index)
        onChange?.(event)
        return
      }

      if (inputMode === "numeric" && !/^\d$/.test(sanitized)) {
        event.preventDefault()
        return
      }

      updateValueAtIndex(sanitized, index)
      onChange?.(event)

      if (index < maxLength - 1) {
        focusSlot(index + 1)
      }
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      const isShiftTab = event.key === "Tab" && event.shiftKey

      if (event.key === "Backspace" && !safeValue && index > 0) {
        event.preventDefault()
        focusSlot(index - 1)
        return
      }

      if (event.key === "ArrowLeft" || isShiftTab) {
        if (index > 0) {
          event.preventDefault()
          focusSlot(index - 1)
        }
        return
      }

      if (event.key === "ArrowRight" || event.key === "Tab") {
        if (index < maxLength - 1) {
          event.preventDefault()
          focusSlot(index + 1)
        }
        return
      }

      onKeyDown?.(event)
    }

    const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
      const target = event.target
      if (typeof window !== "undefined") {
        window.requestAnimationFrame(() => {
          target.select()
        })
      } else {
        target.select()
      }
    }

    const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
      const pasted = event.clipboardData.getData("text")
      if (!pasted) {
        return
      }

      const sanitized = pasted.replace(/\s+/g, "")
      if (inputMode === "numeric" && /\D/.test(sanitized)) {
        return
      }

      event.preventDefault()

      const nextSlots = [...slots]
      let cursor = index
      for (const char of sanitized) {
        if (cursor >= maxLength) break
        nextSlots[cursor] = char
        cursor += 1
      }

      setSlots(nextSlots)
      onPaste?.(event)

      if (cursor <= maxLength - 1) {
        focusSlot(cursor)
      }
    }

    return (
      <input
        ref={localRef}
        inputMode={inputMode}
        type="text"
        autoComplete="one-time-code"
        maxLength={1}
        value={safeValue}
        disabled={disabled}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onPaste={handlePaste}
        className={cn(
          "flex h-10 w-10 items-center justify-center border-r border-gray-200 bg-transparent text-sm font-semibold leading-none text-center text-gray-900 transition focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 last:border-r-0",
          className
        )}
        {...rest}
      />
    )
  }
)
InputOTPSlot.displayName = "InputOTPSlot"

export function InputOTPDemo() {
  return (
    <InputOTP maxLength={6}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  )
}

