import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { APIGatewayProxyEventV2 } from 'aws-lambda'

const TABLE_NAME = process.env.TABLE_NAME!;

const handler = async (event: APIGatewayProxyEventV2 ) => {
    if (!event.pathParameters?.id) {
        return {
          statusCode: 400,
        }
      }

    const dynamoClient = new DocumentClient();

    const params: DocumentClient.GetItemInput = {
        TableName: TABLE_NAME,
        Key: {
            id: event.pathParameters.id
        }
    }

    const result = await dynamoClient.get(params).promise()

    if (!result.Item) {
        return {
            statusCode: 404,
            headers: {},
            body: JSON.stringify({
                message: `Not found media with id: ${event.pathParameters.id}`
            })
        }
    }

    return {
        statusCode: 200,
        headers: {},
        body: JSON.stringify(result.Item)
    }
}

export { handler };
