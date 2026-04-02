import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, GetCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME || 'DuanLinks';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': 'https://duan.bio',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
};

function response(statusCode, body) {
  return { statusCode, headers, body: JSON.stringify(body) };
}

async function getAggregateStats() {
  const result = await ddb.send(new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :pk',
    ExpressionAttributeValues: { ':pk': 'LINKS' },
    ScanIndexForward: false,
  }));

  const links = (result.Items || []).map(item => ({
    shortCode: item.shortCode,
    name: item.name,
    clicks: item.clicks || 0,
    createdAt: item.createdAt,
  }));

  const totalClicks = links.reduce((sum, l) => sum + l.clicks, 0);

  return response(200, {
    totalClicks,
    totalLinks: links.length,
    links,
  });
}

async function getLinkStats(shortCode) {
  // Get link metadata
  const meta = await ddb.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: { PK: `LINK#${shortCode}`, SK: 'META' },
  }));

  if (!meta.Item) return response(404, { error: 'Link not found' });

  // Get daily click records
  const clicksResult = await ddb.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `LINK#${shortCode}`,
      ':sk': 'CLICKS#',
    },
    ScanIndexForward: false,
  }));

  const dailyClicks = (clicksResult.Items || []).map(item => ({
    date: item.SK.replace('CLICKS#', ''),
    clicks: item.dailyClicks || 0,
  }));

  return response(200, {
    shortCode: meta.Item.shortCode,
    name: meta.Item.name,
    clicks: meta.Item.clicks || 0,
    dailyClicks,
  });
}

export async function handler(event) {
  const shortCode = event.pathParameters?.shortCode;

  try {
    if (shortCode) return await getLinkStats(shortCode);
    return await getAggregateStats();
  } catch (e) {
    console.error('Error:', e);
    return response(500, { error: 'Internal server error' });
  }
}
