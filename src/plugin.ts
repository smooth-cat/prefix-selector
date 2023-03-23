export type PrefixOption = {
  prefix?: string;
  exclude?: RegExp;
  // TODO:
  ignoreFiles?: RegExp;
  // TODO:
  includeFiles?: RegExp;
  transform?: ((prefix: string, selector: string, prefixedSelector: string) => string|undefined);
  body?: boolean;
  isOld?: boolean;
};

const DefaultOpt: PrefixOption = {
  body: false,
}

type ICtx = Record<any, any> & PrefixOption & {
  selector: string;
  group: IGroupItem[];
  handledSelector: string;
}

export type IGroupItem = {
  first: string;
  follow?: string;
  splitter?: string;
}

let ctx = { ...DefaultOpt } as ICtx;
const resetCtx = () => ctx = { ...DefaultOpt } as ICtx;
export const createPlugin = (opt: PrefixOption) => {
  return  opt.isOld ? createOldPlugin(opt) : createNewPlugin(opt);
}

export const createNewPlugin = (opt: PrefixOption) => {
  const fn = (root) => {
    ctx = { ...ctx, ...DefaultOpt, ...opt };

    return {
      postcssPlugin: 'prefix-selector',
      Rule
    };
  }
  fn['postcss'] = true;
  return fn;
}

// postcss 会对改变后的 ast 重新触发 Rule
const walked = new WeakSet();
function Rule(node) {
  if(nodeFallback(node)) return;
  const { selector } = node;
  ctx.selector = selector;
  // 分割
  splitSelector();
  // 获取处理后的选择器
  processSelector();
  // 修改 ast
  node.selector = ctx.handledSelector;
  // console.log('ctx.handledSelector', ctx.handledSelector);
  // 重置上下文
  // resetCtx()
}

/**
 * 1. 对父子选择器进行分解
 * 2. 只对第一个父级选择器的每一项进行添加前缀
 * @param params 
 */
const splitSelector = () => {
  const { selector: raw } = ctx;
  /** 空格 */
  const Descendant = /(?<=\w) +(?=\w)/.source;
  /** > */
  const Child = / *\> */.source;
  /** ~ */
  const General = / *\~ */.source;
  /** + */
  const Adjacent = / *\+ */.source;
  /** , */
  const Group = / *\, */.source;

  // 先处理 ,
  const group =  raw.split(new RegExp(Group, 'g')).reduce<any[]>((acc, cur) => {
    cur = cur.trim();
    if(!cur) {
      return acc;
    }

    // 对每一项进行分割
    const splitterReg = new RegExp(`(${Descendant}|${Child}|${General}|${Adjacent})`, 'g');
    let [first='', splitter, follow=''] = cur.split(splitterReg, 3);
    // const splitter =  raw.match(splitterReg)?.[0];

    acc.push({
      first,
      follow,
      splitter
    })
    return acc;
  }, []);

  ctx = {...ctx, group }
}

/** 
 * 处理选择器
 * 1. 处理 exclude
 * 2. 
*/
const processSelector = () => {
  let { group } = ctx;

  const handledSelector =  group.map(({ first, follow, splitter }) => {
    const handledFirst = handleEveryFirst(first)
    if ([handledFirst, follow, splitter].every(it => it)) {
      return `${handledFirst}${splitter}${follow}`;
    }
    
    return handledFirst;
  }).join(',')

  ctx.handledSelector = handledSelector
}

/**
 * 单个处理选择器
 * @param selector 
 */
const handleEveryFirst = (selector: string) => {
  let {
    prefix,
    exclude,
    // ignoreFiles,
    // includeFiles,
    transform,
    body
  } = ctx;
  // 忽略的
  if(exclude && selector.match(exclude)) return selector;

  // 默认忽略 body
  if(selector === 'body' && !body) return selector;

  const prefixSelector = `${prefix} ${selector}`;

  // 没有处理直接返回带前缀的
  if(transform == null) return prefixSelector;

  // 处理结果
  const res = transform(prefix, selector, prefixSelector);

  // 未返回则不进行替换
  if(res == null) return selector;

  // 返回结果
  return res;
}

/** 不处理的节点 */
const nodeFallback = (node: any) => {
  // 遍历过的节点不再处理
  if(walked.has(node)) return true;
  walked.add(node);

  // 父级是 keyframe 的不做处理
  const keyframeRules = [
    'keyframes',
    '-webkit-keyframes',
    '-moz-keyframes',
    '-o-keyframes',
  ];

  if (node?.parent && keyframeRules.includes(node?.parent?.name)) {
    return true;
  }
  return false;
}

export const createOldPlugin = (opt: PrefixOption) => {
  return function (root) {
    ctx = { ...ctx, ...DefaultOpt, ...opt };

    root.walkRules((node) => {
      if(nodeFallback(node)) return;
      
      const selectors = [...node.selectors]

      node.selectors = selectors.map((selector: string) => {
        const res = handleEveryFirst(selector);
        return res;
      });
    });

    resetCtx();
  };
};


// Rule({selector: 'aaa'});
// Rule({selector:'aaa,bbb cccc'});
// Rule({selector:'aaa , bbb > cccc'});
// Rule({selector:'aaa , bbb~ cccc'});
// Rule({selector:'aaa , bbb+ cccc'});
// Rule({selector:'aaa , bbb cccc'});