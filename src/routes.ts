import { lazy } from 'solid-js';
import {
  loadChallenge,
  loadDailyChallenge,
  loadRandomChallenge,
} from './pages/Play.data';

export default [
  {
    path: '/',
    component: lazy(() => import('./pages/Home')),
  },
  {
    path: '/play/daily',
    component: lazy(() => import('./pages/Play')),
    load: loadDailyChallenge,
  },
  {
    path: '/play/random',
    component: lazy(() => import('./pages/Play')),
    load: loadRandomChallenge,
  },
  {
    path: '/play/:id',
    component: lazy(() => import('./pages/Play')),
    load: loadChallenge,
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
