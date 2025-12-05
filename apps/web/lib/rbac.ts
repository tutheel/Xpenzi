import type { MemberRole } from '@prisma/client';

export function canManageMembers(role: MemberRole | null | undefined): boolean {
  return role === 'OWNER' || role === 'ADMIN';
}
