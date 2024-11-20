import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "ccblog",
  base: "/ccblog/",
  head: [
    ["link", { rel: "icon", type: "image/png", href: "/ccblog/favicon.png" }], // 如果是 .png
  ],
  description: "A blog containing front-end technologies such as React, typescript, next, tailwincss, etc.",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      // { text: 'Examples', link: '/markdown-examples' }
    ],

    sidebar: [
      {
        text: "React",
        items: [{ text: "React Compiler 和 React 19：你不再需要任何的 memo 了", link: "react/react-compiler" }],
      },
      {
        text: "Network",
        items: [{ text: "OAuth 2.0", link: "network/oatuh" }],
      },
      {
        text: "Css",
        items: [{ text: "浏览器回退机制", link: "css/browser-fallback" }],
      },
      {
        text: "Antd",
        items: [{ text: "antd 表头固定、不设置列宽且表头不换行的一种可行方案", link: "antd/table-overflow" }],
      },
      {
        text: "LeetCode",
        items: [
          { text: "56. 合并区间", link: "leetcode/56.合并区间" },
          { text: "1456. 定长子串中元音的最大数目", link: "leetcode/1456.定长子串中元音的最大数目" },
        ],
      },
    ],

    socialLinks: [{ icon: "github", link: "https://github.com/zhengchchen" }],
  },
});
