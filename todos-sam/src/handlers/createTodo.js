const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async (event) => {
  const body = JSON.parse(event.body || '{}');

  if (!body.title) {
    return { statusCode: 400, body: JSON.stringify({ error: 'title is required' }) };
  }

  const userId = event.requestContext.authorizer.lambda.username;

  const todo = {
    id: uuidv4(),
    title: body.title,
    completed: false,
    userId: userId,
    createdAt: new Date().toISOString(),
  };

  await dynamoDb.put({ TableName: process.env.TODOS_TABLE, Item: todo }).promise();

  return { statusCode: 201, body: JSON.stringify(todo) };
};
