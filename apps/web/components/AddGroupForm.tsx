"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/Toaster';

export function AddGroupForm({ onCreated }: { onCreated?: () => void }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, currency }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to create group');
      }
      toast.success('Group created');
      setName('');
      setCurrency('USD');
      onCreated?.();
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Input
        placeholder="Group name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="sm:max-w-xs"
      />
      <Input
        placeholder="Currency (e.g., USD)"
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
        required
        className="sm:max-w-[120px]"
      />
      <Button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create group'}
      </Button>
    </form>
  );
}
