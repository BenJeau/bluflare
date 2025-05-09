declare global {
  interface Window {
    _env_?: ImportMetaEnv;
  }
}

const development = {
  rest_server_base_url:
    import.meta.env.VITE_REST_SERVER_BASE_URL ?? "http://localhost:3000/api/v1",
  admin_email: import.meta.env.VITE_ADMIN_EMAIL ?? "admin@localhost",
  commit_sha: "dev",
  version: "v0.0.0",
};

const production = {
  rest_server_base_url: window._env_?.VITE_REST_SERVER_BASE_URL ?? "/api/v1",
  admin_email: window._env_?.VITE_ADMIN_EMAIL ?? "",
  commit_sha: import.meta.env.VITE_COMMIT_SHA,
  version: import.meta.env.VITE_VERSION,
};

export default (() => (import.meta.env.PROD ? production : development))();

export function getKeyByValue<T, V extends keyof T>(
  object: T & Record<V, T[V]>,
  value: T[V]
): keyof T | undefined {
  return Object.keys(object).find((key) => object[key as V] === value) as
    | keyof T
    | undefined;
}
