/**
 * Fridge ID utility: generates unique, user-friendly fridge IDs like "fridge-4234"
 * from user IDs. The format is deterministic so the same userId always produces
 * the same fridge ID.
 */

/**
 * Generate a fridge ID from a user ID using a deterministic hash.
 * Always produces the same result for the same input.
 */
export function generateFridgeId(userId: string): string {
  // Simple hash function that produces a number from the userId
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Use the absolute value and mod to get a 4-digit number
  const fridgeNumber = Math.abs(hash) % 10000;
  return `fridge-${String(fridgeNumber).padStart(4, "0")}`;
}

/**
 * Parse a fridge ID to extract the user ID.
 * This is a reverse operation but since the hash is not reversible,
 * we'll store the userId separately when needed.
 */
export function isFridgeId(id: string): boolean {
  return /^fridge-\d{4}$/.test(id);
}
