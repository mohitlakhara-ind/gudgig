import { render, screen } from '@testing-library/react';
import React from 'react';

function SampleComponent() {
  return <button>Click me</button>;
}

describe('SampleComponent', () => {
  it('renders a button', () => {
    render(<SampleComponent />);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });
});

