import { type Resource, createResource } from 'solid-js';
import { type RouteDataFunc } from '@solidjs/router';
import {
  type Challenge,
  fetchChallenge,
  fetchDailyChallenge,
  fetchRandomChallenge,
} from '../lib/game';

/**
 * Load a challenge given its ID.
 */
export const PlayData: RouteDataFunc<unknown, Resource<Challenge>> = ({
  params,
}) => {
  const [challenge] = createResource(() => params.id, fetchChallenge);
  return challenge;
};

/**
 * Load the daily challenge.
 */
export const PlayDailyData: RouteDataFunc<
  unknown,
  Resource<Challenge>
> = () => {
  const [challenge] = createResource(fetchDailyChallenge);
  return challenge;
};

/**
 * Load a random challenge.
 */
export const PlayRandomData: RouteDataFunc<
  unknown,
  Resource<Challenge>
> = () => {
  const [challenge] = createResource(fetchRandomChallenge);
  return challenge;
};
