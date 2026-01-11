/**
 * Extracts the username from an email address and capitalizes it
 * Example: sara.ahmad@gmail.com -> Sara
 * Example: john_doe@email.com -> John
 */
export function extractNameFromEmail(email: string): string {
  if (!email || !email.includes('@')) {
    return 'Student';
  }

  // Get the part before the @ symbol
  const username = email.split('@')[0];

  // Split by dots, underscores, or hyphens to get the first name
  const nameParts = username.split(/[._-]/);
  const firstName = nameParts[0] || 'Student';

  // Capitalize the first letter and make the rest lowercase
  return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
}
