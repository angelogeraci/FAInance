import * as React from "react";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";

export interface ComboboxOption {
  value: string;
  label: string;
  color?: string;
}

interface ComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  onInputChange?: (value: string) => void;
  options: ComboboxOption[];
  placeholder?: string;
  renderOption?: (option: ComboboxOption) => React.ReactNode;
  allowCustomValue?: boolean;
  onCustomValue?: (value: string) => void;
}

export const Combobox: React.FC<ComboboxProps> = ({
  value,
  onValueChange,
  onInputChange,
  options,
  placeholder = "Select...",
  renderOption,
  allowCustomValue = false,
  onCustomValue,
}) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");

  React.useEffect(() => {
    if (onInputChange) onInputChange(input);
  }, [input]);

  const filtered = input
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(input.toLowerCase())
      )
    : options;

  const showAddOption =
    allowCustomValue && input && !options.some((opt) => opt.label.toLowerCase() === input.toLowerCase());

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-between"
          onClick={() => setOpen((o) => !o)}
        >
          {value
            ? options.find((opt) => opt.value === value)?.label || value
            : <span className="text-muted-foreground">{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-2 w-[300px]">
        <input
          className="w-full border rounded px-2 py-1 mb-2"
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoFocus
        />
        <div className="max-h-48 overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map((opt) => (
              <div
                key={opt.value}
                className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:bg-accent ${value === opt.value ? "bg-accent" : ""}`}
                onClick={() => {
                  onValueChange(opt.value);
                  setOpen(false);
                  setInput("");
                }}
              >
                {renderOption ? renderOption(opt) : (
                  <>
                    {opt.color && <span className="w-3 h-3 rounded-full" style={{ background: opt.color }} />}
                    <span>{opt.label}</span>
                  </>
                )}
              </div>
            ))
          ) : (
            <div className="text-muted-foreground px-2 py-1">Aucune catégorie</div>
          )}
          {showAddOption && (
            <div
              className="flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:bg-accent text-primary"
              onClick={() => {
                if (onCustomValue) onCustomValue(input);
                setOpen(false);
                setInput("");
              }}
            >
              <span>➕ Ajouter "{input}"</span>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}; 