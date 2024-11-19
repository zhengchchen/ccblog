## 浏览器回退机制

1. @support 语法：

```css
@support (text-shadow: 0 0 .3em gray) {
  h1 {
    color: transparent;
    text-shadow: 0 0 0.3em gray;
  }
}
```

2. javascript 实现

```javascript
const root = document.documentElement;
if ("textShadow" in root.style) {
  root.classList.add("textShadow");
} else {
  root.classList.add("no-textShadow");
}
```

3. 检查某个值浏览器是否支持

```javascript
const dummy = document.createElement("p");
dummy.style.backgroundImage = "linear-gradient(red,tan)";
if (dummy.style.backgroundImage) {
  root.classList.add("lineargradients");
} else {
  root.classList.add("no-lineargradients");
}
```
