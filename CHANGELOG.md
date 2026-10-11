# Changelog

## v2.4.0 - 2026-10-11

- Switch the recommended Quantumult X design back to Rewrite.
- Add `rewrite/XHS-Write-IP.snippet` matching all `edith.xiaohongshu.com` URLs.
- Use `script-analyze-echo-response`; body-bearing API requests are replayed through `📤 小红书上传`.
- Stop depending on private App paths for note publishing and comment publishing.
- Add `scripts/xhs-write-ip.js` as a generic policy relay.
- Strict Host routing remains available only as a fallback/diagnostic mode.


## v2.3.1 - 2026-10-11

- Fix Strict mode being shadowed by old host-level DIRECT rules.
- `resources/XHS-Direct.list` now contains only `host-suffix, xhscdn.com, direct`.
- Remove `edith.xiaohongshu.com`, `t2.xiaohongshu.com`, `apm-native.xiaohongshu.com`, `rec.xiaohongshu.com`, and `www.xiaohongshu.com` from the DIRECT resource.
- All `*.xiaohongshu.com` API traffic can now reliably match `XHS-Strict-IP.list` and use `📤 小红书上传`.


## v2.3.0 - 2026-10-11

- Add `resources/XHS-Strict-IP.list` for reliable Xiaohongshu App IP consistency.
- Strict mode routes all `*.xiaohongshu.com` API traffic through `📤 小红书上传`.
- Keep `*.xhscdn.com` media CDN on DIRECT.
- Recommend disabling precise rewrite while Strict mode is enabled to avoid duplicate relay.
- Keep the Path-based precise mode as an optional low-proxy-traffic mode.


## v2.2.0 - 2026-10-11

- Route Xiaohongshu **comment POST/reply/create** write actions through `📤 小红书上传`.
- Keep comment list/page/detail traffic DIRECT, so opening and scrolling comments does not consume the proxy.
- Add confirmed Web endpoint `/api/sns/web/v1/comment/post`.
- Add App-compatible write-only regexes for `vN/comment/(post|create|reply|send)` and `vN/note/comment/(post|create|reply|send)`.
- Reuse the same precise relay and selected upload/publish policy for note publishing and comment publishing.


## v2.1.1 - 2026-10-11

- Document the correct Quantumult X UI workflow for the visible upload policy.
- Clarify that `XHS-Upload.list` is a filter resource and must **not** be enabled as `as-policy`; doing so returns `No Data` because it contains no nodes.
- Recommend duplicating the user's existing server subscription and enabling its Strategy/as-policy switch as `📤 小红书上传`.
- Keep upload filters and precise publish rewrite bound to the same custom policy.


## v2.1.0 - 2026-10-11

- Rename the dedicated QX policy to `📤 小红书上传` so it is obvious in the Custom Policies UI.
- Bind both binary media upload and the precise final publish relay to the same visible policy.
- Switching this one policy changes the upload/publish egress without affecting comments or normal Xiaohongshu browsing.


## v2.0.0 - 2026-10-11

- Add Quantumult X precise publish routing for `edith.xiaohongshu.com`.
- Proxy only `ros-upload.xiaohongshu.com` at Host level.
- Keep ordinary `edith` comment/detail/API traffic on DIRECT.
- Add `script-analyze-echo-response` relay for upload-permit and final note-create paths.
- Use `$task.fetch(... opts.policy ...)` so only matched publish-chain requests use the selected QX policy.
- Add user-selectable `📤 小红书上传` policy example supporting individual nodes, `proxy`, and `direct`.
- Add `XHS-Proxy-Legacy.list` as a no-MitM fallback.
- Preserve existing FlClash/Mihomo implementation.

## v1.0.0 - 2026-09-12

- Initial release.
- Route Xiaohongshu upload/publish hosts through a proxy policy.
- Keep Xiaohongshu CDN/media traffic on DIRECT.
- Add Quantumult X remote filter example.
