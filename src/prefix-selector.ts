import prefixer from 'postcss-prefix-selector';
import postcss from 'postcss';
import { loopFiles } from './utils';

export type PrefixOption = {
  prefix?: string | undefined;
  exclude?: ReadonlyArray<string | RegExp> | undefined;
  ignoreFiles?: ReadonlyArray<string | RegExp> | undefined;
  includeFiles?: ReadonlyArray<string | RegExp> | undefined;
  transform?: ((prefix: Readonly<string>, selector: Readonly<string>, prefixedSelector: Readonly<string>, file: Readonly<string>) => string) | undefined;
  body?: boolean
};

const createTransform = (body: boolean) => {
  return  ((prefix, selector, prefixedSelector) => {
    if (selector === 'body') {
      return body ? `body${prefix}` : 'body';
    } else {
      return prefixedSelector;
    }
  }) as PrefixOption['transform']
}

/**
 * 调用 postCss 和 postcss-prefix-selector 处理 css 字符串
 */
export const prefixSelectorSingle = (css: string, opt: PrefixOption = {}) => {
  const plugin = prefixer({ transform: createTransform(opt.body), ...opt }) as any;
  const out = postcss().use(plugin).process(css).css;
  return out;
};

/**
 * 根据路径来批量给文件夹前缀
 * @param patten glob 路径
 * @param opt 前缀选项
 */
export const prefixSelector = (patten: string, opt: PrefixOption = {}) => {
  return loopFiles(patten, (data) => {
    const res = prefixSelectorSingle(data, opt);
    // console.log(res);
    return res;
  })
}

// 导出 prefixer 插件
export { prefixer };

// prefixSelector('./test copy/**', {
//   prefix: 'lalal'
// })

