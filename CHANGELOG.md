# Changelog

## v2.4.3 - 2026-10-11

- Promote Rewrite-based Xiaohongshu publish/comment routing to the formal release.
- Confirm iOS comment publishing endpoint: `POST /api/sns/v4/note/comment`.
- Route note publishing, comment publishing and replies through `📤 小红书上传`.
- Keep comment list/read/browse traffic DIRECT.
- Add repository-hosted Xiaohongshu policy icon.
- Add stable `main` URLs for the Rewrite, script, policy and optional media-direct resource.

## v1.0.0 - 2026-09-12

- Initial release.
- Route Xiaohongshu upload/publish hosts through a proxy policy.
- Keep Xiaohongshu CDN/media traffic on DIRECT.
