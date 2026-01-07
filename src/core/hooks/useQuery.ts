// import { useCallback, useEffect, useRef, useState } from "react";

// type UseQueryOptions = {
//   enabled?: boolean;
//   retries?: number;
//   retryDelay?: number; // ms
// };

// type UseQueryResult<T> = {
//   data: T | null;
//   error: string | null;
//   isLoading: boolean;
//   refetch: () => Promise<T | null>;
//   abort: () => void;
// };

// function useQuery<T>(
//   queryFn: (signal?: AbortSignal) => Promise<ApiResponse<T>>,
//   options: UseQueryOptions = {},
// ): UseQueryResult<T> {
//   const { enabled = true, retries = 0, retryDelay = 1000 } = options;

//   const [data, setData] = useState<T | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(enabled);

//   const abortControllerRef = useRef<AbortController | null>(null);
//   const isMountedRef = useRef(true);
//   const hasFetchedOnceRef = useRef(false);
//   const queryFnRef = useRef(queryFn);

//   queryFnRef.current = queryFn;

//   const abort = () => {
//     abortControllerRef.current?.abort();
//   };

//   const fetchData = useCallback(async (): Promise<T | null> => {
//     abort();
//     abortControllerRef.current = new AbortController();
//     const signal = abortControllerRef.current.signal;

//     let attempt = 0;
//     setIsLoading(true);
//     setError(null);

//     const tryFetch = async (): Promise<T | null> => {
//       try {
//         const response = await queryFnRef.current(signal);

//         if (signal.aborted) return null;

//         if (response.error) {
//           throw new Error(response.error);
//         }

//         if (isMountedRef.current) {
//           setData(response.data);
//           hasFetchedOnceRef.current = true;
//         }

//         return response.data;
//       } catch (err: unknown) {
//         if (signal.aborted) return null;

//         if (attempt < retries) {
//           attempt++;
//           await new Promise((res) => setTimeout(res, retryDelay));
//           return tryFetch();
//         } else {
//           if (isMountedRef.current) {
//             setError((err as { message: string })?.message || "Unknown error");
//             hasFetchedOnceRef.current = true;
//           }
//           return null;
//         }
//       } finally {
//         if (isMountedRef.current) {
//           setIsLoading(false);
//         }
//       }
//     };

//     return tryFetch();
//   }, [retries, retryDelay]);

//   useEffect(() => {
//     isMountedRef.current = true;

//     if (enabled && !hasFetchedOnceRef.current) {
//       fetchData();
//     }

//     return () => {
//       isMountedRef.current = false;
//       abort();
//     };
//   }, [enabled, fetchData]);

//   return {
//     data,
//     error,
//     isLoading,
//     refetch: fetchData,
//     abort,
//   };
// }

// export default useQuery;
