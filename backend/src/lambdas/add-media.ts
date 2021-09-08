import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { v4 as uuidv4 } from 'uuid'

const TABLE_NAME = process.env.TABLE_NAME!;

const handler = async () => {
    const dynamoClient = new DocumentClient()

    const mediaItem = {
        id: uuidv4(),
        created: new Date().toISOString()
    };

    try {
        await dynamoClient.put({
            TableName: TABLE_NAME,
            Item: mediaItem
        }).promise()
    } catch (error) {
        console.error('Error adding media', error);
        return {
            statusCode: 500,
            headers: {},
            body: JSON.stringify({
                message: 'Could not add media item',
                media: mediaItem,
            })
        }
    }

    return {
        statusCode: 202,
        headers: {},
        body: JSON.stringify(mediaItem)
    }
}

export { handler };
