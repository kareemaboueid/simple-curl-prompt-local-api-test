#!/usr/bin/env node

'use strict';

// TODO: handle errors.

import * as fs from 'fs';
import cp from 'child_process';
import inquirer from 'inquirer';
const CURR_DIR = process.cwd();

const localApiTestSavedAnswersData = `${CURR_DIR}/local-api-test-Saved-Answers.json`;

const readSavedAnswersData = fs.existsSync(localApiTestSavedAnswersData)
  ? fs.readFileSync(localApiTestSavedAnswersData, 'utf8')
  : null;

// command runner:
const run = (command, std1, std2, std3) => {
  try {
    cp.execSync(command, { stdio: [std1, std2, std3] });
  } catch (e) {
    console.log(e.message);
    return false;
  }
  return true;
};

// get the template name and description:
const QUESTIONS = [
  {
    name: 'local-port',
    type: 'input',
    message: 'local port:',
    default: fs.existsSync(localApiTestSavedAnswersData)
      ? JSON.parse(readSavedAnswersData).savedLocalPort
      : null,
  },
  {
    name: 'local-api',
    type: 'input',
    message: 'local api:',
    default: fs.existsSync(localApiTestSavedAnswersData)
      ? JSON.parse(readSavedAnswersData).savedLocalApi
      : null,
  },
  {
    type: 'list',
    name: 'http-method',
    message: 'http method:',
    default: fs.existsSync(localApiTestSavedAnswersData)
      ? JSON.parse(readSavedAnswersData).savedLttpMethod
      : null,
    choices: ['POST', 'PUT', 'GET', 'CONNECT', 'TRACE', 'PATCH'],
  },
];

// Create a new project:
inquirer.prompt(QUESTIONS).then((answers) => {
  const localPort = answers['local-port'];
  const localApi = answers['local-api'];
  const httpMethod = answers['http-method'];

  const rawApiTestData = {
    savedLocalPort: localPort,
    savedLocalApi: localApi,
    savedLttpMethod: httpMethod,
  };

  const COMMANDS = {
    curlCommand: `curl -i -X ${httpMethod} "http://localhost:${localPort}/${localApi}`,
  };

  // 1. log inital message:
  console.log();
  run(COMMANDS.curlCommand, 'inherit', 'inherit', 'inherit');
  fs.writeFile(
    localApiTestSavedAnswersData,
    JSON.stringify(rawApiTestData),
    (err) => {
      if (err) {
        console.error(err);
      }
      // file written successfully
    },
  );
  console.log();
  console.log();
  console.log('END OF TEST');
});
