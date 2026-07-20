const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async (event) => {
  const id = event.pathParameters.id;
  const userId = event.requestContext.authorizer.lambda.username;

  try {
    await dynamoDb
      .delete({
        TableName: process.env.TODOS_TABLE,
        Key: { id },
        ConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId,
        },
      })
      .promise();

    return { statusCode: 204, body: '' };
  } catch (err) {
    if (err.code === 'ConditionalCheckFailedException') {
      return { statusCode: 404, body: JSON.stringify({ error: 'Not found' }) };
    }
    console.error('Error during deleteTodo:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) };
  }
};
