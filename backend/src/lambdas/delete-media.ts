
import { EventBridgeEvent } from 'aws-lambda';
import { APIGatewayProxyEventV2 } from 'aws-lambda'

const handler = async (event: EventBridgeEvent<string, unknown> | APIGatewayProxyEventV2) => {

    const isEvent = 'source' in event;

    if (isEvent) {
        const eventEvent = event as EventBridgeEvent<string, unknown>;
        console.log('Received event', eventEvent);
        return;
    }

    const apiEvent = event as APIGatewayProxyEventV2;
    console.log('Received API Call', apiEvent);

    return {
        statusCode: 200,
        headers: {},
        body: JSON.stringify({
            hello: 'API CALL',
            method: 'DELETE',
        })
    }
}

export { handler };
