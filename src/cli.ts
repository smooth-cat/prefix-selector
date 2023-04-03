import { program } from 'commander';
import { readJsonSync } from './utils';
import { prefixSelector } from './prefix-selector';
import { cwd } from './utils';
const pkg = readJsonSync(cwd('./package.json'));

export const execCli = () => {
  program
    .name('prefix-selector')
    .description('css 添加前缀命令行')
    .version(pkg.version);
  
  program
    .argument('<string>', 'glob 定义的文件夹路径 https://www.npmjs.com/package/glob')
    .option('-p, --prefix <prefix>', '需添加的 css 前缀选择器')
    .option('-e, --exclude <exclude>', '无需处理的选择器')
    .option('-b, --body', `是否修改 body 为 \`body\${prefix}\``)
    .option('-o, --id-class-only', `只对 包含 id 或 class 选择器 的做替换`)
    .action((patten, opt) => {
      prefixSelector(patten, opt);
    })
  
  program.parse();
}

