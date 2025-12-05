'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/Toaster';

export default function HomePage() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground">
        This is the starter shell for Xpenzi. Add expenses, budgets, and groups in upcoming stages.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input placeholder="Try typing here…" className="sm:max-w-sm" />
        <Button
          type="button"
          onClick={() => toast.success('Toast ready!')}
          className="w-full sm:w-auto"
        >
          Trigger toast
        </Button>
      </div>
    </div>
  );
}
