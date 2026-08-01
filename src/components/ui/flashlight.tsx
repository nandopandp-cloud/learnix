"use client";

import { useCallback } from "react";
import { cn } from "@/lib/utils";

/**
 * Superfície com o "flashlight" dos assets: um gradiente radial que acompanha
 * o cursor. As coordenadas viram custom properties lidas pelo CSS.
 */
export function Flashlight({
  children,
  className,
  as: Tag = "div",
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
} & React.HTMLAttributes<HTMLElement>) {
  const handleMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  }, []);

  return (
    <Tag
      onMouseMove={handleMove}
      className={cn("flashlight relative overflow-hidden", className)}
      {...props}
    >
      {children}
    </Tag>
  );
}
