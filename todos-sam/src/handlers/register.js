const AWS = require('aws-sdk');
const crypto = require('crypto');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async (event) => {
  const body = JSON.parse(event.body || '{}');
  const { username, password } = body;

  if (!username || !password) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'OPTIONS,POST'
      },
      body: JSON.stringify({ error: 'Username and password are required' }),
    };
  }

  try {
    // 1. Check if user already exists
    const existingUser = await dynamoDb
      .get({
        TableName: process.env.USERS_TABLE,
        Key: { username },
      })
      .promise();

    if (existingUser.Item) {
      return {
        statusCode: 409,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization',
          'Access-Control-Allow-Methods': 'OPTIONS,POST'
        },
        body: JSON.stringify({ error: 'Username already exists' }),
      };
    }

    // 2. Hash password securely using PBKDF2
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    const passwordHash = `${salt}:${hash}`;

    // 3. Store user in database
    await dynamoDb
      .put({
        TableName: process.env.USERS_TABLE,
        Item: {
          username,
          passwordHash,
          createdAt: new Date().toISOString(),
        },
      })
      .promise();

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'OPTIONS,POST'
      },
      body: JSON.stringify({ message: 'User registered successfully' }),
    };
  } catch (err) {
    console.error('Error during registration:', err);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'OPTIONS,POST'
      },
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};
