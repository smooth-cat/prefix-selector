# prefix-selector

## 批量给 css 文件加前缀选择器

> 本项目基于 postcss 和 postcss-prefix-selector 进行的整合的库<br/>
> 主要支持的是针对整个文件夹的 css 前缀选择器的添加<br/>

## 命令行使用方式

```sh
  # 查看使用方法
  prefix-selector -h

  prefix-selector [options] <string>

    Arguments:
      string                   glob 定义的文件夹路径 https://www.npmjs.com/package/glob

    Options:
      -V, --version            output the version number
      -p, --prefix <prefix>    需添加的 css 前缀选择器
      -e, --exclude <exclude>  无需处理的选择器
      -b, --body               是否修改 body 为 `body${prefix}`
      -h, --help               display help for command
```

## js 调用

```js
  const { prefixSelector } = require('prefixSelector');

  // 具体参考 https://www.npmjs.com/package/postcss-prefix-selector#usage-with-postcss
  prefixSelector('glob路径', {
    // 前缀选择器
    prefix?: string | undefined;
    // 无需处理的选择器
    exclude?: ReadonlyArray<string | RegExp> | undefined;
    // 自定义处理函数
    transform?: ((prefix: Readonly<string>, selector: Readonly<string>, prefixedSelector: Readonly<string>, file: Readonly<string>) => string) | undefined;
  })
```

## 执行前后 css 比较

命令行：

```sh
  prefix-selector './a.css' -p '[customer-prefix]' -b
```

执行前 a.css：

```css
  @media screen and (min-width: 480px) {
    body {
      background-color: lightgreen;
    }
  }

  #main {
    border: 1px solid black;
  }

  ul li {
    padding: 5px;
  }
```

执行后 a.css：

```css
  @media screen and (min-width: 480px) {
    body[customer-prefix] {
      background-color: lightgreen;
    }
  }

  [customer-prefix] #main {
    border: 1px solid black;
  }

  [customer-prefix] ul li {
    padding: 5px;
  }
```

## 使用场景，qiankun 等微前端框架的样式隔离

1. 在微前端的应用中子项目的样式会互相影响，通过本工具 你可以给每个子项目打包后的 css 选择器增加 前缀选择器，来实现样式隔离。
2. 在主项目中可以监听子项目的预挂载事件动态修改 body 的属性(选择器)来进行对应匹配。

```js
  let previousAppName;
  // 以 qiankun 为例

  registerMicroApps(..., {
    beforeMount: [
      (app: any) => {
        document.body.removeAttribute(previousAppName);
        document.body.setAttribute(app.name, '');
        previousAppName = app.name;
      },
    ],
  })
```

## postcss 插件调用
我们这里将 [postcss-prefix-selector](https://www.npmjs.com/package/postcss-prefix-selector) 做了导出，对应的插件引入方式
```js
const { prefixer } = require('prefix-selector');
```