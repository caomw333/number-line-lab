# 开源来源

本地演示复用了 [Quill-00/INDEX](https://github.com/Quill-00/INDEX) 的数轴基础代码。

- 原始逻辑：[src/lib/numberline.ts](https://github.com/Quill-00/INDEX/blob/main/src/lib/numberline.ts)
- 原始交互组件：[src/components/NumberLine.tsx](https://github.com/Quill-00/INDEX/blob/main/src/components/NumberLine.tsx)
- 原项目代码许可：[MIT LICENSE](https://github.com/Quill-00/INDEX/blob/main/LICENSE)，完整文本保存在 LICENSE-INDEX.txt。
- 复用：坐标比例映射、取值限制、拖动取值吸附，以及从 DragPoint / DragLine 改写的指针拖动和键盘操作方式。
- 修改：移除 TypeScript / React 依赖，改成离线运行的原生 JavaScript；重新设计视觉界面，新增两点同步翻转、可暂停与拖动的翻转进度、符号联动和不等式例子。

未复制原项目教材内容。翻转动画、当前教学文案与页面样式为本演示新增。

检索中还参考了以下教学形式，未复制其代码或素材：

- [GeoGebra · Inequality Rules](https://www.geogebra.org/m/BEq7rstX)：移动两点，观察乘负数后顺序。
- [Math Training · Solving a Linear Inequality](https://caseyaedwards.github.io/math_training/diagrams/inequality-number-line/index.html)：除以负数后数轴与不等号方向变化；未在其仓库根目录找到明确许可。
