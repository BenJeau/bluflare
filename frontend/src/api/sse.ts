import { useEffect, useState } from "react";

export function useSSE<T>(
  url: string,
  active = true,
  reconnectInterval = 1000
) {
  const [isConnected, setIsConnected] = useState(false);
  const [data, setData] = useState<T[]>([]);
  const [error, setError] = useState<Event | null>(null);
  const [es, setEs] = useState<EventSource | null>(null);
  const [retryTimeout, setRetryTimeout] = useState<NodeJS.Timeout | null>(null);

  const close = () => {
    if (es) {
      es.close();
    }
    if (retryTimeout) {
      clearTimeout(retryTimeout);
    }
    setIsConnected(false);
  };

  const connect = () => {
    const es = new EventSource(url);
    setEs(es);

    es.addEventListener("open", () => {
      setIsConnected(true);
      setError(null);
    });

    es.addEventListener("post", (e) => {
      setData((prev) => [JSON.parse(e.data), ...prev]);
    });

    es.addEventListener("error", (err) => {
      setError(err);
      setIsConnected(false);
      es.close();

      setRetryTimeout(
        setTimeout(() => {
          connect();
        }, reconnectInterval)
      );
    });
  };

  useEffect(() => {
    if (active) {
      connect();
      return close;
    } else {
      close();
    }
  }, [url, active]);

  return { isConnected, data, error };
}
