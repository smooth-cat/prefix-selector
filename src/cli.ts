import { program } from 'commander';
import { readJsonSync } from './utils';
import { prefixSelector } from './prefix-selector';
import { cwd } from './utils';
const pkg = readJsonSync(cwd('./package.json'));

program
  .name('prefix-selector')
  .description('css 添加前缀命令行')
  .version(pkg.version);

program
  .argument('<string>', 'glob 定义的文件夹路径 https://www.npmjs.com/package/glob')
  .option('-p, --prefix <prefix>', '需添加的 css 前缀选择器')
  .option('-e, --exclude <exclude>', '无需处理的选择器')
  .option('-b, --body', `是否修改body为 \`body\${prefix}\``)
  .action((patten, opt) => {
    prefixSelector(patten, opt);
  })

program.parse();
