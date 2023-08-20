export type Functionable = (...args: any) => any;

export type WithSync<T extends Functionable> = (
  args: Parameters<T>,
  fn: (context: ReturnType<T>) => void
) => void;

export type With<T extends Functionable> = (
  args: Parameters<T>,
  fn: (context: Awaited<ReturnType<T>>) => Promise<void>
) => Promise<void>;

export function withifySync<T extends Functionable>(
  onCreate: (args: Parameters<T>) => ReturnType<T>,
  onDestroy: (context: ReturnType<T>) => void
): WithSync<T> {
  return (args, fn) => {
    const context = onCreate(args);
    try {
      fn(context);
    } finally {
      onDestroy(context);
    }
  };
}

export function withify<T extends Functionable>(
  onCreate: (args: Parameters<T>) => ReturnType<T>,
  onDestroy: (context: Awaited<ReturnType<T>>) => Promise<void>
): With<T> {
  return async (args, fn) => {
    const context = await onCreate(args);
    try {
      await fn(context);
    } finally {
      await onDestroy(context);
    }
  };
}
