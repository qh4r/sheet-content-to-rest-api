const GoogleSpreadsheet = require('google-spreadsheet');
const {promisify} = require('util');
const fetch = require('node-fetch');

const credentials = require(`./service-credentials`);
const IO = require(`./in_out`);

(async () => {
  const container = new GoogleSpreadsheet(IO.spreadsheetId);
  await promisify(container.useServiceAccountAuth)(credentials);
  const info = await promisify(container.getInfo)();
  const sheet = info.worksheets[0];
  const rows = await promisify(sheet.getRows)({
    offset: 1,
    limit: 1000,
    orderby: 'key',
  });

  const nonEmptyRows = [];

  rows.some((row) => {
    if (!row.key && !row.pl && !row.en) {
      return true;
    }

    const {pl, key, en} = row;

    nonEmptyRows.push({
      key, pl, en
    });

    return false;
  });

  await delayedExecution(nonEmptyRows);
})();

const delayedExecution = async (rows) => {
  if (!rows.length) {
    return Promise.resolve();
  }
  const row = rows.pop();
  await fetchPost(row);
  await new Promise((res) => setTimeout(() => res(), (Math.random() * 100) + 100));

  return await delayedExecution(rows);
};

const fetchPost = (row) => {
  return fetch(IO.apiUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "word": row.key,
      "translations":
        {
          "pl": row.pl,
          "en": row.en,
        }
    })
  }).catch((e) => {
    console.error('ERROR', e);
  });
};