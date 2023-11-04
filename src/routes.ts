import { lazy } from 'solid-js';
import { PlayDailyData, PlayData, PlayRandomData } from './pages/Play.data';

export default [
  {
    path: '/',
    component: lazy(() => import('./pages/Home')),
  },
  {
    path: '/play/daily',
    component: lazy(() => import('./pages/Play')),
    data: PlayDailyData,
  },
  {
    path: '/play/random',
    component: lazy(() => import('./pages/Play')),
    data: PlayRandomData,
  },
  {
    path: '/play/:id',
    component: lazy(() => import('./pages/Play')),
    data: PlayData,
  },
  {
    path: '/settings',
    component: lazy(() => import('./pages/Settings')),
  },
  {
    path: '/help',
    component: lazy(() => import('./pages/Help')),
  },
];
