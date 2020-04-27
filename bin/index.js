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

async function createTemplate(config) {
  const projectName = config.projectName;
  const spinner = ora('正在生成...').start();
  if (config.projectType === 'Web+API') {
    try {
      await fs.copy(
        path.resolve(`${templatePath}/Web`),
        path.resolve(`${currentPath}/${projectName}/client`)
      );
      await fs.copy(
        path.resolve(`${templatePath}/API`),
        path.resolve(`${currentPath}/${projectName}/server`)
      );
      await fs.remove(
        path.resolve(
          `${currentPath}/${projectName}/server/src/public/stylesheets`
        )
      );
      spinner.stop();
      ora(chalk.green('目录生成成功！')).succeed();
      let packageJsonPath = path.resolve(
        `${currentPath}/${config.projectName}/client`,
        'package.json'
      );
      await handlePackageJson(packageJsonPath, config);
      packageJsonPath = path.resolve(
        `${currentPath}/${config.projectName}/server`,
        'package.json'
      );
      await handlePackageJson(packageJsonPath, config);
      await handlePackageScript(packageJsonPath);
      if (config.isNpmInstall) {
        const spinnerInstall = ora('安装依赖中...').start();
        await exec('cnpm install', {
          cwd: `${currentPath}/${projectName}/client`,
        });
        await exec('cnpm install', {
          cwd: `${currentPath}/${projectName}/server`,
        });
        spinnerInstall.stop();
        ora(chalk.green('相赖安装成功！')).succeed();
        successConsole(config);
      } else {
        successConsole(config);
      }
    } catch (error) {
      console.error(error);
    }
  } else {
    try {
      await fs.copy(
        path.resolve(`${templatePath}/${config.projectType}`),
        path.resolve(`${currentPath}/${projectName}`)
      );
      spinner.stop();
      ora(chalk.green('目录生成成功！')).succeed();
      const packageJsonPath = path.resolve(
        `${currentPath}/${config.projectName}`,
        'package.json'
      );
      await handlePackageJson(packageJsonPath, config);

      if (config.isNpmInstall) {
        const spinnerInstall = ora('安装依赖中...').start();
        await exec('cnpm install', {
          cwd: `${currentPath}/${projectName}`,
        });
        spinnerInstall.stop();
        ora(chalk.green('相赖安装成功！')).succeed();
        successConsole(config);
      } else {
        successConsole(config);
      }
    } catch (error) {
      console.error(error);
    }
  }
}
function handlePackageScript(packageJsonPath) {
  const spinner = ora('修改server script...').start();
  const promise = new Promise((resolve, reject) => {
    fs.readJson(packageJsonPath, (err, json) => {
      if (err) {
        console.error(err);
      }
      json.scripts.build +=
        ' && shx cp -r ../client/www/dist/* ./dist/public/ && shx cp -r ../client/www/publish.html ./dist/public/publish.html';
      json.scripts['pre-release'] +=
        ' && shx cp -r ../client/www/dist/* ./dist/public/ && shx cp -r ../client/www/publish.html ./dist/public/publish.html';
      json.scripts['test'] +=
        ' && shx cp -r ../client/www/dist/* ./dist/public/ && shx cp -r ../client/www/publish.html ./dist/public/publish.html';
      fs.writeFile(
        path.resolve(packageJsonPath),
        JSON.stringify(json, null, 2),
        (err) => {
          if (err) {
            return console.error(err);
          }
          spinner.stop();
          ora(chalk.green('server script 写入成功')).succeed();
          resolve();
        }
      );
    });
  });
  return promise;
}
function handlePackageJson(packageJsonPath, config) {
  const spinner = ora('正在写入package.json...').start();
  const promise = new Promise((resolve, reject) => {
    fs.readJson(packageJsonPath, (err, json) => {
      if (err) {
        console.error(err);
      }
      json.name = config.projectName;
      json.description = config.description;
      json.author = config.author;
      fs.writeFile(
        path.resolve(packageJsonPath),
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
  await createTemplate(config);
};
launch();
