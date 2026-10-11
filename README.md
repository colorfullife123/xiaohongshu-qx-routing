# Xiaohongshu Quantumult X Split Routing

Quantumult X 小红书精准发布分流。目标：

- 图片 / 视频素材上传走你选择的出口；
- 最终发布请求走同一个出口；
- 评论列表/详情/推荐流及媒体 CDN 保持 DIRECT；
- **发送评论与回复评论**跟随 `📤 小红书上传`，避免评论显示本地 IP 属地；
- 可在 Quantumult X 的 `📤 小红书上传` 中自由选择任意节点 / `proxy` / `direct`。

## v2.3.0：Strict IP 一致性模式

**推荐 iOS App 使用 Strict 模式；精准 Path 模式保留为实验/低代理流量模式。**

旧版把 `edith.xiaohongshu.com` 整个 Host 送进代理。由于评论、详情和发布 API 共用这个 Host，会导致评论区也误走代理。

v2.0.0 改成两层：

1. Host 级规则只代理真正的二进制素材上传 Host：
   - `ros-upload.xiaohongshu.com` → `📤 小红书上传`
2. URL Path 级规则只处理 edith 上的**写操作**：
   - `/api/media/v1/upload/capa/permit`
   - `/api/sns/v2/note`
   - `/api/sns/web/v1/comment/post`
   - App 版本的 `vN/comment/post|create|reply|send`
   - App 版本的 `vN/note/comment/post|create|reply|send`

这些写操作通过 `script-analyze-echo-response` 捕获，再由 `$task.fetch(... opts.policy ...)` 仅对该次请求指定 `📤 小红书上传`。评论读取的 `list/page`、详情及其他 `edith.xiaohongshu.com` 请求继续命中 DIRECT。

因此 QX 版不再需要 FlClash 那种“发布前切香港 → 30 秒后恢复”的计时器：**策略作用域本身就是单次发布请求。**


> **重要：不要把 `XHS-Upload.list` 打开“策略”开关。** 该文件是过滤规则，不包含节点；Quantumult X 会显示“无数据”。“策略 / as-policy”只应该用于节点/服务器订阅资源。

### 推荐：完全通过 Quantumult X UI 创建 `📤 小红书上传`

如果你不想编辑主配置的 `[policy]`，请在 Quantumult X 的**节点资源 / 服务器订阅**中：

1. 找到你当前正在使用的机场节点订阅。
2. **复制一份该订阅资源**（不要改原来的那份）。
3. 把复制后的资源名称/Tag 改为 `📤 小红书上传`。
4. 打开该资源的 **“策略”** 开关，使其作为一个 `static` 自定义策略出现。
5. 资源解析器保持与你原机场订阅相同；如果原订阅需要解析器，这份复制资源也要开启同一个解析器。
6. 策略图标使用：

```text
https://raw.githubusercontent.com/colorfullife123/xiaohongshu-qx-routing/614a3182d41ffe15eb8b9d7485855e99cf1dca31/assets/xiaohongshu-policy.png
```

完成后，Quantumult X 的“自定义策略”中会出现 `📤 小红书上传`，里面就是该机场订阅的节点，可以直接点选香港或其他节点。

随后再添加 `resources/XHS-Upload.list` 时，**不要开启它自己的“策略”开关**，只把“策略覆盖 / force-policy”指向 `📤 小红书上传`。


### 推荐给 App 的 Strict 模式

如果“发送评论”仍显示本地 IP 属地，说明当前 App 的实际写入链路没有被 Path Rewrite 稳定捕获，或者平台的属地判断不仅参考单个评论 POST。

此时不要继续使用精准 Rewrite，改用 **Strict IP 一致性模式**：

```text
https://raw.githubusercontent.com/colorfullife123/xiaohongshu-qx-routing/qx-precise-routing-v2/resources/XHS-Strict-IP.list
```

Quantumult X 设置：

- 类型：过滤资源
- “策略”开关：关闭
- 策略覆盖：`📤 小红书上传`
- 资源解析器：关闭
- **把它排在 XHS-Direct.list 前面**
- **关闭 `小红书精准发布` Rewrite，避免同一请求被脚本再次 relay**

Strict 模式会把所有 `*.xiaohongshu.com` API 连接送到 `📤 小红书上传`。这包括发布、评论发送、评论读取、推荐和普通 API，因此不会再依赖 App 内部 Path。大流量媒体仍由 `*.xhscdn.com` 的 DIRECT 规则直连。

> 如果平台的 IP 属地来自近期会话/账号活动而不只是单个评论 POST，Strict 模式也比“只代理评论 POST”更可靠，因为相关 API 会话都保持同一出口。


## 已确认的发布链

图片笔记发布时主要经过：

