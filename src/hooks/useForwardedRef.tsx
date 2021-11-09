import React from 'react';

/**
 * Safely use a React reference forwarded to a call to React.forwardRef
 */
export default function useForwardedRef<T>(forwardRef: React.ForwardedRef<T>) {
  const ref = React.useRef<T | null>(null);
  React.useEffect(() => {
    if (!forwardRef) return;
    if (typeof forwardRef === 'function') {
      // forwarded ref is a callback
      forwardRef(ref.current);
    } else {
      ref.current = forwardRef.current;
    }
  });
  return ref;
}
