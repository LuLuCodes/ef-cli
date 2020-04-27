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
        choices: ['Web', 'API', 'Web+API'],
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
    ];
    return inquirer.prompt(questions);
  },
};
