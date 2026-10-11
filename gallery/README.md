# Quantumult X Icon Gallery · v1.0.0

原生 Quantumult X **Icon Gallery** 订阅，遵循官方 `{"name":"...","description":"...","icons":[{"name":"...","url":"..."}]}` 格式。

## 订阅入口

| 名称 | 内容 | 导入 |
| --- | --- | --- |
| `color-plus.json` | 475 个图标 | [Gallery JSON](https://raw.githubusercontent.com/colorfullife123/xiaohongshu-qx-routing/main/gallery/color-plus.json) |
| `icon-gallery.json` | 1475 个图标 | [Gallery JSON](https://raw.githubusercontent.com/colorfullife123/xiaohongshu-qx-routing/main/gallery/icon-gallery.json) |
| `category-regions.json` | 79 个图标 | [Gallery JSON](https://raw.githubusercontent.com/colorfullife123/xiaohongshu-qx-routing/main/gallery/category-regions.json) |
| `category-policy.json` | 83 个图标 | [Gallery JSON](https://raw.githubusercontent.com/colorfullife123/xiaohongshu-qx-routing/main/gallery/category-policy.json) |
| `category-media.json` | 99 个图标 | [Gallery JSON](https://raw.githubusercontent.com/colorfullife123/xiaohongshu-qx-routing/main/gallery/category-media.json) |
| `category-app-game.json` | 41 个图标 | [Gallery JSON](https://raw.githubusercontent.com/colorfullife123/xiaohongshu-qx-routing/main/gallery/category-app-game.json) |
| `category-service.json` | 25 个图标 | [Gallery JSON](https://raw.githubusercontent.com/colorfullife123/xiaohongshu-qx-routing/main/gallery/category-service.json) |
| `category-social-ai.json` | 32 个图标 | [Gallery JSON](https://raw.githubusercontent.com/colorfullife123/xiaohongshu-qx-routing/main/gallery/category-social-ai.json) |
| `category-airport.json` | 17 个图标 | [Gallery JSON](https://raw.githubusercontent.com/colorfullife123/xiaohongshu-qx-routing/main/gallery/category-airport.json) |
| `category-task.json` | 44 个图标 | [Gallery JSON](https://raw.githubusercontent.com/colorfullife123/xiaohongshu-qx-routing/main/gallery/category-task.json) |
| `category-other.json` | 56 个图标 | [Gallery JSON](https://raw.githubusercontent.com/colorfullife123/xiaohongshu-qx-routing/main/gallery/category-other.json) |
| `category-custom.json` | 1 个图标 | [Gallery JSON](https://raw.githubusercontent.com/colorfullife123/xiaohongshu-qx-routing/main/gallery/category-custom.json) |
| `qure-color.json` | 347 个图标 | [Gallery JSON](https://raw.githubusercontent.com/colorfullife123/xiaohongshu-qx-routing/main/gallery/qure-color.json) |
| `qure-classic.json` | 327 个图标 | [Gallery JSON](https://raw.githubusercontent.com/colorfullife123/xiaohongshu-qx-routing/main/gallery/qure-classic.json) |
| `qure-dark.json` | 314 个图标 | [Gallery JSON](https://raw.githubusercontent.com/colorfullife123/xiaohongshu-qx-routing/main/gallery/qure-dark.json) |
| `qure-mini.json` | 359 个图标 | [Gallery JSON](https://raw.githubusercontent.com/colorfullife123/xiaohongshu-qx-routing/main/gallery/qure-mini.json) |
| `edc-country.json` | 23 个图标 | [Gallery JSON](https://raw.githubusercontent.com/colorfullife123/xiaohongshu-qx-routing/main/gallery/edc-country.json) |
| `edc-filter.json` | 52 个图标 | [Gallery JSON](https://raw.githubusercontent.com/colorfullife123/xiaohongshu-qx-routing/main/gallery/edc-filter.json) |
| `edc-airport.json` | 8 个图标 | [Gallery JSON](https://raw.githubusercontent.com/colorfullife123/xiaohongshu-qx-routing/main/gallery/edc-airport.json) |
| `edc-task.json` | 44 个图标 | [Gallery JSON](https://raw.githubusercontent.com/colorfullife123/xiaohongshu-qx-routing/main/gallery/edc-task.json) |

## 推荐

- **彩色整合**：https://raw.githubusercontent.com/colorfullife123/xiaohongshu-qx-routing/main/gallery/color-plus.json （475 个）
- **真正全量**：https://raw.githubusercontent.com/colorfullife123/xiaohongshu-qx-routing/main/gallery/icon-gallery.json （1475 个；四套风格均收录，资源多时预览可能较慢）
- **一键导入彩色整合**：[在 Quantumult X 打开](quantumult-x:///ui?module=gallery&type=icon&action=add&content=%5B%22https%3A%2F%2Fraw.githubusercontent.com%2Fcolorfullife123%2Fxiaohongshu-qx-routing%2Fmain%2Fgallery%2Fcolor-plus.json%22%5D)
- **一键导入全量**：[在 Quantumult X 打开](quantumult-x:///ui?module=gallery&type=icon&action=add&content=%5B%22https%3A%2F%2Fraw.githubusercontent.com%2Fcolorfullife123%2Fxiaohongshu-qx-routing%2Fmain%2Fgallery%2Ficon-gallery.json%22%5D)

Quantumult X 内操作：长按任意策略/节点 → 更换图标 → Icon Gallery → 右上角加号 → 粘贴 JSON 链接。也可以在 iPhone Safari 中打开一键导入链接。

## 内容来源和兼容

- Qure: https://github.com/Koolson/Qure （仅引用原作者 PNG，不复制原图）
- EDC: https://github.com/erdongchanyo/icon （仅引用原作者 PNG）
- 小红书：本仓库 `assets/xiaohongshu-policy-108.png`，108×108 像素；原始大图不变。
- 图标 PNG URL 均从真实 GitHub 树对象构建，不使用未经核对的文件名。
- Gallery JSON 与策略组 `img-url=` **是不同的使用入口**。现有主配置和 Rewrite 不受影响。

## 分类

- 四套完整风格：Qure 彩色、经典、深色、Mini
- EDC：国家地区、策略分流、机场、定时任务
- 便捷分类：地区、基础策略、影音音乐、游戏应用、服务节点、社交 AI、机场、任务、其他、用户定制
- `icon-gallery.json` 是全部实际引用图标的合集，`color-plus.json` 适合日常快速加载。

## 资源更新

在 GitHub Actions 中手动触发或由每周定时任务运行 `python3 gallery/generate.py`，检索 Qure/EDC GitHub 树中的真实 PNG 路径并重新生成 JSON。仅提交 `gallery/*.json`，不修改已有 Rewrite、JS、PNG 或策略规则。

> 来源图标版权归各自作者。引用资源适合个人使用；图标是否长期可访问取决于上游仓库。
