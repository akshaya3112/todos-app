const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async (event) => {
  const body = JSON.parse(event.body || '{}');
  const id = event.pathParameters.id;
  const userId = event.requestContext.authorizer.lambda.username;

  try {
    const result = await dynamoDb
      .update({
        TableName: process.env.TODOS_TABLE,
        Key: { id },
        UpdateExpression: 'set title = :title, completed = :completed',
        ConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':title': body.title,
          ':completed': body.completed,
          ':userId': userId,
        },
        ReturnValues: 'ALL_NEW',
      })
      .promise();

    return { statusCode: 200, body: JSON.stringify(result.Attributes) };
  } catch (err) {
    if (err.code === 'ConditionalCheckFailedException') {
      return { statusCode: 404, body: JSON.stringify({ error: 'Not found' }) };
    }
    console.error('Error during updateTodo:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) };
  }
};
