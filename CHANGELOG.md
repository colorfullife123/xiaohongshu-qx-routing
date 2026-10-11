# Changelog

## v2.4.4 - 2026-10-11

- Replace dynamic node collection in `📤 小红书上传` with a fixed, user-requested policy list.
- Candidate order: `自动选择`, `全球加速`, `direct`, `香港节点`, `台湾节点`, `日本节点`, `狮城节点`, `美国节点`, `proxy`.
- Keep the repository-hosted Xiaohongshu icon.
- Rewrite routing behavior remains unchanged from v2.4.3.


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
