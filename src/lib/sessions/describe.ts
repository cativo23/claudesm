import { truncate } from '../render.js';

export function formatDescription(description: string, maxLen = 50): string {
  if (!description) return '(no description)';
  return truncate(description.replace(/\s+/g, ' '), maxLen);
}
