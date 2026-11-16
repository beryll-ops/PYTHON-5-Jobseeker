"use client";

import React, {
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

export interface AutoResizeTextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  minHeight?: number;
  maxHeight?: number;
}

/**
 * Reużywalne pole tekstowe (textarea) automatycznie powiększające się w pionie
 * wraz z wprowadzaniem lub wklejaniem treści przez użytkownika.
 * Po osiągnięciu `maxHeight` aktywuje wewnętrzny pasek przewijania.
 */
export const AutoResizeTextarea = forwardRef<
  HTMLTextAreaElement,
  AutoResizeTextareaProps
>(function AutoResizeTextarea(
  {
    className,
    minHeight = 84,
    maxHeight = 320,
    onChange,
    onInput,
    ...props
  },
  forwardedRef
) {
  const innerRef = useRef<HTMLTextAreaElement | null>(null);

  const adjustHeight = useCallback(() => {
    const el = innerRef.current;
    if (!el) return;

    // Resetujemy wysokość, by poprawnie obliczyć scrollHeight przy kasowaniu tekstu
    el.style.height = "auto";
    const nextHeight = Math.min(el.scrollHeight, maxHeight);
    el.style.height = `${Math.max(nextHeight, minHeight)}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [minHeight, maxHeight]);

  // Dopasowanie wysokości przy montowaniu oraz zmianie wartości zewnętrznej
  useEffect(() => {
    adjustHeight();
  }, [adjustHeight, props.value]);

  const handleChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    adjustHeight();
    onChange?.(e);
  };

  const handleInput: React.FormEventHandler<HTMLTextAreaElement> = (e) => {
    adjustHeight();
    onInput?.(e as any);
  };

  const setRefs = (node: HTMLTextAreaElement | null) => {
    innerRef.current = node;
    if (typeof forwardedRef === "function") {
      forwardedRef(node);
    } else if (forwardedRef) {
      (
        forwardedRef as React.MutableRefObject<HTMLTextAreaElement | null>
      ).current = node;
    }
  };

  return (
    <textarea
      ref={setRefs}
      onChange={handleChange}
      onInput={handleInput}
      className={cn(
        "w-full bg-zinc-900/90 border border-zinc-700/80 rounded-lg px-3.5 py-2.5 text-sm text-white",
        "placeholder:text-zinc-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40",
        "transition-colors shadow-inner resize-none font-sans",
        className
      )}
      style={{
        minHeight: `${minHeight}px`,
        maxHeight: `${maxHeight}px`,
        ...props.style,
      }}
      {...props}
    />
  );
});
