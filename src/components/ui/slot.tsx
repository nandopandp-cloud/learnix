import { Children, cloneElement, isValidElement } from "react";
import { cn } from "@/lib/utils";

/**
 * Slot mínimo (mesma ideia do Radix): funde as props no único filho React,
 * permitindo `asChild` sem trazer a dependência inteira.
 * As classes do pai vêm primeiro para que as do filho possam sobrescrevê-las.
 */
export function Slot({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }) {
  const child = Children.only(children);

  if (!isValidElement<Record<string, unknown>>(child)) return null;

  const childProps = child.props as Record<string, unknown> & {
    className?: string;
  };

  const merged: Record<string, unknown> = { ...props, ...childProps };

  // Handlers presentes nos dois lados são encadeados: pai primeiro, filho depois.
  for (const key of Object.keys(props)) {
    if (!/^on[A-Z]/.test(key)) continue;

    const parentHandler = (props as Record<string, unknown>)[key];
    const childHandler = childProps[key];

    if (typeof parentHandler === "function" && typeof childHandler === "function") {
      merged[key] = (...args: unknown[]) => {
        (parentHandler as (...a: unknown[]) => void)(...args);
        (childHandler as (...a: unknown[]) => void)(...args);
      };
    } else if (typeof parentHandler === "function" && childHandler == null) {
      merged[key] = parentHandler;
    }
  }

  merged.className = cn(className, childProps.className);

  return cloneElement(child, merged);
}
