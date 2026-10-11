# Xiaohongshu Quantumult X Split Routing

Quantumult X 小红书发布/评论 IP 分流。

## 正式版 v2.4.4

推荐结构：

- **1 个自定义策略**：`📤 小红书上传`
- **1 个 Rewrite 资源**：`XHS-Write-IP.snippet`
- 可选：`*.xhscdn.com` 媒体 CDN 强制 DIRECT

iOS 实机日志已确认当前评论发布接口：

```text
WRITE POST /api/sns/v4/note/comment
reason=confirmed-note-comment
via 📤 小红书上传
```

评论列表读取保持 DIRECT：

```text
READ GET /api/sns/v5/note/comment/list
reason=safe-method
via direct
```

### 当前行为

| 操作 | 出口 |
| --- | --- |
| 发布作品 | `📤 小红书上传` |
| 发送评论 | `📤 小红书上传` |
| 回复评论 | `📤 小红书上传` |
| 打开/滚动评论区 | DIRECT |
| 普通读取/浏览 API | DIRECT |
| `*.xhscdn.com` 媒体 CDN | DIRECT（可选强制） |

> 本项目控制请求出口；小红书最终如何计算或展示“IP 属地”属于平台侧逻辑。

## 1. 自定义策略 + 小红书图标

在主配置 `[policy]` 中加入：

```ini
static = 📤 小红书上传, 自动选择, 全球加速, direct, 香港节点, 台湾节点, 日本节点, 狮城节点, 美国节点, proxy, img-url=https://raw.githubusercontent.com/colorfullife123/xiaohongshu-qx-routing/main/assets/xiaohongshu-policy-108.png
```

图标文件已内置到本仓库（108×108 适配 Quantumult X；原始 512×512 图另行保留）：

```text
https://raw.githubusercontent.com/colorfullife123/xiaohongshu-qx-routing/main/assets/xiaohongshu-policy-108.png
```

策略模板：

```text
https://raw.githubusercontent.com/colorfullife123/xiaohongshu-qx-routing/main/policy/XHS-Upload-Custom-Policy.txt
```

然后在 Quantumult X 的“自定义策略”中，`📤 小红书上传` 会按以下顺序显示候选项：

```text
自动选择
全球加速
direct
香港节点
台湾节点
日本节点
狮城节点
美国节点
proxy
```

这些名称必须与你当前 Quantumult X 主配置中的策略名称完全一致。

## 2. Rewrite 正式订阅

```text
https://raw.githubusercontent.com/colorfullife123/xiaohongshu-qx-routing/main/rewrite/XHS-Write-IP.snippet
```

作为 **Rewrite 资源**添加并启用。

Rewrite 使用：

```text
https://raw.githubusercontent.com/colorfullife123/xiaohongshu-qx-routing/main/scripts/xhs-write-ip-v2.4.3.js
```

它会将已识别的发布/评论写操作通过 `📤 小红书上传` 重新发送；评论列表、分页、查询、详情和普通读取保持 DIRECT。

## 3. MitM

必须在 Quantumult X 中生成、安装并信任 MitM CA。

Rewrite 已声明：

```text
hostname = edith.xiaohongshu.com
```

## 4. 可选媒体直连

如果希望明确强制小红书媒体 CDN 直连：

```text
https://raw.githubusercontent.com/colorfullife123/xiaohongshu-qx-routing/main/resources/XHS-Direct.list
```

内容只有：

```text
host-suffix, xhscdn.com, direct
```

## 5. 旧模式

v2.4.3 下建议停用旧的：

- `XHS-Strict-IP.list`
- `XHS-Publish-Precise.snippet`
- `XHS-Upload.list`

## 6. 验证

刷新资源后：

1. 完全结束小红书后台。
2. 重连 Quantumult X。
3. 确认 `📤 小红书上传` 已选择目标节点。
4. 重新打开小红书。
5. 发送新评论。

正确日志应出现：

```text
[XHS-QX v2.4.3] WRITE POST /api/sns/v4/note/comment reason=confirmed-note-comment via 📤 小红书上传
```

打开评论区时则应出现：

```text
[XHS-QX v2.4.3] READ GET /api/sns/v5/note/comment/list reason=safe-method via direct
```

## 文件结构

```text
assets/
  xiaohongshu-policy.png
policy/
  XHS-Upload-Custom-Policy.txt
rewrite/
  XHS-Write-IP.snippet
  XHS-Write-IP-v2.4.3.snippet
scripts/
  xhs-write-ip-v2.4.3.js
resources/
  XHS-Direct.list
examples/
  QuantumultX.conf
```

## License

MIT
