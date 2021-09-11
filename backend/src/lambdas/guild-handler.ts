import { EventBridge } from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { v4 as uuidv4 } from 'uuid'

const GUILD_TABLE_NAME = process.env.GUILD_TABLE_NAME!;
const EVENT_BUS_NAME = process.env.EVENT_BUS_NAME!;

const publishEvent = async (guild: any) => {
    const eventBus = new EventBridge()

    const entry = {
        EventBusName: EVENT_BUS_NAME,
        Source: 'Guilds',
        DetailType: 'GuildDeleted',
        Detail: JSON.stringify({
            test: 'data from delete event',
            guild
        })
    }

    const result = await eventBus.putEvents({ Entries: [entry] }).promise()

    if (result.FailedEntryCount !== 0) {
        console.error('Failed to publish to EventBridge', { entries: result.Entries })
        throw new Error('Failed to publish to EventBridge')
    }
}

const handler = async () => {
    const dynamoClient = new DocumentClient()

    const guildItem = {
        id: uuidv4(),
        created: new Date().toISOString()
    };

    try {
        await dynamoClient.put({
            TableName: GUILD_TABLE_NAME,
            Item: guildItem
        }).promise()

        await publishEvent(guildItem);
    } catch (error) {
        console.error('Error adding media', error);
        return {
            statusCode: 500,
            headers: {},
            body: JSON.stringify({
                message: 'Could not add guild item',
                media: guildItem,
            })
        }
    }

    return {
        statusCode: 202,
        headers: {},
        body: JSON.stringify(guildItem)
    }
}

export { handler };
