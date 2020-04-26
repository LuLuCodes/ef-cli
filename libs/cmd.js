#!/usr/bin/env node

const program = require('commander');
const path = require('path');
const currentPath = process.cwd(); // 获取当前目录路径
const fs = require('fs-extra');
let projectName = null;

// 定义指令
program
  .version(require('../package.json').version)
  .command('init <name>')
  .description('初始化项目模板')
  .action(function (name) {
    projectName = name;
  });
program.parse(process.argv);
program.projectName = projectName;

if (!projectName) {
  console.error('输入项目名, 比如: ef-cli init your-project-name');
  process.exit(1);
}

if (fs.pathExistsSync(path.resolve(currentPath, `${projectName}`))) {
  console.error(
    `您创建的项目名:${projectName}已存在，创建失败，请修改项目名后重试`
  );
  process.exit(1);
}

module.exports = program;
