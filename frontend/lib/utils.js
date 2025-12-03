import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function to merge Tailwind CSS classes.
 * Combines clsx for conditional classes and tailwind-merge to handle conflicts.
 * @param {...(string|undefined|null|false)} inputs - Class names or conditional class objects.
 * @returns {string} The merged class string.
 */
export function cn(...inputs) {
    return twMerge(clsx(inputs))
}
