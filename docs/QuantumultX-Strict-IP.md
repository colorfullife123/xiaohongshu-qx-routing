# Quantumult X Strict IP mode — v2.3.0

Use this mode when a newly posted Xiaohongshu comment still shows the local IP region even after the precise rewrite is enabled.

## 1. Keep your visible policy

`📤 小红书上传` should point to the desired proxy node.

## 2. Add Strict filter resource

`https://raw.githubusercontent.com/colorfullife123/xiaohongshu-qx-routing/qx-precise-routing-v2/resources/XHS-Strict-IP.list`

Settings:

- Strategy: OFF
- Policy Override: `📤 小红书上传`
- Resource Parser: OFF
- Put this resource before `XHS-Direct.list`

## 3. Keep media DIRECT

Keep:

`https://raw.githubusercontent.com/colorfullife123/xiaohongshu-qx-routing/qx-precise-routing-v2/resources/XHS-Direct.list`

Because Strict mode is earlier, `*.xiaohongshu.com` is already captured by the selected policy. `*.xhscdn.com` still reaches the DIRECT resource.

## 4. Disable precise rewrite

Disable the `小红书精准发布` rewrite while Strict mode is active.

The precise relay uses `$task.fetch` and is no longer needed once the whole Xiaohongshu API domain is routed through the selected policy.

## 5. Reconnect

- Fully terminate Xiaohongshu.
- Disconnect/reconnect Quantumult X.
- Reopen Xiaohongshu.
- Confirm `📤 小红书上传` points to the desired node.
- Post a NEW test comment.

Existing comments will not change their displayed IP region retroactively.
