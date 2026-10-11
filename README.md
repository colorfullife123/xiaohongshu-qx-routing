# Xiaohongshu Quantumult X Split Routing

Quantumult X 小红书发布/评论 IP 分流。

## 正式版：v2.4.3

当前推荐结构只有：

- **1 个自定义策略**：`📤 小红书上传`
- **1 个 Rewrite 资源**：`XHS-Write-IP.snippet`

已在 iOS 实机日志确认：

```text
WRITE POST /api/sns/v4/note/comment
reason=confirmed-note-comment
via 📤 小红书上传
```

同时评论列表读取保持：

```text
READ GET /api/sns/v5/note/comment/list
via direct
```

因此当前设计目标是：

| 操作 | 出口 |
| --- | --- |
| 发布作品 | `📤 小红书上传` |
| 发送评论 | `📤 小红书上传` |
| 回复评论 | `📤 小红书上传` |
| 打开/滚动评论区 | DIRECT |
| 普通读取/浏览 API | DIRECT |
| `*.xhscdn.com` 媒体 CDN | DIRECT（可选资源强制） |

> 本项目控制网络请求出口；小红书最终如何生成/展示“IP 属地”属于平台侧逻辑，不能保证 UI 标签仅依据单条请求。

## 1. 添加自定义策略

在 Quantumult X 主配置的 `[policy]` 中加入：

```ini
static = 📤 小红书上传, direct, proxy, resource-tag-regex=.*, server-tag-regex=^(?!.*(?:流量|剩余|到期|套餐|官网|客服|订阅|重置)).+$, img-url=https://raw.githubusercontent.com/colorfullife123/xiaohongshu-qx-routing/main/assets/xiaohongshu-policy.png
```

策略会显示仓库内置的**小红书图标**。

也可以参考：

```text
https://raw.githubusercontent.com/colorfullife123/xiaohongshu-qx-routing/main/policy/XHS-Upload-Custom-Policy.txt
```

然后在 Quantumult X 的“自定义策略”中打开：

`📤 小红书上传`

并选择需要的香港或其他节点。

## 2. 添加正式 Rewrite

Rewrite 订阅：

```text
https://raw.githubusercontent.com/colorfullife123/xiaohongshu-qx-routing/main/rewrite/XHS-Write-IP.snippet
```

Quantumult X 中将它作为 **Rewrite 资源**添加并启用。

该 Rewrite 对 `edith.xiaohongshu.com` 的带 Body 请求进行分类：

- 已确认的发布/评论写操作 → `📤 小红书上传`
- 评论列表、分页、查询、详情、消息读取 → DIRECT
- 未识别的普通请求 → 默认 DIRECT

核心脚本：

```text
https://raw.githubusercontent.com/colorfullife123/xiaohongshu-qx-routing/main/scripts/xhs-write-ip-v2.4.3.js
```

## 3. MitM

必须已经在 Quantumult X 中生成、安装并信任 MitM CA。

Rewrite 自带：

```text
hostname = edith.xiaohongshu.com
```

## 4. 旧方案

正式版 v2.4.3 下建议关闭：

- `XHS-Strict-IP.list`
- `XHS-Publish-Precise.snippet`
- `XHS-Upload.list`

如果只想让媒体 CDN 强制直连，可以保留：

```text
https://raw.githubusercontent.com/colorfullife123/xiaohongshu-qx-routing/main/resources/XHS-Direct.list
```

当前该资源只包含：

```text
host-suffix, xhscdn.com, direct
```

## 5. 验证

更新资源后：

1. 完全结束小红书后台。
2. 重连 Quantumult X。
3. 确认 `📤 小红书上传` 已选中目标节点。
4. 重新打开小红书。
5. 发送一条新评论。

正确日志应类似：

```text
[XHS-QX v2.4.3] WRITE POST /api/sns/v4/note/comment reason=confirmed-note-comment via 📤 小红书上传
```

而打开评论区应类似：

```text
[XHS-QX v2.4.3] READ GET /api/sns/v5/note/comment/list reason=safe-method via direct
```

## 文件

```text
assets/
  xiaohongshu-policy.png
policy/
  XHS-Upload-Custom-Policy.txt
rewrite/
  XHS-Write-IP.snippet
scripts/
  xhs-write-ip-v2.4.3.js
resources/
  XHS-Direct.list
examples/
  QuantumultX-Rewrite-IP.conf
```

## License

MIT
