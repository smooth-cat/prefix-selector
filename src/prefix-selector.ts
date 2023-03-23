import { createPlugin, PrefixOption } from './plugin';
import postcss from 'postcss';
import { loopFiles } from './utils';

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
  const plugin = createPlugin(opt) as any;
  const out = postcss([plugin]).process(css).css;
  return out;
};

/**
 * 根据路径来批量给文件夹前缀
 * @param patten glob 路径
 * @param opt 前缀选项
 */
export const prefixSelector = (patten: string, opt: PrefixOption = {}) => {
  return loopFiles(patten, (data, p) => {
    const res = prefixSelectorSingle(data, opt);
    console.log(`${p} ✅`);
    return res;
  })
}

// prefixSelector('./test copy/**', {
//   prefix: '[ok]'
// })

// prefixSelector('./test copy/**', {
//   prefix: '[ok]',
//   isOld: true,
// })

