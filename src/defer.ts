export type PromiseOrValue<T> = Promise<T> | T;

export type OnDeferSync = () => void;
export type DeferSync = (onDeferSync: OnDeferSync) => void;

export type OnDefer = () => PromiseOrValue<void>;
export type Defer = (onDefer: OnDefer) => void;

export interface DefererOptions {
  /**
   * @description If true, the deferer will be a LIFO queue or a FIFO queue otherwise.
   * @default true
   */
  lifo?: boolean;

  /**
   * @description If true, the deferer will ignore errors on defer.
   * @default false
   */
  ignoreError?: boolean;
}

export class Deferer {
  readonly options: Required<DefererOptions>;

  constructor(options?: DefererOptions) {
    this.options = {
      lifo: true,
      ignoreError: false,
      ...options,
    };
  }

  executeSync<T>(fn: (defer: DeferSync) => T): T {
    const { lifo, ignoreError } = this.options;
    const queue: OnDeferSync[] = [];
    const defer: DeferSync = (onDeferSync: OnDeferSync) => {
      queue.push(onDeferSync);
    };

    try {
      const result = fn(defer);
      return result;
    } finally {
      const pop = lifo ? () => queue.pop()! : () => queue.shift()!;
      while (queue.length) {
        const onDeferSync = pop();
        try {
          onDeferSync();
        } catch (error) {
          if (!ignoreError) {
            throw error;
          }
        }
      }
    }
  }

  async execute<T>(fn: (defer: Defer) => PromiseOrValue<T>): Promise<T> {
    const { lifo, ignoreError } = this.options;
    const queue: OnDefer[] = [];
    const defer: Defer = (onDefer: OnDefer) => {
      queue.push(onDefer);
    };

    try {
      const result = await fn(defer);
      return result;
    } finally {
      const pop = this.options.lifo ? () => queue.pop()! : () => queue.shift()!;
      while (queue.length) {
        const onDefer = pop();
        try {
          await onDefer();
        } catch (error) {
          if (!ignoreError) {
            throw error;
          }
        }
      }
    }
  }
}

export function deferBlockSync<T>(
  fn: (defer: DeferSync) => T,
  options?: DefererOptions
): T {
  const deferer = new Deferer(options);
  return deferer.executeSync(fn);
}

export async function deferBlock<T>(
  fn: (defer: Defer) => PromiseOrValue<T>,
  options?: DefererOptions
): Promise<T> {
  const deferer = new Deferer(options);
  return await deferer.execute(fn);
}
