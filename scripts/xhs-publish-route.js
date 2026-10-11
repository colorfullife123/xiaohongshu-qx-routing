/**
 * Xiaohongshu Quantumult X precise publish relay
 * v2.1.0 - 2026-10-11
 *
 * Intended for script-analyze-echo-response on:
 *   - https://edith.xiaohongshu.com/api/media/v1/upload/capa/permit
 *   - https://edith.xiaohongshu.com/api/sns/v2/note
 *
 * The original request is replayed once with $task.fetch({opts:{policy}}),
 * so only the matched publish-chain request uses the selected policy.
 * Other edith.xiaohongshu.com traffic remains DIRECT.
 */

const DEFAULT_POLICY = "📤 小红书上传";

function readVariables() {
  try {
    if (typeof $environment !== "undefined" && $environment.variables) {
      return $environment.variables;
    }
  } catch (_) {}

  const out = {};
  try {
    const source = ($environment && $environment.sourcePath) || "";
    const hashIndex = source.indexOf("#");
    if (hashIndex >= 0) {
      const hash = source.slice(hashIndex + 1);
      hash.split("&").forEach(part => {
        const i = part.indexOf("=");
        if (i > 0) {
          out[decodeURIComponent(part.slice(0, i))] = decodeURIComponent(part.slice(i + 1));
        }
      });
    }
  } catch (_) {}
  return out;
}

function cleanRequestHeaders(input) {
  const headers = Object.assign({}, input || {});
  const drop = ["content-length", "transfer-encoding", "connection", "host"];
  Object.keys(headers).forEach(k => {
    if (drop.includes(String(k).toLowerCase())) delete headers[k];
  });
  return headers;
}

function cleanResponseHeaders(input) {
  const headers = Object.assign({}, input || {});
  const drop = ["content-length", "transfer-encoding", "connection", "content-encoding"];
  Object.keys(headers).forEach(k => {
    if (drop.includes(String(k).toLowerCase())) delete headers[k];
  });
  return headers;
}

function statusLine(code) {
  const reasons = {
    200: "OK", 201: "Created", 202: "Accepted", 204: "No Content",
    400: "Bad Request", 401: "Unauthorized", 403: "Forbidden", 404: "Not Found",
    408: "Request Timeout", 409: "Conflict", 422: "Unprocessable Entity",
    429: "Too Many Requests", 500: "Internal Server Error", 502: "Bad Gateway",
    503: "Service Unavailable", 504: "Gateway Timeout"
  };
  return `HTTP/1.1 ${code} ${reasons[code] || ""}`.trim();
}

const vars = readVariables();
const policy = vars.policy || DEFAULT_POLICY;
const method = ($request.method || "POST").toUpperCase();
const url = $request.url;
const headers = cleanRequestHeaders($request.headers);

const req = {
  url,
  method,
  headers,
  opts: { policy }
};

if (typeof $request.body === "string" && $request.body.length > 0) {
  req.body = $request.body;
}

console.log(`[XHS-QX] precise relay ${method} ${url} via ${policy}`);

$task.fetch(req).then(response => {
  const code = Number(response.statusCode || 200);
  $done({
    status: statusLine(code),
    headers: cleanResponseHeaders(response.headers),
    body: response.body || ""
  });
}, reason => {
  const message = String(reason && (reason.error || reason.message || reason) || "unknown error");
  console.log(`[XHS-QX] relay failed: ${message}`);
  try { $notify("小红书精准发布失败", policy, message); } catch (_) {}
  $done({
    status: "HTTP/1.1 502 Bad Gateway",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ ok: false, error: "xhs_qx_relay_failed", detail: message })
  });
});
