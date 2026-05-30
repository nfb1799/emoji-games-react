import { useEffect } from 'react';
import useLocalStorage from './useLocalStorage';

const DEFAULT = '#2563eb';

// Storage key bumped (v2) so an existing accent saved against the old
// orange-on-cream theme doesn't override the new default.
export default function useAccent() {
  const [accent, setAccent] = useLocalStorage('eg:accent:v2', DEFAULT);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', accent);
  }, [accent]);

  return [accent, setAccent];
}

export { DEFAULT as DEFAULT_ACCENT };
