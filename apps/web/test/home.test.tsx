import { render, screen } from '@testing-library/react';

import HomePage from '../app/(app)/page';

describe('HomePage', () => {
  it('renders hero headline', () => {
    render(<HomePage />);
    expect(screen.getByRole('heading', { level: 1, name: /welcome to zplit/i })).toBeInTheDocument();
  });
});