1. `edith.xiaohongshu.com/api/media/v1/upload/capa/permit`：上传授权
2. `ros-upload.xiaohongshu.com/notes_pre_post/...`：图片 / 视频素材上传
3. `edith.xiaohongshu.com/api/sns/v2/note`：最终创建 / 发布笔记
4. `sns-*.xhscdn.com/...`：发布后的图片与媒体读取

## 安装

### 1. 新增可见的自定义上传策略

在你现有 `[policy]` 中加入：

```ini
static=📤 小红书上传, direct, proxy, resource-tag-regex=.*, server-tag-regex=^(?!.*(?:流量|剩余|到期|套餐|官网|客服|订阅|重置)).+$, img-url=https://raw.githubusercontent.com/colorfullife123/xiaohongshu-qx-routing/614a3182d41ffe15eb8b9d7485855e99cf1dca31/assets/xiaohongshu-policy.png
```

策略图标已改为仓库内置的小红书红底图标；同时会把常规机场节点加入该策略，并保留 `direct` / `proxy`。你也可以把 `resource-tag-regex=.*` 改成自己的机场订阅 Tag。

### 2. 添加分流规则

在 `[filter_remote]` 中按顺序加入：

```ini
https://raw.githubusercontent.com/colorfullife123/xiaohongshu-qx-routing/main/rules/XHS-Proxy.list, tag=小红书素材上传, force-policy=📤 小红书上传, update-interval=86400, opt-parser=false, enabled=true
https://raw.githubusercontent.com/colorfullife123/xiaohongshu-qx-routing/main/rules/XHS-Direct.list, tag=小红书普通流量直连, force-policy=direct, update-interval=86400, opt-parser=false, enabled=true
```

素材上传规则必须在普通直连规则之前。

### 3. 添加精准发布 Rewrite

在 `[rewrite_remote]` 中加入：

```ini
https://raw.githubusercontent.com/colorfullife123/xiaohongshu-qx-routing/main/rewrite/XHS-Publish-Precise.snippet, tag=小红书精准发布, update-interval=86400, enabled=true
```

该资源会声明 `hostname = edith.xiaohongshu.com`。你需要在 Quantumult X 中生成、安装并信任 MitM CA，并开启 Rewrite / MitM。

### 4. 在“自定义策略”里切换上传/发布出口

Quantumult X 策略页打开 `📤 小红书上传`，可直接选择某个具体节点、`proxy` 或 `direct`。

该策略会直接显示在 Quantumult X 的“自定义策略”中。切换一次即可同时改变素材上传、最终发布以及**发送/回复评论**的出口；评论列表加载、详情和其他普通 API 仍为 DIRECT。

## 流量行为

| 请求 | v2.1.0 出口 |
| --- | --- |
| `ros-upload.xiaohongshu.com` | `📤 小红书上传` |
| `edith.../api/media/v1/upload/capa/permit` | `📤 小红书上传`（精确 Path） |
| `edith.../api/sns/v2/note` | `📤 小红书上传`（精确 Path） |
| `edith.../api/sns/web/v1/comment/post` | `📤 小红书上传`（发送/回复评论） |
| App `.../comment/post|create|reply|send` | `📤 小红书上传`（发送/回复评论） |
| `edith` 评论列表 `list/page` / 详情 / 普通 API | DIRECT |
| `*.xhscdn.com` | DIRECT |
| `t2.xiaohongshu.com` | DIRECT |
| `apm-native.xiaohongshu.com` | DIRECT |
| `rec.xiaohongshu.com` | DIRECT |
| `www.xiaohongshu.com` | DIRECT |

## 验证

发布一张测试图片后，在 Quantumult X 网络活动中检查：

- `ros-upload.xiaohongshu.com` → `📤 小红书上传`
- 精准脚本日志出现：`[XHS-QX] precise relay ... via 📤 小红书上传`
- 最终发布请求以 `$task.fetch` 指定策略的形式出现
- 发送一条测试评论时，日志应出现 `[XHS-QX] precise relay POST ...comment... via 📤 小红书上传`
- 打开/滚动评论区时 `...comment/list` 或 `...comment/page` → DIRECT
- `sns-*.xhscdn.com` → DIRECT

修改规则后建议彻底结束小红书后台并重新打开，避免已有连接复用旧路由。

## 兼容 / 回退模式

如果当前小红书版本对 `edith.xiaohongshu.com` 启用了无法被 QX MitM 的证书校验，精准 Rewrite 可能无法工作。此时关闭 `小红书精准发布` rewrite，并改挂：

```ini
https://raw.githubusercontent.com/colorfullife123/xiaohongshu-qx-routing/main/rules/XHS-Proxy-Legacy.list, tag=小红书Legacy发布, force-policy=📤 小红书上传, update-interval=86400, opt-parser=false, enabled=true
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
