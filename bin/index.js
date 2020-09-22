#!/usr/bin/env node

const inquirer = require('../libs/inquirer');
const path = require('path');
const fs = require('fs-extra');
const ora = require('ora'); // 终端显示loading
const chalk = require('chalk'); // 命令行输出字符颜色
const figlet = require('figlet');
const exec = require('promise-exec');
const currentPath = process.cwd(); // 当前目录路径

async function createProject(templatePath, distPath) {
  try {
    await fs.copy(templatePath, distPath);
  } catch (error) {
    chalk.red(error.message);
  }
}

async function createTemplate(config) {
  try {
    const projectName = config.projectName;
    const spinner = ora('正在生成...').start();
    let isWeb = config.projectType.indexOf('Web') !== -1;
    let isAPI = config.projectType.indexOf('API') !== -1;
    if (isWeb && isAPI) {
      const templateWebPath = path.resolve(__dirname, '../template/Web');
      const templateAPIPath = path.resolve(__dirname, '../template/API');
      const distClientPath = path.resolve(
        `${currentPath}/${projectName}/client`
      );
      const distServerPath = path.resolve(
        `${currentPath}/${projectName}/server`
      );
      await createProject(templateWebPath, distClientPath);
      await createProject(templateAPIPath, distServerPath);
      let packageJsonPath = path.resolve(distClientPath, 'package.json');
      await handlePackageJson(packageJsonPath, config);
      packageJsonPath = path.resolve(distServerPath, 'package.json');
      await handlePackageJson(packageJsonPath, config);
      await handlePackageScript(packageJsonPath);
      await fs.remove(path.resolve(distClientPath, '.gitlab-ci.yml'));
      await fs.remove(path.resolve(distServerPath, '.gitlab-ci.yml'));
      await fs.remove(path.resolve(distServerPath, '.gitlab-ci-docker.yml'));
      if (config.enableCI) {
        if (!config.enableDocker) {
          await fs.copy(
            path.resolve(__dirname, `../template/.gitlab-ci-web-api.yml`),
            path.resolve(`${currentPath}/${projectName}/.gitlab-ci.yml`)
          );
        } else {
          await fs.copy(
            path.resolve(
              __dirname,
              `../template/.gitlab-ci-web-api-docker.yml`
            ),
            path.resolve(`${currentPath}/${projectName}/.gitlab-ci.yml`)
          );
        }
      }
      spinner.stop();
      ora(chalk.green('目录生成成功！')).succeed();
      if (config.isNpmInstall) {
        const spinnerInstall = ora('安装依赖中...').start();
        await exec('cnpm i', {
          cwd: distClientPath,
        });
        await exec('cnpm i', {
          cwd: distServerPath,
        });
        spinnerInstall.stop();
        ora(chalk.green('相赖安装成功！')).succeed();
        successConsole(config);
      } else {
        successConsole(config);
      }
    } else {
      const templatePath = path.resolve(
        __dirname,
        `../template/${config.projectType}`
      );
      const distPath = path.resolve(`${currentPath}/${projectName}`);
      await createProject(templatePath, distPath);
      const packageJsonPath = path.resolve(distPath, 'package.json');
      await handlePackageJson(packageJsonPath, config);
      spinner.stop();
      ora(chalk.green('目录生成成功！')).succeed();
      if (isWeb) {
        if (!config.enableCI) {
          await fs.remove(path.resolve(distPath, '.gitlab-ci.yml'));
        }
      }
      if (isAPI) {
        if (!config.enableCI) {
          await fs.remove(path.resolve(distPath, '.gitlab-ci.yml'));
          await fs.remove(path.resolve(distPath, '.gitlab-ci-docker.yml'));
        } else {
          if (!config.enableDocker) {
            await fs.remove(path.resolve(distPath, '.gitlab-ci-docker.yml'));
            await fs.remove(path.resolve(distPath, 'pm2.json'));
          } else {
            await fs.remove(path.resolve(distPath, '.gitlab-ci.yml'));
            await fs.move(
              path.resolve(distPath, '.gitlab-ci-docker.yml'),
              path.resolve(distPath, '.gitlab-ci.yml')
            );
          }
        }
      }
      if (config.isNpmInstall) {
        const spinnerInstall = ora('安装依赖中...').start();
        await exec('cnpm i', {
          cwd: distPath,
        });
        spinnerInstall.stop();
        ora(chalk.green('相赖安装成功！')).succeed();
        successConsole(config);
      } else {
        successConsole(config);
      }
    }
  } catch (error) {
    chalk.red(error.message);
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
