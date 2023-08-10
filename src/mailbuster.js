const fs = require('fs');
const csv = require('csv-parser');
const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

const LOGFILE = `logs/log_${new Date().toISOString()}.txt`

// Адрес API Mailbluster для обновления подписки
const mailblusterApiUrl = 'https://api.mailbluster.com/api/leads/';

const config = {
  headers: {
    Authorization: process.env.MAILBLUSTER_AUTH_TOKEN,
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
  },
};

const data = {
  subscribed: false,
};


// Объект для хранения пользователей из каждого файла
const usersByEmail = {};

function calculateMD5(input) {
  return crypto.createHash('md5').update(input).digest('hex');
}

// Функция для чтения CSV файла и сохранения пользователей
function processCSV(filePath) {
  return new Promise((resolve, reject) => {
    const fileUsers = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', row => {
        if (row['Email Address']) {
          fileUsers.push(row['Email Address']);
        }
      })
      .on('end', () => {
        console.log(`Processed ${filePath}`);
        resolve(fileUsers);
      })
      .on('error', reject);
  });
}

// Основная функция для выполнения скрипта
exports.main = async function main(csvFolderPath) {
  const csvFiles = fs.readdirSync(csvFolderPath).filter(file => file.endsWith('.csv'));

  for (const file of csvFiles) {
    const filePath = `${csvFolderPath}/${file}`;
    usersByEmail[file] = await processCSV(filePath);
  }

  checkAndUnsubscribe();
}

// Функция для создания паузы
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


// Проверка и отписка общих пользователей
async function checkAndUnsubscribe() {
  const fileNames = Object.keys(usersByEmail);
  if (fileNames.length === 0) {
    console.log('No files processed.');
    return;
  }

  const commonEmails = fileNames.reduce((common, fileName) => {
    const fileUsers = usersByEmail[fileName];
    return common.filter(email => fileUsers.includes(email));
  }, usersByEmail[fileNames[0]]);

  if (commonEmails.length === 0) {
    console.log('No common emails found.');
    return;
  }

  const unsubscribedEmails = []

  // Отписка от рассылки для каждого общего email
  try {
    for (const email of commonEmails) {
      await unsubscribeFromMailing(email);
      unsubscribedEmails.push(email)
      await sleep(1000);
    }
  } finally {
    fs.writeFileSync(LOGFILE, unsubscribedEmails.join('\n'))
    console.log(`Log file saved:`, LOGFILE)
    console.log(`Unsubscribed: ${unsubscribedEmails.length}`)
  }
}

// Отправка запросов к API Mailbluster для отписки от рассылки
async function unsubscribeFromMailing(email) {
  const hashEmail = calculateMD5(email)
  const newUrl = mailblusterApiUrl + hashEmail

  try {
    const response = await axios.put(newUrl, data, config);
    console.log(`Unsubscribed ${email}: ${response.data.message}`);
  } catch (error) {
    console.error(`Error unsubscribing ${email}: ${error.message}`);
  }
}