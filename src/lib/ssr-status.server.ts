import {
  setResponseStatus,
  setResponseHeader,
  getRequestHeader,
} from "@tanstack/react-start/server";

export function applyNotFoundStatus() {
  try {
    setResponseStatus(404);
    const accept = getRequestHeader("accept") ?? "";
    if (accept.includes("application/json") && !accept.includes("text/html")) {
      setResponseHeader("content-type", "application/json; charset=utf-8");
    } else {
      setResponseHeader("content-type", "text/html; charset=utf-8");
    }
    setResponseHeader("cache-control", "no-store");
  } catch {
    // Outside a server request context — ignore.
  }
}