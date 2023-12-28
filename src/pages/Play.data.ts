import { type RouteLoadFunc } from '@solidjs/router';
import {
  type Challenge,
  fetchChallenge,
  fetchDailyChallenge,
  fetchRandomChallenge,
} from '../lib/game';

/**
 * Load a challenge given its ID.
 */
export const loadChallenge: RouteLoadFunc<Promise<Challenge>> = ({
  params,
}) => {
  return fetchChallenge(params.id);
};

/**
 * Load the daily challenge.
 */
export const loadDailyChallenge: RouteLoadFunc<Promise<Challenge>> = () => {
  return fetchDailyChallenge();
};

/**
 * Load a random challenge.
 */
export const loadRandomChallenge: RouteLoadFunc<Promise<Challenge>> = () => {
  return fetchRandomChallenge();
};
