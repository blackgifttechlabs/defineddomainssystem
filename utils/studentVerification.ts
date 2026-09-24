import type { Student } from '../types';

export function parseStudentLookup(value: string): string {
  const input = value.trim();
  try {
    const url = new URL(input);
    return (url.searchParams.get('id-card') || input).trim();
  } catch {
    return input.replace(/^#\s*/, '');
  }
}

export function findVerificationStudent(students: Student[], value: string): Student | null {
  const lookup = parseStudentLookup(value);
  if (!lookup) return null;
  // Document IDs are case-sensitive and take precedence over printed IDs and names.
  const exact = students.find(student => student.firebaseUid === lookup);
  if (exact) return exact;
  const normalized = lookup.toLowerCase();
  const matches = students.filter(student =>
    student.id?.toLowerCase() === normalized || student.fullName?.toLowerCase() === normalized
  );
  // An old printed ID shared by multiple students cannot identify one safely.
  return matches.length === 1 ? matches[0] : null;
}
