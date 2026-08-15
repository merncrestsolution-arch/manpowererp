"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

const RadioGroupContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
}>({});

export function RadioGroup({
  defaultValue,
  value: valueProp,
  onValueChange,
  className,
  children,
  ...props
}: RadioGroupProps) {
  const [value, setValue] = React.useState(valueProp || defaultValue || "");

  const handleValueChange = (val: string) => {
    setValue(val);
    onValueChange?.(val);
  };

  return (
    <RadioGroupContext.Provider
      value={{
        value: valueProp !== undefined ? valueProp : value,
        onValueChange: handleValueChange,
      }}
    >
      <div className={cn("grid gap-2", className)} role="radiogroup" {...props}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}

export interface RadioGroupItemProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
}

export function RadioGroupItem({
  value,
  className,
  id,
  disabled,
  ...props
}: RadioGroupItemProps) {
  const context = React.useContext(RadioGroupContext);
  const checked = context.value === value;

  return (
    <input
      type="radio"
      id={id}
      value={value}
      checked={checked}
      disabled={disabled}
      onChange={() => context.onValueChange?.(value)}
      className={cn(
        "border-primary text-primary ring-offset-background focus-visible:ring-ring accent-primary aspect-square h-4 w-4 cursor-pointer rounded-full border focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
