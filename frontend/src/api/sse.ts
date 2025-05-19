import { useEffect, useRef, useState } from "react";

type UseSSEParams = {
  url: string;
  active?: boolean;
  reconnectInterval?: number;
  maxDataEntries?: number;
};

export function useSSE<T extends { id: unknown }>({
  url,
  active = true,
  reconnectInterval = 1000,
  maxDataEntries = 100,
}: UseSSEParams) {
  const [isConnected, setIsConnected] = useState(false);
  const [data, setData] = useState<T[]>([]);
  const [error, setError] = useState<Event | null>(null);
  const [es, setEs] = useState<EventSource | null>(null);
  const [retryTimeout, setRetryTimeout] = useState<NodeJS.Timeout | null>(null);
  const triggeredOnce = useRef(false);

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
      const parsedData = JSON.parse(e.data) as T;
      // unsure if it should _only_ check the last added item
      if (data[0] && parsedData.id === data[0].id) {
        return;
      }
      setData((prev) => [parsedData, ...prev].slice(0, maxDataEntries));
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
    if (!triggeredOnce.current) {
      triggeredOnce.current = true;
      if (active) {
        connect();
        return close;
      }
    }
    if (!active) {
      triggeredOnce.current = false;
      close();
    }
  }, [active]);

  return { isConnected, data, error };
}
