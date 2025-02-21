import { useState, useEffect, useRef, RefObject } from "react";

/*
 * React hook to fetch data at specified intervals.
 * Manages internal state and cleans up on unmount.
 * Loading is true only during the first fetch.
 */

function useFetchInterval<T>(
  fetchFunction: () => Promise<T>,
  interval: number,
  isFetchingRef: RefObject<boolean>,
  setIsFetching: (fetching: boolean) => void,
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const initialFetchDone = useRef(false);
  const savedCallback = useRef(fetchFunction);

  // remember the latest fetch function
  useEffect(() => {
    savedCallback.current = fetchFunction;
  }, [fetchFunction]);

  // sets up the interval
  useEffect(() => {
    const fetchData = async () => {
      if (isFetchingRef.current) return; // skip if already fetching

      try {
        isFetchingRef.current = true;
        setIsFetching(true);

        if (!initialFetchDone.current) {
          setLoading(true);
        }

        const result = await savedCallback.current();
        setData(result);
        setError(null);
        initialFetchDone.current = true;
      } catch (error) {
        setError(
          error instanceof Error
            ? error
            : new Error("An unknown error occurred"),
        );
      } finally {
        isFetchingRef.current = false;
        setIsFetching(false);
        setLoading(false);
      }
    };

    // initial fetch
    if (!initialFetchDone.current) {
      fetchData();
    }

    const id = setInterval(fetchData, interval);
    return () => clearInterval(id);
  }, [interval, setIsFetching, isFetchingRef]);

  return { data, loading, error };
}

export default useFetchInterval;
