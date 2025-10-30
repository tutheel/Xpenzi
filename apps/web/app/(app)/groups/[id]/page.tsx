'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';

const tabs = ['Expenses', 'Balances', 'Members', 'Budgets', 'Approvals'] as const;

export default function GroupDetailPage() {
  const params = useParams<{ id: string }>();
  const groupName = params.id;
  const formattedGroupName = useMemo(
    () => groupName.charAt(0).toUpperCase() + groupName.slice(1),
    [groupName],
  );
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('Expenses');

  useEffect(() => {
    setActiveTab('Expenses');
  }, [groupName]);

  return (
    <section className="flex flex-col gap-6">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-wide text-primary">Group Shell</p>
        <h1 className="text-3xl font-semibold tracking-tight">{formattedGroupName}</h1>
        <p className="text-muted-foreground">
          Tabs preview the upcoming experiences for expenses, balances, members, budgets, and
          approvals.
        </p>
      </header>

      <nav className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              setActiveTab(tab);
            }}
            className={`rounded-full border px-4 py-2 text-sm transition ${
              activeTab === tab
                ? 'border-primary bg-primary text-primary-foreground shadow'
                : 'border-border bg-card hover:bg-card/80'
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>

      <div className="rounded-lg border border-dashed border-border bg-card/40 p-6 text-sm text-muted-foreground">
        <p>
          <strong>{activeTab}</strong> view placeholder. Offline shell and theming are ready; upcoming
          stages will hydrate these tabs with real data, automation, and AI insights.
        </p>
      </div>
    </section>
  );
}
