"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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
}

export function Combobox({ options, value, onChange, placeholder = "Seleccionar...", emptyText = "No encontrado." }: Props) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const selectedLabel = options.find((option) => option.value === value)?.label
  const filtered = options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {value ? selectedLabel : <span className="text-muted-foreground">{placeholder}</span>}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <div className="px-2 py-2">
            <input
              className="w-full rounded-md border px-2 py-1 text-sm outline-none"
              placeholder={placeholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <CommandList>
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
