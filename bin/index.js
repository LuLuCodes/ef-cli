#!/usr/bin/env node

const inquirer = require('../libs/inquirer');
const path = require('path');
const fs = require('fs-extra');
const ora = require('ora'); // 终端显示loading
const chalk = require('chalk'); // 命令行输出字符颜色
const figlet = require('figlet');
const exec = require('promise-exec');
const currentPath = process.cwd(); // 当前目录路径
const templatePath = path.resolve(__dirname, '../template/');

function createTemplate(config) {
  const projectName = config.projectName;
  const spinner = ora('正在生成...').start();
  fs.copy(
    path.resolve(`${templatePath}/${config.projectType}`),
    path.resolve(`${currentPath}/${projectName}`)
  )
    .then(() => {
      spinner.stop();
      ora(chalk.green('目录生成成功！')).succeed();
      return handlePackageJson(config);
    })
    .then(() => {
      if (config.isNpmInstall) {
        const spinnerInstall = ora('安装依赖中...').start();
        exec('cnpm install', {
          cwd: `${currentPath}/${projectName}`,
        })
          .then(function () {
            spinnerInstall.stop();
            ora(chalk.green('相赖安装成功！')).succeed();
            successConsole(config);
          })
          .catch(function (err) {
            console.error(err);
          });
      } else {
        successConsole(config);
      }
    })
    .catch((err) => console.error(err));
}

function handlePackageJson(config) {
  const spinner = ora('正在写入package.json...').start();
  const promise = new Promise((resolve, reject) => {
    const packageJsonPath = path.resolve(
      `${currentPath}/${config.projectName}`,
      'package.json'
    );
    fs.readJson(packageJsonPath, (err, json) => {
      if (err) {
        console.error(err);
      }
      json.name = config.projectName;
      json.description = config.description;
      json.author = config.author;
      fs.writeFile(
        path.resolve(`${currentPath}/${config.projectName}/package.json`),
        JSON.stringify(json, null, 2),
        (err) => {
          if (err) {
            return console.error(err);
          }
          spinner.stop();
          ora(chalk.green('package.json 写入成功')).succeed();
          resolve();
        }
      );
    });
  });
  return promise;
}

function successConsole(config) {
  console.log('');
  const projectName = config.projectName;
  console.log(
    `${chalk.gray('项目路径：')} ${path.resolve(
      `${currentPath}/${projectName}`
    )}`
  );
  console.log(chalk.gray('接下来，执行：'));
  console.log('');
  console.log('      ' + chalk.green('cd ') + projectName);
  if (!config.isNpmInstall) {
    console.log('      ' + chalk.green('npm install or cnpm install'));
  }
  console.log('      ' + chalk.green('npm run dev'));
  console.log('');
  console.log(chalk.green('enjoy coding ...'));
  console.log(chalk.green(figlet.textSync('LuLuCodes')));
}

const launch = async () => {
  const config = await inquirer.getQuestions();
  createTemplate(config);
};
launch();
