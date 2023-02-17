import ElectronStore from 'electron-store';
import { ElectronBlocker } from '@cliqz/adblocker-electron';

const createPlainObject = <T = Record<string, unknown>>(): T => Object.create(null);

const checkValueType = (key: string, value: unknown): void => {
  const nonJsonTypes = new Set([
    'undefined',
    'symbol',
    'function',
  ]);

  const type = typeof value;

  if (nonJsonTypes.has(type)) {
    throw new TypeError(`Setting a value of type \`${type}\` for key \`${key}\` is not allowed as it's not supported by JSON`);
  }
};

abstract class BaseStore<T extends Record<string, unknown>> {
  abstract get<Key extends keyof T>(key: Key): T[Key];

  abstract set<Key extends keyof T>(key: Key, value?: T[Key]): void;

  abstract has<Key extends keyof T>(key: Key | string): boolean;

  abstract reset<Key extends keyof T>(...keys: Key[]): void;

  abstract delete<Key extends keyof T>(key: Key): void;

  abstract clear(): void;
}

class MemoryStore<T extends Record<string, unknown>> extends BaseStore<T> {
  private store: T;

  constructor() {
    super();

    this.store = createPlainObject();
  }
  
  get<Key extends keyof T>(key: Key): T[Key] {
    const { store } = this;

    return key in store ? store[key] : undefined;
  }

  set<Key extends keyof T>(key: Key, value?: T[Key]): void {
    const { store } = this;

    const set = (key: string, value?: T[Key] | T | unknown): void => {
      checkValueType(key, value);

      
      store[key as Key] = value as T[Key];
    };

    if (typeof key === 'object') {
      const object = key;

      for (const [key, value] of Object.entries(object)) {
        set(key, value);
      }
    } else {
      set(key as string, value);
    }

    this.store = store;
  }

  has<Key extends keyof T>(key: string | Key): boolean {
    return (key as string) in this.store;
  }

  delete<Key extends keyof T>(key: Key): void {
    const { store } = this;

    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete store[key];
    
    this.store = store;
  }
  
  reset<Key extends keyof T>(...keys: Key[]): void {
    for (const key of keys) {
      this.delete(key);
    }
  }

  clear(): void {
    this.reset(...Object.keys(this.store));
  }
}

class FileStore<T extends Record<string, unknown>> extends BaseStore<T> {
  private readonly store: ElectronStore<T>;

  constructor (sourceStore: ElectronStore<T>) {
    super();

    this.store = sourceStore;
  }

  get<Key extends keyof T>(key: Key): T[Key] {
    return this.store.get(key);
  }

  set<Key extends keyof T>(key: Key, value?: T[Key]): void {
    this.store.set(key, value);
  }

  has<Key extends keyof T>(key: string | Key): boolean {
    return this.store.has(key);
  }

  delete<Key extends keyof T>(key: Key): void {
    this.store.delete(key);
  }

  reset<Key extends keyof T>(...keys: Key[]): void {
    this.store.reset(...keys);
  }

  clear(): void {
    this.store.clear();
  }
}

export type Store = {
  public: BaseStore<PublicSchema>;
  private: BaseStore<PrivateSchema>;
}

export type PublicSchema = {
  url: string;
  disableAds: boolean;
}

export type PrivateSchema = {
  blocker?: ElectronBlocker;
}

export const defaultPublicValues: PublicSchema = {
  url: 'https://play.newcp.net/',
  disableAds: false,
};

const createPublicStore = () => {
  const publicStore = new ElectronStore<PublicSchema>({
    name: 'preferences',
    defaults: defaultPublicValues,  
  });

  return new FileStore<PublicSchema>(publicStore);
};

const createPrivateStore = () => {
  const privateStore = new MemoryStore<PrivateSchema>();

  return privateStore;
};

const createStore = (): Store => {
  return {
    public: createPublicStore(),
    private: createPrivateStore(),
  };
};

export default createStore;