import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { LoadingState, LoadingStateCard, SkeletonList, SkeletonGrid, SkeletonStats } from '../loading-state';

describe('LoadingState Component', () => {
  it('renders with default message', () => {
    render(<LoadingState />);
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    render(<LoadingState message="Loading data..." />);
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('renders in compact mode', () => {
    render(<LoadingState compact />);
    const container = screen.getByText('Carregando...').parentElement;
    expect(container).toHaveClass('py-4');
  });
});

describe('LoadingStateCard Component', () => {
  it('renders inside a card', () => {
    render(<LoadingStateCard message="Loading..." />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});

describe('SkeletonList Component', () => {
  it('renders default number of skeleton items', () => {
    const { container } = render(<SkeletonList />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBe(5);
  });

  it('renders custom number of skeleton items', () => {
    const { container } = render(<SkeletonList count={3} />);
    const items = container.querySelectorAll('.rounded-lg');
    expect(items.length).toBe(3);
  });
});

describe('SkeletonGrid Component', () => {
  it('renders default number of skeleton cards', () => {
    const { container } = render(<SkeletonGrid />);
    const cards = container.querySelectorAll('.rounded-lg');
    expect(cards.length).toBe(6);
  });

  it('renders custom number of skeleton cards', () => {
    const { container } = render(<SkeletonGrid count={4} />);
    const cards = container.querySelectorAll('.rounded-lg');
    expect(cards.length).toBe(4);
  });
});

describe('SkeletonStats Component', () => {
  it('renders default number of stat skeletons', () => {
    const { container } = render(<SkeletonStats />);
    const stats = container.querySelectorAll('.rounded-lg');
    expect(stats.length).toBe(4);
  });
});
