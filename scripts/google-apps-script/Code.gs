const SHEET_ID = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
const API_TOKEN = PropertiesService.getScriptProperties().getProperty('API_TOKEN');

function doGet(e) {
  return handleRequest(e, 'GET');
}

function doPost(e) {
  return handleRequest(e, 'POST');
}

function handleRequest(e, method) {
  try {
    const token = (e.parameter && e.parameter.token) || '';
    if (!SHEET_ID || !API_TOKEN) {
      return json({ ok: false, error: 'Missing Apps Script SHEET_ID or API_TOKEN property' });
    }
    if (token !== API_TOKEN) {
      return json({ ok: false, error: 'Unauthorized' });
    }

    const action = e.parameter.action;
    const table = e.parameter.table;
    if (!table) return json({ ok: false, error: 'Missing table' });

    if (action === 'list') {
      return json({ ok: true, rows: listRows(table) });
    }

    if (action === 'get') {
      return json({ ok: true, row: getRow(table, e.parameter.id) });
    }

    if (action === 'append' && method === 'POST') {
      const body = JSON.parse((e.postData && e.postData.contents) || '{}');
      return json({ ok: true, row: appendRow(table, body) });
    }

    if (action === 'upsert' && method === 'POST') {
      const body = JSON.parse((e.postData && e.postData.contents) || '{}');
      return json({ ok: true, row: upsertRow(table, body) });
    }

    return json({ ok: false, error: 'Unknown action' });
  } catch (err) {
    return json({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function getSheet(table) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(table);
  if (!sheet) throw new Error(`Missing sheet: ${table}`);
  return sheet;
}

function getHeaders(sheet) {
  const lastCol = Math.max(sheet.getLastColumn(), 1);
  return sheet.getRange(1, 1, 1, lastCol).getValues()[0].filter(Boolean);
}

function ensureHeaders(sheet, keys) {
  let headers = getHeaders(sheet);
  if (!headers.length) {
    headers = ['id'].concat(keys.filter((key) => key !== 'id'));
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    return headers;
  }

  const missing = keys.filter((key) => headers.indexOf(key) === -1);
  if (missing.length) {
    headers = headers.concat(missing);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  return headers;
}

function listRows(table) {
  const sheet = getSheet(table);
  const headers = getHeaders(sheet);
  if (!headers.length || sheet.getLastRow() < 2) return [];
  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).getValues();
  return values.map((row) => rowToObject(headers, row));
}

function getRow(table, id) {
  return listRows(table).find((row) => String(row.id) === String(id)) || null;
}

function appendRow(table, row) {
  const sheet = getSheet(table);
  const now = new Date().toISOString();
  const normalized = Object.assign({
    id: row.id || Utilities.getUuid(),
    createdAt: row.createdAt || now,
    updatedAt: row.updatedAt || now,
  }, row);
  const headers = ensureHeaders(sheet, Object.keys(normalized));
  sheet.appendRow(headers.map((header) => serialize(normalized[header])));
  return normalized;
}

function upsertRow(table, row) {
  const sheet = getSheet(table);
  const headers = ensureHeaders(sheet, Object.keys(row).concat(['id', 'createdAt', 'updatedAt']));
  const id = row.id || Utilities.getUuid();
  const now = new Date().toISOString();
  const normalized = Object.assign({
    id,
    createdAt: row.createdAt || now,
    updatedAt: now,
  }, row);

  const idColumn = headers.indexOf('id') + 1;
  const lastRow = sheet.getLastRow();
  let targetRow = 0;
  if (idColumn > 0 && lastRow >= 2) {
    const ids = sheet.getRange(2, idColumn, lastRow - 1, 1).getValues();
    for (let i = 0; i < ids.length; i++) {
      if (String(ids[i][0]) === String(id)) {
        targetRow = i + 2;
        break;
      }
    }
  }

  const values = headers.map((header) => serialize(normalized[header]));
  if (targetRow) {
    sheet.getRange(targetRow, 1, 1, headers.length).setValues([values]);
  } else {
    sheet.appendRow(values);
  }
  return normalized;
}

function rowToObject(headers, row) {
  const obj = {};
  headers.forEach((header, index) => {
    obj[header] = deserialize(row[index]);
  });
  return obj;
}

function serialize(value) {
  if (value === undefined || value === null) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return value;
}

function deserialize(value) {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed) return '';
  if ((trimmed[0] === '{' && trimmed[trimmed.length - 1] === '}') || (trimmed[0] === '[' && trimmed[trimmed.length - 1] === ']')) {
    try {
      return JSON.parse(trimmed);
    } catch (err) {
      return value;
    }
  }
  return value;
}

function json(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
