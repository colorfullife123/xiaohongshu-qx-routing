# Xiaohongshu Quantumult X Split Routing

Quantumult X 小红书精准发布分流。目标：

- 图片 / 视频素材上传走你选择的出口；
- 最终发布请求走同一个出口；
- 评论、详情、推荐流及媒体 CDN 保持 DIRECT；
- 可在 Quantumult X 的 `🎯 小红书发布出口` 中自由选择任意节点 / `proxy` / `direct`。

## v2.0.0：精准发布模式

旧版把 `edith.xiaohongshu.com` 整个 Host 送进代理。由于评论、详情和发布 API 共用这个 Host，会导致评论区也误走代理。

v2.0.0 改成两层：

1. Host 级规则只代理真正的二进制素材上传 Host：
   - `ros-upload.xiaohongshu.com` → `🎯 小红书发布出口`
2. URL Path 级规则只处理 edith 上的发布链：
   - `/api/media/v1/upload/capa/permit`
   - `/api/sns/v2/note`

这两个 edith 请求通过 `script-analyze-echo-response` 捕获，再由 `$task.fetch(... opts.policy ...)` 仅对该请求指定 `🎯 小红书发布出口`。其余 `edith.xiaohongshu.com` 请求继续命中 DIRECT。

因此 QX 版不再需要 FlClash 那种“发布前切香港 → 30 秒后恢复”的计时器：**策略作用域本身就是单次发布请求。**

## 已确认的发布链

图片笔记发布时主要经过：

1. `edith.xiaohongshu.com/api/media/v1/upload/capa/permit`：上传授权
2. `ros-upload.xiaohongshu.com/notes_pre_post/...`：图片 / 视频素材上传
3. `edith.xiaohongshu.com/api/sns/v2/note`：最终创建 / 发布笔记
4. `sns-*.xhscdn.com/...`：发布后的图片与媒体读取

## 安装

### 1. 新增自定义发布策略

在你现有 `[policy]` 中加入：

```ini
static=🎯 小红书发布出口, direct, proxy, resource-tag-regex=.*, server-tag-regex=^(?!.*(?:流量|剩余|到期|套餐|官网|客服|订阅|重置)).+$, img-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Xiaohongshu.png
```

这会把常规机场节点加入该策略，并保留 `direct` / `proxy`。你也可以把 `resource-tag-regex=.*` 改成自己的机场订阅 Tag。

### 2. 添加分流规则

在 `[filter_remote]` 中按顺序加入：

```ini
https://raw.githubusercontent.com/colorfullife123/xiaohongshu-qx-routing/main/rules/XHS-Proxy.list, tag=小红书素材上传, force-policy=🎯 小红书发布出口, update-interval=86400, opt-parser=false, enabled=true
https://raw.githubusercontent.com/colorfullife123/xiaohongshu-qx-routing/main/rules/XHS-Direct.list, tag=小红书普通流量直连, force-policy=direct, update-interval=86400, opt-parser=false, enabled=true
```

素材上传规则必须在普通直连规则之前。

### 3. 添加精准发布 Rewrite

在 `[rewrite_remote]` 中加入：

```ini
https://raw.githubusercontent.com/colorfullife123/xiaohongshu-qx-routing/main/rewrite/XHS-Publish-Precise.snippet, tag=小红书精准发布, update-interval=86400, enabled=true
```

该资源会声明 `hostname = edith.xiaohongshu.com`。你需要在 Quantumult X 中生成、安装并信任 MitM CA，并开启 Rewrite / MitM。

### 4. 选择发布出口

Quantumult X 策略页打开 `🎯 小红书发布出口`，可直接选择某个具体节点、`proxy` 或 `direct`。

无需每次发布前再开启临时窗口：这个策略只会被素材上传和精准匹配到的发布链使用。

## 流量行为

| 请求 | v2.0.0 出口 |
| --- | --- |
| `ros-upload.xiaohongshu.com` | `🎯 小红书发布出口` |
| `edith.../api/media/v1/upload/capa/permit` | `🎯 小红书发布出口`（精确 Path） |
| `edith.../api/sns/v2/note` | `🎯 小红书发布出口`（精确 Path） |
| `edith` 评论 / 详情 / 普通 API | DIRECT |
| `*.xhscdn.com` | DIRECT |
| `t2.xiaohongshu.com` | DIRECT |
| `apm-native.xiaohongshu.com` | DIRECT |
| `rec.xiaohongshu.com` | DIRECT |
| `www.xiaohongshu.com` | DIRECT |

## 验证

发布一张测试图片后，在 Quantumult X 网络活动中检查：

- `ros-upload.xiaohongshu.com` → `🎯 小红书发布出口`
- 精准脚本日志出现：`[XHS-QX] precise relay ... via 🎯 小红书发布出口`
- 最终发布请求以 `$task.fetch` 指定策略的形式出现
- 打开评论区时 `edith.xiaohongshu.com` 普通 API → DIRECT
- `sns-*.xhscdn.com` → DIRECT

修改规则后建议彻底结束小红书后台并重新打开，避免已有连接复用旧路由。

## 兼容 / 回退模式

如果当前小红书版本对 `edith.xiaohongshu.com` 启用了无法被 QX MitM 的证书校验，精准 Rewrite 可能无法工作。此时关闭 `小红书精准发布` rewrite，并改挂：

```ini
https://raw.githubusercontent.com/colorfullife123/xiaohongshu-qx-routing/main/rules/XHS-Proxy-Legacy.list, tag=小红书Legacy发布, force-policy=🎯 小红书发布出口, update-interval=86400, opt-parser=false, enabled=true
```

Legacy 模式不需要 MitM，但会让 `edith` 上的评论 / 详情 API 一起走所选发布出口，这就是旧版行为。

## 安全与行为边界

- 本项目只改变网络出口，不修改小红书请求参数、签名、账号信息或响应数据。
- 精准脚本复制原请求的方法、Headers 和文本 Body，然后使用指定 QX policy 发出同一请求。
- QX 的 `$task.fetch` 指定 `opts.policy` 时不会复用原 HTTPS 连接，这是预期行为。
- 小红书接口可能随 App 版本变化；如果发布链 Host / Path 改变，需要更新匹配规则。

## 文件结构

```text
rules/
  XHS-Proxy.list
  XHS-Direct.list
  XHS-Proxy-Legacy.list
rewrite/
  XHS-Publish-Precise.snippet
scripts/
  xhs-publish-route.js
examples/
  QuantumultX.conf
flclash/
  ...
```

## License

MIT
