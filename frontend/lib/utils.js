/**
 * Utility Functions
 * General purpose utility functions.
 * @module lib/utils
 */

import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merges class names using clsx and tailwind-merge.
 * Useful for conditionally applying Tailwind CSS classes.
 * 
 * @function cn
 * @param {...(string|Object|Array)} inputs - Class names or conditional class objects
 * @returns {string} Merged class string
 */
export function cn(...inputs) {
    return twMerge(clsx(inputs))
}
