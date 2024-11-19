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
        items: [{ text: "React Compiler", link: "react/react-compiler" }],
      },
      {
        text: "Network",
        items: [{ text: "OAuth 2.0", link: "network/oatuh" }],
      },
      {
        text: "Css",
        items: [{ text: "Browser Fallback", link: "css/browser-fallback" }],
      },
    ],

    socialLinks: [{ icon: "github", link: "https://github.com/zhengchchen" }],
  },
});
