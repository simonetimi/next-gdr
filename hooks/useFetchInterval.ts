import { useState, useEffect, useRef } from "react";

/*
 * React hook to fetch every n milliseconds
 * It saves the state internally and cancels on dismount
 * Loading is true only during the first fetch
 */

function useFetchInterval<T>(
  fetchFunction: () => Promise<T>,
  interval: number,
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
      try {
        if (!initialFetchDone.current) {
          setLoading(true);
        }
        const result = await savedCallback.current();
        setData(result);
        setError(null);
        initialFetchDone.current = true;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred"),
        );
      } finally {
        setLoading(false);
      }
    };

    // initial fetch
    if (!initialFetchDone.current) {
      fetchData();
    }

    const id = setInterval(fetchData, interval);
    return () => clearInterval(id);
  }, [interval]);

  return { data, loading, error };
}

export default useFetchInterval;
