"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export type Option = {
  value: string // El ID (ej: "15")
  label: string // El Nombre (ej: "Potencia")
}

type Props = {
  options: Option[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  emptyText?: string
  className?: string
  contentClassName?: string
  sideOffset?: number
  align?: "start" | "center" | "end"
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Seleccionar...",
  emptyText = "No encontrado.",
  className,
  contentClassName,
  sideOffset = 4,
  align = "start",
}: Props) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const selectedLabel = options.find((option) => option.value === value)?.label
  const filtered = options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const [triggerWidth, setTriggerWidth] = React.useState<number>()

  React.useEffect(() => {
    if (triggerRef.current) {
      setTriggerWidth(triggerRef.current.getBoundingClientRect().width)
    }
  }, [open])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between font-normal", className)}
          ref={triggerRef}
        >
          {value ? selectedLabel : <span className="text-muted-foreground">{placeholder}</span>}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "p-0 min-w-[320px] max-w-[640px] w-full shadow-lg border border-border",
          contentClassName,
        )}
        style={triggerWidth ? { width: triggerWidth } : undefined}
      >
        <Command>
          <div className="px-2 py-2">
            <Input
              placeholder={placeholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8"
            />
          </div>
          <CommandList className="max-h-56 overflow-auto">
            <CommandGroup>
              {filtered.length === 0 ? (
                <div className="px-3 py-2 text-sm text-muted-foreground">{emptyText}</div>
              ) : (
                filtered.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label} // Filtra por el label visible
                    onSelect={() => {
                      onChange(option.value === value ? "" : option.value)
                      setOpen(false)
                      setSearch("")
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
