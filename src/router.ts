import { useEffect, useState } from 'react';

export type Route =
  | 'landing'
  | 'scan'
  | 'amount'
  | 'methods'
  | 'results'
  | 'trust_report'
  | 'history'
  | 'profile';

// route <-> URL hash mapping (gives real back/forward + shareable URLs)
const ROUTE_TO_HASH: Record<Route, string> = {
  landing: '#/',
  scan: '#/scan',
  amount: '#/amount',
  methods: '#/methods',
  results: '#/results',
  trust_report: '#/trust-report',
  history: '#/history',
  profile: '#/profile',
};

const HASH_TO_ROUTE: Record<string, Route> = Object.entries(ROUTE_TO_HASH).reduce(
  (acc, [route, hash]) => {
    acc[hash] = route as Route;
    return acc;
  },
  {} as Record<string, Route>
);

export function routeFromHash(): Route {
  const h = (typeof window !== 'undefined' && window.location.hash) || '#/';
  return HASH_TO_ROUTE[h] || 'landing';
}

export function useHashRoute(): [Route, (r: Route) => void] {
  const [route, setRoute] = useState<Route>(routeFromHash());

  useEffect(() => {
    const onChange = () => setRoute(routeFromHash());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const navigate = (r: Route) => {
    const hash = ROUTE_TO_HASH[r] || '#/';
    if (window.location.hash !== hash) {
      window.location.hash = hash; // triggers hashchange -> setRoute
    } else {
      setRoute(r);
    }
  };

  return [route, navigate];
}
