"use client";

import { useState } from "react";

export interface CopyButtonProps {
  text?: string | null;
  className?: string;
  initialLabel?: string;
  copiedLabel?: string;
  disabled?: boolean;
  onCopy?: (ok: boolean) => void;
}

export default function CopyButton({
  text,
  className = "",
  initialLabel = "Copy",
  copiedLabel = "Copied",
  disabled = false,
  onCopy,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const isDisabled = disabled || copied || !text;

  const handleClick = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onCopy?.(true);
    } catch (e) {
      onCopy?.(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isDisabled}
      className={className}
      aria-live="polite"
      aria-disabled={isDisabled}
    >
      {copied ? copiedLabel : initialLabel}
    </button>
  );
}
