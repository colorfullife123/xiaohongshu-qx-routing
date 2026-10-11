# Quantumult X UI setup — 📤 小红书上传

## Do this

### A. Create the visible custom policy from your NODE subscription

Duplicate your existing airport/server subscription resource and configure the duplicate:

- Tag / Name: `📤 小红书上传`
- Strategy: **ON**
- Resource Parser: same as your original node subscription
- Icon URL: `https://raw.githubusercontent.com/colorfullife123/xiaohongshu-qx-routing/614a3182d41ffe15eb8b9d7485855e99cf1dca31/assets/xiaohongshu-policy.png`

This creates a visible static custom policy containing the subscription nodes.

### B. Add the upload FILTER resource

URL:

`https://raw.githubusercontent.com/colorfullife123/xiaohongshu-qx-routing/qx-precise-routing-v2/resources/XHS-Upload.list`

Settings:

- Strategy: **OFF**
- Policy Override: `📤 小红书上传`
- Resource Parser: OFF

### C. Add the DIRECT FILTER resource

URL:

`https://raw.githubusercontent.com/colorfullife123/xiaohongshu-qx-routing/qx-precise-routing-v2/resources/XHS-Direct.list`

Settings:

- Strategy: **OFF**
- Policy Override: OFF
- Resource Parser: OFF

### D. Add precise publish rewrite

URL:

`https://raw.githubusercontent.com/colorfullife123/xiaohongshu-qx-routing/qx-precise-routing-v2/rewrite/XHS-Publish-Precise.snippet`

Requires trusted Quantumult X MitM for `edith.xiaohongshu.com`.

## Do NOT do this

Do not turn on Strategy for `XHS-Upload.list`. It is a filter list, not a node list, so Quantumult X will show **No Data**.
