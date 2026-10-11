/**
 * Xiaohongshu Quantumult X rewrite-only IP relay
 * v2.4.0 - 2026-10-11
 *
 * Designed for script-analyze-echo-response on edith.xiaohongshu.com.
 * Quantumult X does not execute body-related rewrites when the request body
 * is empty, so normal body-less GET traffic is not relayed by this script.
 *
 * Every matched body-bearing API request is replayed once through the
 * user-selected policy. This avoids depending on unstable private App paths
 * for note publishing and comment publishing.
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
      source.slice(hashIndex + 1).split("&").forEach(part => {
        const i = part.indexOf("=");
        if (i > 0) {
          out[decodeURIComponent(part.slice(0, i))] =
            decodeURIComponent(part.slice(i + 1));
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
    200:"OK", 201:"Created", 202:"Accepted", 204:"No Content",
    400:"Bad Request", 401:"Unauthorized", 403:"Forbidden", 404:"Not Found",
    408:"Request Timeout", 409:"Conflict", 422:"Unprocessable Entity",
    429:"Too Many Requests", 500:"Internal Server Error", 502:"Bad Gateway",
    503:"Service Unavailable", 504:"Gateway Timeout"
  };
  return `HTTP/1.1 ${code} ${reasons[code] || ""}`.trim();
}

const vars = readVariables();
const policy = vars.policy || DEFAULT_POLICY;

const req = {
  url: $request.url,
  method: ($request.method || "POST").toUpperCase(),
  headers: cleanRequestHeaders($request.headers),
  opts: { policy }
};

if (typeof $request.body === "string") {
  req.body = $request.body;
}

console.log(`[XHS-QX v2.4] relay ${req.method} ${req.url} via ${policy}`);

$task.fetch(req).then(response => {
  const code = Number(response.statusCode || 200);
  $done({
    status: statusLine(code),
    headers: cleanResponseHeaders(response.headers),
    body: response.body || ""
  });
}, reason => {
  const message = String(
    reason && (reason.error || reason.message || reason) || "unknown error"
  );
  console.log(`[XHS-QX v2.4] relay failed: ${message}`);
  try {
    $notify("小红书发布 IP 分流失败", policy, message);
  } catch (_) {}

  $done({
    status: "HTTP/1.1 502 Bad Gateway",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      ok: false,
      error: "xhs_qx_rewrite_ip_relay_failed",
      detail: message
    })
  });
});
