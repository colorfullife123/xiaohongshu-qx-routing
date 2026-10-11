/**
 * Xiaohongshu Quantumult X smart write-action IP relay
 * v2.4.1 - 2026-10-11
 *
 * Rewrite still observes body-bearing edith.xiaohongshu.com requests, but
 * only write actions are sent through the selected Xiaohongshu policy.
 * Read/list/page/query/detail traffic is replayed DIRECT.
 */

const DEFAULT_POLICY = "📤 小红书上传";
const DIRECT_POLICY = "direct";

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

function requestPath() {
  if ($request.path) return String($request.path).split("?")[0];
  const url = String($request.url || "");
  return url.replace(/^https?:\/\/[^/]+/i, "").split("?")[0] || "/";
}

function classifyRequest(method, path, body) {
  const p = String(path || "").toLowerCase();
  const b = String(body || "").toLowerCase();

  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return { type: "read", reason: "safe-method" };
  }

  // Explicit write actions.
  if (/\/api\/media\/v\d+\/upload\/capa\/permit(?:\/|$)/.test(p)) {
    return { type: "write", reason: "upload-permit" };
  }

  // Known final note submission path and common version variants.
  if (/\/api\/sns\/v\d+\/note(?:\/)?$/.test(p)) {
    return { type: "write", reason: "note-submit" };
  }

  if (/\/(?:comment|note\/comment)\/(?:post|create|reply|send|submit)(?:\/|$)/.test(p)) {
    return { type: "write", reason: "comment-write-path" };
  }

  if (/\/(?:publish|post|create|reply|send|submit)(?:\/|$)/.test(p)) {
    return { type: "write", reason: "write-verb-path" };
  }

  // Comment-write body fallback for App versions whose path name changed.
  const hasCommentText =
    /"(?:content|comment_content|text)"\s*:/.test(b);
  const hasCommentTarget =
    /"(?:note_id|target_comment_id|comment_id|root_comment_id)"\s*:/.test(b);

  if (/comment/.test(p) && hasCommentText && hasCommentTarget) {
    return { type: "write", reason: "comment-write-body" };
  }

  // Explicit read/browse actions, even when implemented as POST.
  if (
    /\/(?:page|list|query|detail|feed|search|recommend|messages?|history|status|count|unread|collect|batch|get|info)(?:\/|$)/.test(p) ||
    /\/comment\/(?:page|list|query|detail|sub_comments?)(?:\/|$)/.test(p) ||
    /\/api\/im\//.test(p)
  ) {
    return { type: "read", reason: "read-path" };
  }

  // Unknown body-bearing calls default DIRECT so simply opening/browsing
  // Xiaohongshu does not consume the selected upload/publish proxy.
  return { type: "read", reason: "unknown-default-direct" };
}

const vars = readVariables();
const selectedPolicy = vars.policy || DEFAULT_POLICY;
const method = ($request.method || "POST").toUpperCase();
const path = requestPath();
const body = typeof $request.body === "string" ? $request.body : "";
const classification = classifyRequest(method, path, body);
const routePolicy = classification.type === "write"
  ? selectedPolicy
  : DIRECT_POLICY;

const req = {
  url: $request.url,
  method,
  headers: cleanRequestHeaders($request.headers),
  opts: { policy: routePolicy }
};

if (typeof $request.body === "string") {
  req.body = $request.body;
}

console.log(
  `[XHS-QX v2.4.1] ${classification.type.toUpperCase()} ${method} ${path} ` +
  `reason=${classification.reason} via ${routePolicy}`
);

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
  console.log(`[XHS-QX v2.4.1] relay failed: ${message}`);
  try {
    $notify("小红书 IP 分流失败", routePolicy, message);
  } catch (_) {}

  $done({
    status: "HTTP/1.1 502 Bad Gateway",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      ok: false,
      error: "xhs_qx_smart_relay_failed",
      detail: message
    })
  });
});
