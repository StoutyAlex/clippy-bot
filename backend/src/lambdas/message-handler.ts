import { EventBridgeHandler } from "aws-lambda";
import { MessageEvent, MessageEventDetail } from 'clippy-common';

type MessageEventHandler = EventBridgeHandler<MessageEvent['DetailType'], MessageEventDetail, any>

const handler: MessageEventHandler = (event) => {
    console.log('Received Message', event.detail.message);
}

export { handler };
