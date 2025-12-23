import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extracts the filename from a Firebase Storage URL
 * Example: https://firebasestorage.googleapis.com/v0/b/project.appspot.com/o/file.mp4?alt=media&token=xxx
 * Returns: file.mp4
 */
export function getFilenameFromUrl(url: string | null): string {
  try {
    if (!url || typeof url !== 'string') {
      return ''
    }
    // Extract the part between '/o/' and '?'
    const match = url.match(/\/o\/([^?]+)/)
    if (match && match[1]) {
      // Decode URI component to handle encoded characters
      return decodeURIComponent(match[1])
    }
    return url
  } catch (error) {
    console.error("Error extracting filename:", error)
    return url || ''
  }
}
