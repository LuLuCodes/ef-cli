const inquirer = require('inquirer');
const cmd = require('./cmd');
const projectName = cmd.projectName;

module.exports = {
  getQuestions: () => {
    const questions = [
      {
        type: 'list',
        message: '选择模板:',
        name: 'projectType',
        choices: [
          { name: '纯前端项目', value: 'Web' },
          { name: 'API项目', value: 'API' },
          { name: '前后端不分离(Web+API)', value: 'Web+API' },
        ],
      },
      {
        name: 'projectName',
        type: 'input',
        message: '项目名:',
        default: projectName,
      },
      {
        name: 'description',
        type: 'input',
        message: `项目描述:`,
        default: 'easy front project',
      },
      {
        name: 'author',
        type: 'input',
        message: `作者:`,
      },
      {
        type: 'confirm',
        message: '是否安装依赖包(cnpm)?',
        name: 'isNpmInstall',
        default: true,
      },
      {
        type: 'confirm',
        message: '是否集成gitlab-ci?',
        default: true,
        name: 'enableCI',
      },
      {
        type: 'confirm',
        message: '是否打包成docker镜像?',
        default: true,
        name: 'enableDocker',
        when(answer) {
          return answer.projectType === 'API' && answer.enableCI;
        },
      },
    ];
    return inquirer.prompt(questions);
  },
};
