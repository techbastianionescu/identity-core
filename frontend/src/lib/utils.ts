import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function errorMessage(e: unknown): string {
  const detail = (e as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail
  if (typeof detail === "string") return detail
  if (Array.isArray(detail)) {
    return detail.map(formatDetailItem).join(", ")
  }
  return "Error inesperado"
}

function formatDetailItem(d: unknown): string {
  if (d && typeof d === "object") {
    const msg = (d as Record<string, unknown>).msg
    if (typeof msg === "string") return msg
  }
  return String(d)
}
