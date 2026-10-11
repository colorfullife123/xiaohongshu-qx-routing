# Changelog

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
