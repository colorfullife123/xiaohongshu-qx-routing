# Xiaohongshu Quantumult X Split Routing

Quantumult X 小红书精准发布分流。目标：

- 图片 / 视频素材上传走你选择的出口；
- 最终发布请求走同一个出口；
- 评论列表/详情/推荐流及媒体 CDN 保持 DIRECT；
- **发送评论与回复评论**跟随 `📤 小红书上传`，避免评论显示本地 IP 属地；
- 可在 Quantumult X 的 `📤 小红书上传` 中自由选择任意节点 / `proxy` / `direct`。

## v2.4.0：Rewrite 发布 IP 模式

**当前推荐方案：1 个自定义策略 + 1 个 Rewrite。**

不再使用 Strict Host 分流作为主方案，也不再猜测具体的评论/发布 Path。v2.4.0 直接对：

`edith.xiaohongshu.com`

上的所有 URL 挂载 `script-analyze-echo-response`。

Quantumult X 官方说明 body 相关 Rewrite 在请求 Body 为空时不会执行。因此普通无 Body 请求不会被脚本 relay；带 Body 的 API 请求会由脚本使用：

`$task.fetch(..., opts: { policy: "📤 小红书上传" })`

重新发出。

这覆盖当前 App 中最关键的写入行为：

- 发布作品最终提交
- 发布评论
- 回复评论
- 其他 edith 上带 Body 的写操作

因此不再依赖 `/api/sns/v2/note`、`/comment/post` 等可能变化的私有 Path。

### 安装

保留你的自定义策略：

`📤 小红书上传`

然后只添加这个 Rewrite 资源：

```text
https://raw.githubusercontent.com/colorfullife123/xiaohongshu-qx-routing/qx-precise-routing-v2/rewrite/XHS-Write-IP.snippet
```

Quantumult X 中：

- 类型：Rewrite 资源
- 启用：是
- MitM CA：必须已安装并信任
- `hostname` 已由资源声明为 `edith.xiaohongshu.com`

### v2.4.0 下应关闭

- `XHS-Strict-IP.list`
- 旧 `XHS-Publish-Precise.snippet`
- `XHS-Upload.list`（为了“显示的发布/评论 IP”不再需要）

`XHS-Direct.list` 仅在你明确希望 `*.xhscdn.com` 强制 DIRECT 时可保留，它不会影响发布 IP。

### 验证

完全结束小红书后台并重连 Quantumult X 后，发布一条新评论或新作品。

Quantumult X 日志应出现：

```text
[XHS-QX v2.4] relay POST https://edith.xiaohongshu.com/... via 📤 小红书上传
```

只要该日志出现，真正提交请求就是由你选中的策略节点发出的。

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
| `t2.xiaohongshu.com` | `📤 小红书上传`（Strict） |
| `apm-native.xiaohongshu.com` | `📤 小红书上传`（Strict） |
| `rec.xiaohongshu.com` | `📤 小红书上传`（Strict） |
| `www.xiaohongshu.com` | `📤 小红书上传`（Strict） |

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


## 历史 Strict 模式判定（v2.3.x，仅回退参考）

如果 Quantumult X 网络活动里仍出现：

```text
HOST, EDITH.XIAOHONGSHU.COM, DIRECT
HOST, T2.XIAOHONGSHU.COM, DIRECT
```

说明本机仍在使用旧版 `XHS-Direct.list` 缓存或还有其他规则在抢先 DIRECT。

刷新 v2.3.1 后，正确结果应类似：

```text
HOST-SUFFIX, XIAOHONGSHU.COM, 📤 小红书上传
```

而媒体 CDN 才应显示：

```text
HOST-SUFFIX, XHSCDN.COM, DIRECT
```
