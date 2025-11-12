"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  label: ReactNode;
  value: ReactNode;
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
};

export const InfoRow = ({
  label,
  value,
  className,
  labelClassName,
  valueClassName,
}: Props) => {
  return (
    <div className={cn("grid grid-cols-3 items-center gap-2", className)}>
      <div className={cn("col-span-1 text-muted-foreground", labelClassName)}>
        {label}
      </div>
      <div className={cn("col-span-2", valueClassName)}>{value}</div>
    </div>
  );
};
