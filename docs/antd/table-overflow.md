# antd 表头固定、不设置列宽且表头不换行的一种可行方案

在使用 antd Table 组件时，我们经常会遇到需要固定表头、自适应列宽且表头内容不换行的需求。虽然 antd 官方提供了 `scroll.y` 属性来实现表头固定，但这要求必须设置列宽，这与我们的自适应需求相冲突。本文将介绍一种基于 CSS `position: sticky` 的替代方案，完美解决这个问题。

## 面对的问题

1.  antd 表格竖直滚动时，表头需要固定
2.  设置表头固定时，不设置列宽，需要自适应列宽且不换行
3.  antd table 官方文档描述“固定表头时，需要指定 column 的 `width` 属性，否则列头和内容可能不对齐。”

综上，不能使用 antd 的 `scroll.y`属性来解决表头固定的问题

## 初步尝试

理所应当的想到用 sticky 来固定表头，修改 antd 默认样式；

    .ant-table{
        overflow-y: scroll;
        max-height: 60vh;
        .ant-table-thead{
            position: sticky;
            top: 0;
            z-index: 3;
        }
    }

发现不能生效后，查到 `position: sticky;`的生效条件：

1.  必须有 top、right、bottom 或 left 属性
2.  祖先元素的 overflow 属性不能是 hidden、scroll 或 auto

查看 dom 树后发现 ant-table-thead 的祖先元素 ant-table-container 的 overflow 属性确实为 auto，进而强制修改 overflow 属性：

    .ant-table{
        overflow-y: scroll;
        max-height: 60vh;
        .ant-table-content{
            overflow: visible !important;
        }
        .ant-table-thead{
            position: sticky;
            top: 0;
            z-index: 3;
            
        }
    }

发现此时表头固定已经生效，但在水平滚动时会出现分割线

![image-20240723211149125.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/3d0c8ef890eb4af6949b429d22c410fa~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5bCP6YOR5YGa6aKY5a62:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMzMyOTc4ODY1MzM0NDE5OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1732632491&x-orig-sign=Vu5kfdz2HT4pbJtAFkgDFgkixso%3D)

猜测是因为 overflow-x：visiable 造成的，进而想修改 overflow-x，改后惊人发现表头固定失效了，原来 overflow-x 也会对 sticky 造成影响。

### 终极方案

最后查到父元素设置为 `display:initial`可以消除 overflow 的影响，最终解决方案：

    .ant-table{
        overflow-y: scroll;
        max-height: 60vh;
        .ant-table-content{
            display: initial;
        }
        .ant-table-thead{
            position: sticky;
            top: 0;
            z-index: 3;
            
        }
    }

最终满足：

1.  表头固定
2.  表头不换行且自适应
