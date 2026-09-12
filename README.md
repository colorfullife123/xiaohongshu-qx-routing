# Xiaohongshu Quantumult X Split Routing

用于 Quantumult X 的小红书分流规则：**发布 / 上传走代理，图片 / 视频 CDN 下行走直连**。

## 工作原理

根据实际抓包确认，小红书发布一篇图片笔记时主要经过：

1. `edith.xiaohongshu.com/api/media/v1/upload/capa/permit`：上传授权
2. `ros-upload.xiaohongshu.com/notes_pre_post/...`：图片 / 视频素材分片上传
3. `edith.xiaohongshu.com/api/sns/v2/note`：最终创建 / 发布笔记
4. `sns-*.xhscdn.com/...`：发布后图片与媒体 CDN 读取

因此本项目将：

- `ros-upload.xiaohongshu.com` → 代理
- `edith.xiaohongshu.com` → 代理
- `*.xhscdn.com` → DIRECT
- `t2.xiaohongshu.com`、`apm-native.xiaohongshu.com`、`rec.xiaohongshu.com`、`www.xiaohongshu.com` → DIRECT

> Quantumult X 常规分流以连接 / Host 为单位，无法把同一条 HTTPS 连接的上行与下行拆成两个出口。因此 `edith.xiaohongshu.com` 上的普通 JSON API 也会随发布 API 一起走代理；大流量图片 / 视频 CDN 仍保持直连。

## Quantumult X 远程挂载

在配置文件的 `[filter_remote]` 中加入：

```ini
https://raw.githubusercontent.com/colorfullife123/xiaohongshu-qx-routing/main/rules/XHS-Proxy.list, tag=小红书上传代理, force-policy=小红书代理, update-interval=86400, opt-parser=false, enabled=true
https://raw.githubusercontent.com/colorfullife123/xiaohongshu-qx-routing/main/rules/XHS-Direct.list, tag=小红书下行直连, force-policy=direct, update-interval=86400, opt-parser=false, enabled=true
```

把 `小红书代理` 替换成你 Quantumult X 中真实存在的代理节点或策略组名称。

**建议保持 Proxy 资源在 Direct 资源之前。**

## 文件结构

```text
rules/
  XHS-Proxy.list     # 发布 / 上传代理规则
  XHS-Direct.list    # CDN / 普通下行直连规则
examples/
  QuantumultX.conf   # 远程挂载示例
```

## 验证方法

发布一张测试图片后，在 Quantumult X 的网络活动中检查：

- `ros-upload.xiaohongshu.com` → 命中代理
- `edith.xiaohongshu.com/api/sns/v2/note` → 命中代理
- `sns-*.xhscdn.com` → 命中 DIRECT

修改规则后建议彻底结束小红书后台并重新打开，避免已有连接继续复用旧路由。

## 注意

- 小红书接口可能随 App 版本变化；建议发现新上传域名后提交 Issue 或更新规则。
- 本项目只做网络分流，不修改请求内容、不绕过平台验证。
- 未列出的其他小红书域名继续按照你自己的 Quantumult X 全局规则处理。

## License

MIT
