# Cover Pro · 封面生成器

在浏览器中编辑社交媒体封面，使用 React、TypeScript、Vite 和 Canvas。提供模板、文字、Emoji、形状、图层编辑以及 PNG / JPEG / WebP 导出。

[GitHub](https://github.com/WUTONGCN/cover-pro) · [问题反馈](https://github.com/WUTONGCN/cover-pro/issues) · [MIT](LICENSE)

## 本地运行

需要 Node.js 22 和 npm。

```bash
git clone https://github.com/WUTONGCN/cover-pro.git
cd cover-pro
npm ci
npm run dev
```

访问终端显示的地址，默认是 `http://localhost:3000`。

```bash
npm run lint
npm test
npm run build
npm run preview
```

构建文件位于 `dist/`，可部署至静态网站服务器。无需后端和 API Key。

## 使用

1. 选择模板或添加文字、Emoji、形状。
2. 拖动、缩放、旋转元素，在属性面板修改样式，在图层面板调整顺序、显示与锁定。
3. 选择平台尺寸及格式，点击“下载封面图片”。预览与导出共用绘制逻辑。

编辑操作支持最多 100 步撤销/重做；连续拖动合并为一步。重置画布前会提示，并可撤销。

| 快捷键 | 操作 |
| --- | --- |
| Ctrl / Cmd + Z | 撤销 |
| Ctrl / Cmd + Shift + Z，Ctrl / Cmd + Y | 重做 |
| Ctrl / Cmd + D | 复制选中元素 |
| Delete / Backspace | 删除选中元素 |
| 方向键 / Shift + 方向键 | 移动 1 / 10 像素 |

在输入框中编辑文字时，快捷键不会误删画布元素。锁定的元素不能直接拖动或修改内容；先从图层面板解锁。

## 当前边界

- 编辑内容保存在当前页面内存，刷新或关闭会丢失；没有账号、云端保存或自动上传。
- UI 尚未提供图片/贴纸导入；类型声明中的相关类型不代表已实现。
- 字体效果取决于设备安装的字体。导出会等待浏览器字体加载。
- 移动端可滚动访问各面板；精细编辑推荐使用桌面浏览器。

## 隐私与贡献

应用不发送编辑内容到后端。当前源码删除了个人联系方式和收款二维码，反馈统一使用 GitHub Issues；历史提交未重写。

见 [贡献指南](CONTRIBUTING.md)、[安全说明](SECURITY.md) 和 [MIT 协议](LICENSE)。新增功能请附带可复现验证；第三方库沿用自身许可证。
