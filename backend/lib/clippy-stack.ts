import * as cdk from '@aws-cdk/core'
import * as apigateway from '@aws-cdk/aws-apigateway'
import * as dynamodb from '@aws-cdk/aws-dynamodb'
import * as events from '@aws-cdk/aws-events';

import { getApiGateway } from './api-gateway';
import { buildName } from './build-name';
import { LambdaFunction as LambdaFunctionTarget } from '@aws-cdk/aws-events-targets'
import { ClippyLambda } from './lambda';

export interface ClippyApiStackProps extends cdk.StackProps {
  stage: 'prod' | 'dev' | 'test'
}

const requestTemplates: { [contentType: string]: string } = {
  "application/json": '{ "statusCode": "200" }'
}

export class ClippyStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: ClippyApiStackProps) {
    super(scope, id, props)

    const mediaTable = new dynamodb.Table(this, 'ClippyMediaTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      tableName: buildName('media-table', props.stage),
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    })

    const guildTable = new dynamodb.Table(this, 'ClippyGuildTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      tableName: buildName('guild-table', props.stage),
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    })
    
    const bus = new events.EventBus(this, buildName('EventBus', props.stage), { eventBusName: buildName('EventBus', props.stage) })

    const environment = {
      MEDIA_TABLE_NAME: mediaTable.tableName,
      GUILD_TABLE_NAME: guildTable.tableName,
      EVENT_BUS_NAME: bus.eventBusName,
    }

    const addMedia = new ClippyLambda(this, 'ClippyAddMedia', { name: 'add-media', environment })
    const deleteMedia = new ClippyLambda(this, 'ClippyDeleteMedia', { name: 'delete-media', environment })
    const updateMedia = new ClippyLambda(this, 'ClippyUpdateMedia', { name: 'update-media', environment })
    const getMedia = new ClippyLambda(this, 'ClippyGetMedia', { name: 'get-media', environment })
    const getMediaItem = new ClippyLambda(this, 'ClippyGetMediaItem', { name: 'get-media-item', environment })
    const guildHandler = new ClippyLambda(this, 'ClippyGuildHandler', { name: 'guild-handler', environment })
    const messageHandler = new ClippyLambda(this, 'ClippyMessageHandler', { name: 'message-handler', environment })

    new events.Rule(this, buildName('GuildEvents-rule', props.stage), {
      enabled: true,
      eventBus: bus,
      eventPattern: {
        source: ['Guilds'],
        detailType: ['GuildDeleted']
      },
      targets: [
        new LambdaFunctionTarget(deleteMedia)
      ]
    });

    new events.Rule(this, buildName('MessageEvents-rule', props.stage), {
      enabled: true,
      eventBus: bus,
      eventPattern: {
        source: ['DiscordBot'],
        detailType: ['MessageReceived']
      },
      targets: [
        new LambdaFunctionTarget(messageHandler)
      ]
    });

    mediaTable.grantReadData(getMedia)
    mediaTable.grantReadData(getMediaItem)
    mediaTable.grantReadWriteData(deleteMedia)
    mediaTable.grantReadWriteData(addMedia)
    mediaTable.grantReadWriteData(updateMedia)
    guildTable.grantReadWriteData(guildHandler)
    bus.grantPutEventsTo(guildHandler)

    const api = getApiGateway(this, props);

    const versionedRoot = api.root.addResource('v1')

    const addMediaIntegration = new apigateway.LambdaIntegration(addMedia, { requestTemplates })
    const updateMediaIntegration = new apigateway.LambdaIntegration(updateMedia, { requestTemplates })
    const deleteMediaIntegration = new apigateway.LambdaIntegration(deleteMedia, { requestTemplates })
    const getMediaIntegration = new apigateway.LambdaIntegration(getMedia, { requestTemplates })
    const getMediaItemIntegration = new apigateway.LambdaIntegration(getMediaItem, { requestTemplates });

    const guildHandlerIntegration = new apigateway.LambdaIntegration(guildHandler, { requestTemplates });


    // /v1/media
    const mediaRoute = versionedRoot.addResource('media')

    mediaRoute.addMethod('POST', addMediaIntegration, { apiKeyRequired: true })
    mediaRoute.addMethod('PUT', updateMediaIntegration, { apiKeyRequired: true })
    mediaRoute.addMethod('DELETE', deleteMediaIntegration, { apiKeyRequired: true })
    mediaRoute.addMethod('GET', getMediaIntegration, { apiKeyRequired: true })

    // /v1/media/{item}
    const mediaItem = mediaRoute.addResource('{id}')

    mediaItem.addMethod('GET', getMediaItemIntegration,  { apiKeyRequired: true })

    // /v1/guild
    const guildRoute = versionedRoot.addResource('guild')

    guildRoute.addMethod('POST', guildHandlerIntegration, { apiKeyRequired: true })
    guildRoute.addMethod('DELETE', guildHandlerIntegration, { apiKeyRequired: true })
  }
}
