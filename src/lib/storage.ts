import { createEffect, createSignal } from 'solid-js';
import { createStore } from 'solid-js/store';

/**
 * Options for `create*StorageSignal()` and `create*StorageStore()`.
 */
type CreateStorageOptions<T> = {
  serialize?: (value: T) => string;
  deserialize?: (value: string) => T;
};

/**
 * Default serializer.
 */
function defaultSerializer<T>(value: T): string {
  return JSON.stringify(value);
}

/**
 * Default deserializer.
 */
function defaultDeserializer(text: string) {
  return JSON.parse(text);
}

/**
 * Read initial value from a web storage.
 *
 * @param storage Object implementing the Web Storage API (e.g. `localStorage`).
 * @param key Key in the web storage.
 * @param defaultValue Default value.
 * @param deserialize Deserializer function.
 *
 * @returns Storage initial value.
 */
function getInitialValue<T>(
  storage: Storage,
  key: string,
  defaultValue: T,
  deserialize: (value: string) => T,
) {
  try {
    const value = storage.getItem(key);
    return value ? deserialize(value) : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Create a signal that synchronizes with a web storage.
 *
 * @param storage Object implementing the Web Storage API (e.g. `localStorage`).
 * @param key Key in the web storage.
 * @param defaultValue Default value.
 * @param options Overrides serializer and deserializer functions.
 *
 * @returns An accessor, a setter, and a remover for the value.
 */
function createStorageSignal<T>(
  storage: Storage,
  key: string,
  defaultValue?: T,
  options?: CreateStorageOptions<T>,
) {
  const serialize = options?.serialize ?? defaultSerializer;
  const deserialize = options?.deserialize ?? defaultDeserializer;

  const initialValue = getInitialValue(storage, key, defaultValue, deserialize);
  const [value, setValue] = createSignal(initialValue);

  createEffect(() => storage.setItem(key, serialize(value())));

  return [value, setValue, () => storage.removeItem(key)];
}

/**
 * Create a store that synchronizes with a web storage.
 *
 * @param storage Object implementing the Web Storage API (e.g. `localStorage`).
 * @param key Key in the web storage.
 * @param defaultValue Default value.
 * @param options Overrides serializer and deserializer functions.
 *
 * @returns An accessor, a setter, and a remover for the value.
 */
function createStorageStore<T>(
  storage: Storage,
  key: string,
  defaultValue?: T,
  options?: CreateStorageOptions<T>,
) {
  const serialize = options?.serialize ?? defaultSerializer;
  const deserialize = options?.deserialize ?? defaultDeserializer;

  const initialValue = getInitialValue(storage, key, defaultValue, deserialize);
  const [value, setValue] = createStore(initialValue);

  createEffect(() => storage.setItem(key, serialize(value)));

  return [value, setValue, () => storage.removeItem(key)];
}

/**
 * Create a signal that synchronizes with `localStorage`.
 *
 * @param key Key in `localStorage`.
 * @param defaultValue Default value.
 * @param options Overrides serializer and deserializer functions.
 *
 * @returns An accessor, a setter, and a remover for the value.
 */
export function createLocalStorageSignal<T>(
  key: string,
  defaultValue?: T,
  options?: CreateStorageOptions<T>,
) {
  return createStorageSignal(localStorage, key, defaultValue, options);
}

/**
 * Create a signal that synchronizes with `sessionStorage`.
 *
 * @param key Key in `sessionStorage`.
 * @param defaultValue Default value.
 * @param options Overrides serializer and deserializer functions.
 *
 * @returns An accessor, a setter, and a remover for the value.
 */
export function createSessionStorageSignal<T>(
  key: string,
  defaultValue?: T,
  options?: CreateStorageOptions<T>,
) {
  return createStorageSignal(sessionStorage, key, defaultValue, options);
}

/**
 * Create a store that synchronizes with `localStorage`.
 *
 * @param key Key in `localStorage`.
 * @param defaultValue Default value.
 * @param options Overrides serializer and deserializer functions.
 *
 * @returns An accessor, a setter, and a remover for the value.
 */
export function createLocalStorageStore<T extends object>(
  key: string,
  defaultValue?: T,
  options?: CreateStorageOptions<T>,
) {
  return createStorageStore(localStorage, key, defaultValue, options);
}

/**
 * Create a store that synchronizes with `sessionStorage`.
 *
 * @param key Key in `sessionStorage`.
 * @param defaultValue Default value.
 * @param options Overrides serializer and deserializer functions.
 *
 * @returns An accessor, a setter, and a remover for the value.
 */
export function createSessionStorageStore<T extends object>(
  key: string,
  defaultValue?: T,
  options?: CreateStorageOptions<T>,
) {
  return createStorageStore(sessionStorage, key, defaultValue, options);
}
