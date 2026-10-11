# Changelog

## v2.0.0 - 2026-10-11

- Add Quantumult X precise publish routing for `edith.xiaohongshu.com`.
- Proxy only `ros-upload.xiaohongshu.com` at Host level.
- Keep ordinary `edith` comment/detail/API traffic on DIRECT.
- Add `script-analyze-echo-response` relay for upload-permit and final note-create paths.
- Use `$task.fetch(... opts.policy ...)` so only matched publish-chain requests use the selected QX policy.
- Add user-selectable `🎯 小红书发布出口` policy example supporting individual nodes, `proxy`, and `direct`.
- Add `XHS-Proxy-Legacy.list` as a no-MitM fallback.
- Preserve existing FlClash/Mihomo implementation.

## v1.0.0 - 2026-09-12

- Initial release.
- Route Xiaohongshu upload/publish hosts through a proxy policy.
- Keep Xiaohongshu CDN/media traffic on DIRECT.
- Add Quantumult X remote filter example.
