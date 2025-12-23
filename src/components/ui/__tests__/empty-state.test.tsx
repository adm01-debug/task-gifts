import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test/test-utils';
import { EmptyState, EmptyStateCard } from '../empty-state';
import { FileQuestion } from 'lucide-react';

describe('EmptyState Component', () => {
  it('renders with title', () => {
    render(<EmptyState title="No items found" />);
    expect(screen.getByText('No items found')).toBeInTheDocument();
  });

  it('renders with title and description', () => {
    render(
      <EmptyState 
        title="No data available" 
        description="Try adjusting your filters"
      />
    );
    
    expect(screen.getByText('No data available')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your filters')).toBeInTheDocument();
  });

  it('renders with custom icon', () => {
    render(
      <EmptyState 
        title="No files" 
        icon={FileQuestion}
      />
    );
    
    expect(screen.getByText('No files')).toBeInTheDocument();
  });

  it('renders with action button', () => {
    const handleAction = vi.fn();
    render(
      <EmptyState 
        title="No items" 
        action={{
          label: 'Add Item',
          onClick: handleAction,
        }}
      />
    );
    
    const button = screen.getByRole('button', { name: 'Add Item' });
    expect(button).toBeInTheDocument();
    
    fireEvent.click(button);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('renders in compact mode', () => {
    render(<EmptyState title="Empty" compact />);
    // Compact mode has smaller padding
    const container = screen.getByText('Empty').parentElement;
    expect(container).toHaveClass('py-6');
  });
});

describe('EmptyStateCard Component', () => {
  it('renders inside a card', () => {
    render(<EmptyStateCard title="No content" />);
    expect(screen.getByText('No content')).toBeInTheDocument();
  });

  it('applies custom card className', () => {
    const { container } = render(
      <EmptyStateCard title="Test" cardClassName="custom-class" />
    );
    
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });
});
