# 01. JSX 是什么？

## 1. 从一个问题开始

在之前的课程中，我们用原生 JS 创建页面元素是这样写的：

```javascript
const h1 = document.createElement("h1");
h1.textContent = "你好";
document.body.appendChild(h1);
```

三步：创建元素 → 设置内容 → 添加到页面。

如果页面很复杂，这种写法会变得非常啰嗦。React 提供了一种更直观的方式——**JSX**。

## 2. JSX 让你在 JS 中写 HTML

```tsx
const element = <h1>你好</h1>;
```

这不是 HTML，也不是字符串——它就是 JavaScript。

上面这行代码等价于：

```javascript
const element = React.createElement("h1", null, "你好");
```

JSX 只是 `React.createElement` 的**语法糖**，写起来更直观。

## 3. 语法糖是什么意思？

"语法糖"是指：**一种写法，它不提供新功能，只是让代码更容易读、更容易写**。

就像 Python 的列表推导式：

```python
# 普通写法
squares = []
for x in range(10):
    squares.append(x * x)

# 语法糖（列表推导式）
squares = [x * x for x in range(10)]
```

功能完全一样，但第二种写法更简洁、更直观。JSX 也是同样的道理。

## 4. 一句话总结

**JSX = 在 JS 文件中写 HTML 标签，是 `React.createElement` 的语法糖。**
