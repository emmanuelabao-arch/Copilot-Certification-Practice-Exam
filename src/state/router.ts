import { useEffect, useState } from 'react';

export type Route =
  | { name: 'home' }
  | { name: 'exam' }
  | { name: 'results'; id: string }
  | { name: 'review'; id: string }
  | { name: 'sources' };

export function parseHash(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const [head, id] = parts;
  if (head === 'exam') return { name: 'exam' };
  if (head === 'sources') return { name: 'sources' };
  if ((head === 'results' || head === 'review') && id) return { name: head, id: decodeURIComponent(id) };
  return { name: 'home' };
}

export function hrefFor(route: Route): string {
  switch (route.name) {
    case 'home':
      return '#/';
    case 'exam':
      return '#/exam';
    case 'sources':
      return '#/sources';
    case 'results':
    case 'review':
      return `#/${route.name}/${encodeURIComponent(route.id)}`;
  }
}

export function navigate(route: Route): void {
  window.location.hash = hrefFor(route);
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));
  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}
