import { CheckIcon, ChevronsUpDownIcon, Loader2, X } from "lucide-react";
import * as React from "react";
import type { ComboboxOption } from "@/components/ui/combobox";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { cn } from "@/lib/utils";

interface MultiComboboxProps {
  values: string[];
  onChange: (values: string[]) => void;
  options: ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  /** When provided, client filtering is off and this drives a server `?search=`. */
  onSearchChange?: (search: string) => void;
  loading?: boolean;
  disabled?: boolean;
  /** id → label, for chips whose option isn't in the current search page. */
  selectedLabels?: Record<string, string>;
  className?: string;
  debounce?: number;
}

export function MultiCombobox({
  values,
  onChange,
  options,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  emptyText = "No results.",
  onSearchChange,
  loading = false,
  disabled = false,
  selectedLabels = {},
  className,
  debounce = 300,
}: MultiComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const debounced = useDebouncedValue(search, debounce);
  const serverSearch = !!onSearchChange;

  React.useEffect(() => {
    if (serverSearch) onSearchChange?.(debounced);
  }, [debounced, serverSearch, onSearchChange]);
  React.useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  const labelFor = (v: string) => options.find((o) => o.value === v)?.label ?? selectedLabels[v] ?? v;
  const toggle = (v: string) =>
    onChange(values.includes(v) ? values.filter((x) => x !== v) : [...values, v]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "border-input focus-visible:border-ring focus-visible:ring-ring/50 flex min-h-9 w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-1.5 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
        >
          <span className="flex flex-1 flex-wrap gap-1 text-left">
            {values.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              values.map((v) => (
                <span
                  key={v}
                  className="bg-brand-fixed-dim/25 text-brand-container inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                >
                  {labelFor(v)}
                  <X
                    className="size-3 cursor-pointer hover:opacity-70"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggle(v);
                    }}
                  />
                </span>
              ))
            )}
          </span>
          <ChevronsUpDownIcon className="size-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] min-w-56 p-0"
        align="start"
        portal={false}
      >
        <Command shouldFilter={!serverSearch}>
          <CommandInput value={search} onValueChange={setSearch} placeholder={searchPlaceholder} />
          <CommandList>
            {loading ? (
              <div className="text-muted-foreground flex items-center justify-center gap-2 py-6 text-sm">
                <Loader2 className="size-4 animate-spin" /> Searching…
              </div>
            ) : (
              <CommandEmpty>{emptyText}</CommandEmpty>
            )}
            {!loading &&
              options.map((o) => {
                const checked = values.includes(o.value);
                return (
                  <CommandItem key={o.value} value={o.label} onSelect={() => toggle(o.value)}>
                    <CheckIcon className={cn("size-4", checked ? "opacity-100" : "opacity-0")} />
                    <span className="line-clamp-1">{o.label}</span>
                  </CommandItem>
                );
              })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
