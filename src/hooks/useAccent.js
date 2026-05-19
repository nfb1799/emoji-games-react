import { useEffect } from 'react';
import useLocalStorage from './useLocalStorage';

const DEFAULT = '#ff6b3d';

export default function useAccent() {
  const [accent, setAccent] = useLocalStorage('eg:accent', DEFAULT);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', accent);
  }, [accent]);

  return [accent, setAccent];
}

export { DEFAULT as DEFAULT_ACCENT };
