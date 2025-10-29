'use client';

import type { ReactNode } from 'react';

import { ClerkProvider } from '@clerk/nextjs';

interface AppProvidersProps {
  children: ReactNode;
}

const FALLBACK_KEY = 'pk_test_placeholder';
const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? FALLBACK_KEY;
const shouldMockClerk =
  !clerkPublishableKey ||
  clerkPublishableKey === FALLBACK_KEY ||
  clerkPublishableKey === 'pk_test_placeholder';

export function AppProviders({ children }: AppProvidersProps) {
  if (shouldMockClerk) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        'Clerk publishable key not configured. Rendering without ClerkProvider. Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY to enable auth.',
      );
    }

    return <>{children}</>;
  }

  return <ClerkProvider publishableKey={clerkPublishableKey}>{children}</ClerkProvider>;
}
