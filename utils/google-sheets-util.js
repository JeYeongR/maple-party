const { google } = require('googleapis');
const path = require('path');

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

function numberToColumnLetter(num) {
  let letter = '';
  while (num > 0) {
    const remainder = (num - 1) % 26;
    letter = String.fromCharCode(65 + remainder) + letter;
    num = Math.floor((num - 1) / 26);
  }
  return letter;
}

async function getGoogleSheetClient() {
  const scopes = ['https://www.googleapis.com/auth/spreadsheets'];

  if (!process.env.GOOGLE_CREDENTIALS_JSON) {
    throw new Error('GOOGLE_CREDENTIALS_JSON 환경 변수를 설정해야 합니다.');
  }

  const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
  const authOptions = { credentials, scopes };

  const auth = new google.auth.GoogleAuth(authOptions);
  const client = await auth.getClient();
  return google.sheets({ version: 'v4', auth: client });
}

async function getRangeData(range) {
  try {
    const sheets = await getGoogleSheetClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range,
    });
    return response.data.values;
  } catch (err) {
    console.error(`Error reading sheet for range ${range}:`, err.message);
    return [];
  }
}

async function updateCell(range, value) {
  try {
    const sheets = await getGoogleSheetClient();
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[value]],
      },
    });
    console.log(`Successfully updated cell ${range} with value "${value}"`);
    return true;
  } catch (err) {
    console.error(`Error updating sheet for range ${range}:`, err.message);
    return false;
  }
}

async function getBossList(userName, week) {
  const startRow = 2;
  const endRow = 8;

  const nameColIndex = 1 + (week - 1) * 2;
  const checkboxColIndex = 2 + (week - 1) * 2;

  const nameCol = numberToColumnLetter(nameColIndex);
  const checkboxCol = numberToColumnLetter(checkboxColIndex);

  const range = `'${userName}'!${nameCol}${startRow}:${checkboxCol}${endRow}`;

  const data = await getRangeData(range);

  if (!data || data.length === 0) {
    return null;
  }

  const bossList = data
    .map((row, index) => {
      if (!row || !row[0]) {
        return null;
      }

      const bossName = row[0];
      const isCleared = row[1] === 'TRUE';
      const currentRow = startRow + index;

      return {
        name: bossName,
        cleared: isCleared,
        row: currentRow,
      };
    })
    .filter(Boolean);

  return bossList;
}

module.exports = { updateCell, getBossList, numberToColumnLetter, getRangeData };
