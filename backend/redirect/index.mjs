import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

// Lambda@Edge cannot use environment variables — hardcode values
const TABLE_NAME = 'DuanLinks';
const REGION = 'us-east-1';

const client = new DynamoDBClient({ region: REGION });
const ddb = DynamoDBDocumentClient.from(client);

// Paths that should always pass through to S3
const STATIC_PATHS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/favicon.ico',
];

const STATIC_PREFIXES = [
  '/images/',
  '/dashboard',
  '/api/',
];

function isStaticPath(uri) {
  if (STATIC_PATHS.includes(uri)) return true;
  return STATIC_PREFIXES.some(prefix => uri.startsWith(prefix));
}

export async function handler(event) {
  const request = event.Records[0].cf.request;
  const uri = request.uri;

  // Pass through static paths
  if (isStaticPath(uri)) return request;

  // Extract short code (strip leading slash)
  const shortCode = uri.slice(1);

  // Validate short code format — if invalid, serve bio page
  if (!shortCode || !/^[a-zA-Z0-9-]+$/.test(shortCode)) {
    request.uri = '/index.html';
    return request;
  }

  try {
    // Look up the short code in DynamoDB
    const result = await ddb.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: `LINK#${shortCode}`, SK: 'META' },
    }));

    if (!result.Item) {
      request.uri = '/index.html';
      return request;
    }

    // Increment total clicks and daily clicks atomically
    const today = new Date().toISOString().split('T')[0];

    // Increment total click count on META item
    await ddb.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: `LINK#${shortCode}`, SK: 'META' },
      UpdateExpression: 'ADD clicks :inc',
      ExpressionAttributeValues: { ':inc': 1 },
    }));

    // Increment daily click count
    await ddb.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: `LINK#${shortCode}`, SK: `CLICKS#${today}` },
      UpdateExpression: 'ADD dailyClicks :inc',
      ExpressionAttributeValues: { ':inc': 1 },
    }));

    // Return 301 redirect
    return {
      status: '301',
      statusDescription: 'Moved Permanently',
      headers: {
        location: [{ key: 'Location', value: result.Item.targetUrl }],
        'cache-control': [{ key: 'Cache-Control', value: 'max-age=60' }],
      },
    };
  } catch (e) {
    console.error('Redirect error:', e);
    // On error, pass through to S3 (fail open to bio page)
    return request;
  }
}
