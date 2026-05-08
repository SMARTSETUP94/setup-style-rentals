/**
 * Set the SSR HTTP response status from inside a React component render.
 * No-op on the client. Safely tolerates being called outside a request context.
 */
export function setSsrStatus(status: number, headers?: Record<string, string>) {
  if (typeof window !== "undefined") return;
  try {
    // Inline require keeps the Node-only module out of the client bundle.
    // TanStack's Vite plugin replaces this at build time on the server.
    const mod = (0, eval)("require")("@tanstack/react-start/server") as {
      setResponseStatus?: (s: number) => void;
      setResponseHeader?: (n: string, v: string) => void;
    };
    mod.setResponseStatus?.(status);
    if (headers) {
      for (const [k, v] of Object.entries(headers)) mod.setResponseHeader?.(k, v);
    }
  } catch {
    // outside a server request context — ignore
  }
}

/**
 * Read a request header during SSR. Returns undefined on client.
 */
export function getSsrRequestHeader(name: string): string | undefined {
  if (typeof window !== "undefined") return undefined;
  try {
    const mod = (0, eval)("require")("@tanstack/react-start/server") as {
      getRequestHeader?: (n: string) => string | undefined;
    };
    return mod.getRequestHeader?.(name);
  } catch {
    return undefined;
  }
}