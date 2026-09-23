import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

interface PlaygroundSearchContextValue {
  query: string;
  setQuery: (query: string) => void;
}

const PlaygroundSearchContext = createContext<PlaygroundSearchContextValue | null>(null);

export const PlaygroundSearchProvider = ({ children }: { children: ReactNode }) => {
  const [query, setQuery] = useState('');
  const value = useMemo(() => ({ query, setQuery }), [query]);
  return (
    <PlaygroundSearchContext.Provider value={value}>{children}</PlaygroundSearchContext.Provider>
  );
};

export const usePlaygroundSearch = () => {
  const ctx = useContext(PlaygroundSearchContext);
  if (!ctx) throw new Error('usePlaygroundSearch must be used within PlaygroundSearchProvider');
  return ctx;
};
