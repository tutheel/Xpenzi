export function canManageMembers(role: string | null | undefined): boolean {
  return role === 'OWNER' || role === 'ADMIN';
}
