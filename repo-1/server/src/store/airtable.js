const API = 'https://api.airtable.com/v0';
const PAGE_SIZE = 100;

const token = process.env.AIRTABLE_TOKEN;
const baseId = process.env.AIRTABLE_BASE_ID;
const tableName = process.env.AIRTABLE_TABLE || 'Production Logs';

const tableUrl = `${API}/${baseId}/${encodeURIComponent(tableName)}`;

async function call(url, init = {}) {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message = body?.error?.message ?? body?.error?.type ?? response.statusText;
    throw new Error(`Airtable ${response.status}: ${message}`);
  }
  return body;
}

const toLog = ({ id, createdTime, fields }) => ({
  id,
  machineId: fields['Machine'],
  shiftDate: fields['Shift Date'],
  productName: fields['Product Name'] ?? '',
  workMinutes: fields['Work Minutes'] ?? 0,
  workersCount: fields['Workers Count'] ?? 0,
  producedQty: fields['Produced Qty'] ?? 0,
  wasteKg: fields['Waste Kg'] ?? 0,
  status: fields['Status'],
  updatedAt: fields['Updated At'] ?? createdTime,
});

const toFields = (value) => ({
  Log: `${value.machineId} ${value.shiftDate}`,
  Machine: value.machineId,
  'Shift Date': value.shiftDate,
  'Product Name': value.productName,
  'Work Minutes': value.workMinutes,
  'Workers Count': value.workersCount,
  'Produced Qty': value.producedQty,
  'Waste Kg': value.wasteKg,
  Status: value.status,
  'Updated At': new Date().toISOString(),
});

const quote = (value) => `'${String(value).replace(/'/g, "\'")}'`;

export async function listLogs({ machineId, from, to, limit = 500 } = {}) {
  const conditions = [];
  if (machineId) conditions.push(`{Machine}=${quote(machineId)}`);
  if (from) conditions.push(`NOT(IS_BEFORE({Shift Date},${quote(from)}))`);
  if (to) conditions.push(`NOT(IS_AFTER({Shift Date},${quote(to)}))`);

  const logs = [];
  let offset;
  do {
    const params = new URLSearchParams({ pageSize: String(PAGE_SIZE) });
    if (conditions.length) params.set('filterByFormula', `AND(${conditions.join(',')})`);
    params.set('sort[0][field]', 'Shift Date');
    params.set('sort[0][direction]', 'desc');
    if (offset) params.set('offset', offset);

    const page = await call(`${tableUrl}?${params}`);
    logs.push(...page.records.map(toLog));
    offset = page.offset;
  } while (offset && logs.length < limit);

  return logs.slice(0, limit);
}

export async function getLog(id) {
  try {
    return toLog(await call(`${tableUrl}/${encodeURIComponent(id)}`));
  } catch (error) {
    if (/Airtable (404|422)/.test(error.message)) return null;
    throw error;
  }
}

export async function createLog(value) {
  const record = await call(tableUrl, {
    method: 'POST',
    body: JSON.stringify({ fields: toFields(value) }),
  });
  return toLog(record);
}

export async function updateLog(id, value) {
  const record = await call(`${tableUrl}/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ fields: toFields(value) }),
  });
  return toLog(record);
}
