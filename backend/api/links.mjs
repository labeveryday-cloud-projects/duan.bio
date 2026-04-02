import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, DeleteCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME || 'DuanLinks';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': 'https://duan.bio',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
};

function response(statusCode, body) {
  return { statusCode, headers, body: JSON.stringify(body) };
}

function validateShortCode(shortCode) {
  if (!shortCode || typeof shortCode !== 'string') return 'shortCode is required';
  if (shortCode.length > 100) return 'shortCode must be 100 characters or less';
  if (!/^[a-zA-Z0-9-]+$/.test(shortCode)) return 'shortCode must be alphanumeric with hyphens only';
  return null;
}

function validateTargetUrl(url) {
  if (!url || typeof url !== 'string') return 'targetUrl is required';
  if (!url.startsWith('https://')) return 'targetUrl must start with https://';
  try { new URL(url); } catch { return 'targetUrl must be a valid URL'; }
  return null;
}

function validateName(name) {
  if (!name || typeof name !== 'string' || name.trim().length === 0) return 'name is required';
  if (name.length > 200) return 'name must be 200 characters or less';
  return null;
}

async function listLinks() {
  const result = await ddb.send(new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :pk',
    ExpressionAttributeValues: { ':pk': 'LINKS' },
    ScanIndexForward: false,
  }));

  return response(200, (result.Items || []).map(item => ({
    shortCode: item.shortCode,
    name: item.name,
    targetUrl: item.targetUrl,
    clicks: item.clicks || 0,
    createdAt: item.createdAt,
  })));
}

async function createLink(body, owner) {
  const { shortCode, name, targetUrl } = body;

  let err;
  if ((err = validateShortCode(shortCode))) return response(400, { error: err });
  if ((err = validateName(name))) return response(400, { error: err });
  if ((err = validateTargetUrl(targetUrl))) return response(400, { error: err });

  const now = new Date().toISOString();
  const item = {
    PK: `LINK#${shortCode}`,
    SK: 'META',
    shortCode,
    name: name.trim(),
    targetUrl,
    clicks: 0,
    createdAt: now,
    owner,
    GSI1PK: 'LINKS',
    GSI1SK: now,
  };

  try {
    await ddb.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
      ConditionExpression: 'attribute_not_exists(PK)',
    }));
  } catch (e) {
    if (e.name === 'ConditionalCheckFailedException') {
      return response(400, { error: `Short code "${shortCode}" already exists` });
    }
    throw e;
  }

  return response(201, {
    shortCode, name: name.trim(), targetUrl, clicks: 0, createdAt: now,
  });
}

async function updateLink(shortCode, body) {
  const updates = [];
  const names = {};
  const values = {};

  if (body.name !== undefined) {
    const err = validateName(body.name);
    if (err) return response(400, { error: err });
    updates.push('#n = :name');
    names['#n'] = 'name';
    values[':name'] = body.name.trim();
  }

  if (body.targetUrl !== undefined) {
    const err = validateTargetUrl(body.targetUrl);
    if (err) return response(400, { error: err });
    updates.push('targetUrl = :url');
    values[':url'] = body.targetUrl;
  }

  if (updates.length === 0) return response(400, { error: 'No valid fields to update' });

  try {
    const result = await ddb.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: `LINK#${shortCode}`, SK: 'META' },
      UpdateExpression: `SET ${updates.join(', ')}`,
      ExpressionAttributeNames: Object.keys(names).length ? names : undefined,
      ExpressionAttributeValues: values,
      ConditionExpression: 'attribute_exists(PK)',
      ReturnValues: 'ALL_NEW',
    }));

    const item = result.Attributes;
    return response(200, {
      shortCode: item.shortCode, name: item.name, targetUrl: item.targetUrl,
      clicks: item.clicks || 0, createdAt: item.createdAt,
    });
  } catch (e) {
    if (e.name === 'ConditionalCheckFailedException') {
      return response(404, { error: 'Link not found' });
    }
    throw e;
  }
}

async function deleteLink(shortCode) {
  // Delete META item
  try {
    await ddb.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { PK: `LINK#${shortCode}`, SK: 'META' },
      ConditionExpression: 'attribute_exists(PK)',
    }));
  } catch (e) {
    if (e.name === 'ConditionalCheckFailedException') {
      return response(404, { error: 'Link not found' });
    }
    throw e;
  }

  // Delete click history items
  const clickItems = await ddb.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: { ':pk': `LINK#${shortCode}`, ':sk': 'CLICKS#' },
  }));

  if (clickItems.Items && clickItems.Items.length > 0) {
    for (const item of clickItems.Items) {
      await ddb.send(new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { PK: item.PK, SK: item.SK },
      }));
    }
  }

  return response(200, { deleted: true });
}

export async function handler(event) {
  const method = event.httpMethod;
  const shortCode = event.pathParameters?.shortCode;
  const owner = event.requestContext?.authorizer?.claims?.email || 'unknown';

  try {
    if (method === 'GET' && !shortCode) return await listLinks();
    if (method === 'POST' && !shortCode) return await createLink(JSON.parse(event.body || '{}'), owner);
    if (method === 'PUT' && shortCode) return await updateLink(shortCode, JSON.parse(event.body || '{}'));
    if (method === 'DELETE' && shortCode) return await deleteLink(shortCode);

    return response(400, { error: 'Invalid request' });
  } catch (e) {
    console.error('Error:', e);
    return response(500, { error: 'Internal server error' });
  }
}
