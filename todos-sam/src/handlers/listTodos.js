const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async (event) => {
  const userId = event.requestContext.authorizer.lambda.username;

  const result = await dynamoDb
    .scan({
      TableName: process.env.TODOS_TABLE,
      FilterExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    })
    .promise();

  return { statusCode: 200, body: JSON.stringify(result.Items) };
};
