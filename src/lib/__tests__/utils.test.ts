import { describe, it, expect } from 'vitest';
import { cn } from '../utils';

describe('cn utility function', () => {
  it('merges class names correctly', () => {
    const result = cn('px-4', 'py-2');
    expect(result).toBe('px-4 py-2');
  });

  it('handles conditional classes', () => {
    const isActive = true;
    const result = cn('base-class', isActive && 'active-class');
    expect(result).toBe('base-class active-class');
  });

  it('handles false conditional classes', () => {
    const isActive = false;
    const result = cn('base-class', isActive && 'active-class');
    expect(result).toBe('base-class');
  });

  it('handles undefined and null values', () => {
    const result = cn('base', undefined, null, 'end');
    expect(result).toBe('base end');
  });

  it('merges tailwind classes correctly (tailwind-merge)', () => {
    const result = cn('px-4', 'px-6');
    expect(result).toBe('px-6');
  });

  it('handles arrays of classes', () => {
    const result = cn(['class-a', 'class-b'], 'class-c');
    expect(result).toBe('class-a class-b class-c');
  });

  it('handles object syntax', () => {
    const result = cn({
      'active': true,
      'disabled': false,
      'hover': true,
    });
    expect(result).toBe('active hover');
  });

  it('handles complex combinations', () => {
    const variant = 'primary';
    const size = 'lg';
    const result = cn(
      'btn',
      variant === 'primary' && 'btn-primary',
      size === 'lg' && 'text-lg',
      { 'rounded': true }
    );
    expect(result).toBe('btn btn-primary text-lg rounded');
  });

  it('handles empty inputs', () => {
    const result = cn();
    expect(result).toBe('');
  });
});
