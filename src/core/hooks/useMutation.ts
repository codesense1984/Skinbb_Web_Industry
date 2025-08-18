import type { AxiosError } from "axios";
import { useEffect, useRef, useState } from "react";

type ApiResponse<T> = {
  data: T | null;
  error: string | null;
};

type MutateOptions<T> = {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
};

type UseMutationOptions<T> = {
  retries?: number;
  retryDelay?: number;
  //   onSuccess?: (data: T) => void;
  //   onError?: (error: string) => void;
} & MutateOptions<T>;

type UseMutationResult<T, V> = {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  mutate: (variables: V, callbacks?: MutateOptions<T>) => Promise<T | null>;
  abort: () => void;
};

function useMutation<T, V = void>(
  mutationFn: (variables: V, signal?: AbortSignal) => Promise<ApiResponse<T>>,
  options: UseMutationOptions<T> = {},
): UseMutationResult<T, V> {
  const {
    retries = 0,
    retryDelay = 1000,
    onSuccess: globalOnSuccess,
    onError: globalOnError,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  const abort = () => {
    abortControllerRef.current?.abort();
  };

  const mutate = async (
    variables: V,
    callbacks?: MutateOptions<T>,
  ): Promise<T | null> => {
    abort();
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    let attempt = 0;
    setIsLoading(true);
    setError(null);

    const tryMutate = async (): Promise<T | null> => {
      try {
        const response = await mutationFn(variables, signal);

        if (signal.aborted) return null;

        if (response.error) {
          throw new Error(response.error);
        }

        if (isMountedRef.current) {
          setData(response.data);
          globalOnSuccess?.(response.data!);
          callbacks?.onSuccess?.(response.data!);
        }

        return response.data;
      } catch (err) {
        if (signal.aborted) return null;

        if (attempt < retries) {
          attempt++;
          await new Promise((res) => setTimeout(res, retryDelay));
          return tryMutate();
        } else {
          const msg = (err as AxiosError)?.message || "Unknown error";
          if (isMountedRef.current) {
            setError(msg);
            globalOnError?.(msg);
            callbacks?.onError?.(msg);
          }
          return null;
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    return tryMutate();
  };

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      abort();
    };
  }, []);

  return {
    data,
    error,
    isLoading,
    mutate,
    abort,
  };
}

export default useMutation;
