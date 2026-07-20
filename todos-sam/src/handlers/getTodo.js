const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async (event) => {
  const userId = event.requestContext.authorizer.lambda.username;

  const result = await dynamoDb
    .get({ TableName: process.env.TODOS_TABLE, Key: { id: event.pathParameters.id } })
    .promise();

  if (!result.Item || result.Item.userId !== userId) {
    return { statusCode: 404, body: JSON.stringify({ error: 'Not found' }) };
  }

  return { statusCode: 200, body: JSON.stringify(result.Item) };
};
