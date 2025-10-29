import { render, screen } from '@testing-library/react';

import HomePage from '../app/page';

describe('HomePage', () => {
  it('renders hero headline', () => {
    render(<HomePage />);
    expect(screen.getByText(/Shared expenses with/i)).toBeInTheDocument();
  });
});
