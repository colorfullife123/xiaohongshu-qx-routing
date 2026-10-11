# Quantumult X import notes

## Why "No Data" appears

Do NOT enable the **Strategy / as-policy** switch on `resources/XHS-Upload.list`.
That file is a **filter resource**, not a server/node subscription. It contains only `host,...` rules and therefore has no nodes to expose as a custom policy.

Quantumult X supports `as-policy=static` on **server_remote / node subscription resources**. The correct UI flow is:

1. Duplicate your existing airport/node subscription resource.
2. Rename the duplicate to `📤 小红书上传`.
3. Enable its **Strategy** switch.
4. Keep the same resource parser settings as the original subscription.
5. Set its icon URL to:
   `https://raw.githubusercontent.com/colorfullife123/xiaohongshu-qx-routing/614a3182d41ffe15eb8b9d7485855e99cf1dca31/assets/xiaohongshu-policy.png`
6. Add `resources/XHS-Upload.list` separately as a FILTER resource.
7. Keep **Strategy OFF** on the filter resource and set its Policy Override to `📤 小红书上传`.
8. Add `resources/XHS-Direct.list` as a FILTER resource with Policy Override disabled.
9. Add `rewrite/XHS-Publish-Precise.snippet` as a REWRITE resource.

The precise publish relay already uses the same `📤 小红书上传` policy automatically.

Do NOT add `examples/QuantumultX-v2-branch-test.conf` as a remote resource. It is only a complete profile fragment for reference.
