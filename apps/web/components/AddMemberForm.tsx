"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/Toaster';

export function AddMemberForm({ groupId, onAdded }: { groupId: string; onAdded?: () => void }) {
  const [userEmail, setUserEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/groups/${groupId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: userEmail || undefined,
          displayName: displayName || undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to add member');
      }
      toast.success('Member added');
      setUserEmail('');
      setDisplayName('');
      onAdded?.();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Input
        placeholder="User email (optional)"
        value={userEmail}
        onChange={(e) => setUserEmail(e.target.value)}
        type="email"
        className="sm:max-w-sm"
      />
      <Input
        placeholder="Display name (optional)"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        className="sm:max-w-sm"
      />
      <Button type="submit" disabled={loading}>
        {loading ? 'Adding...' : 'Add member'}
      </Button>
    </form>
  );
}
