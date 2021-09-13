import * as cdk from '@aws-cdk/core'
import * as lambda from '@aws-cdk/aws-lambda'
import * as apigateway from '@aws-cdk/aws-apigateway'
import * as dynamodb from '@aws-cdk/aws-dynamodb'
import * as targets from '@aws-cdk/aws-events-targets';
import * as events from '@aws-cdk/aws-events';

import { getApiGateway } from './api-gateway';
import { buildName } from './build-name';
import { FunctionProps } from '@aws-cdk/aws-lambda';
import { LambdaFunction as LambdaFunctionTarget } from '@aws-cdk/aws-events-targets'

const path = require('path');

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
    
    const bus = new events.EventBus(this, buildName('ClippyEventBus', props.stage))

    const getLambdaProps = (name: string, environment = {}): Omit<FunctionProps, 'handler' | 'code'> => ({
      functionName: buildName(name, props.stage),
      runtime: lambda.Runtime.NODEJS_14_X,    // execution environment
      environment: {
        ...environment,
        MEDIA_TABLE_NAME: mediaTable.tableName,
        GUILD_TABLE_NAME: guildTable.tableName,
        EVENT_BUS_NAME: bus.eventBusName,
      }
    })


    //new cdk.CfnOutput(this, buildName('ClippyEventBus', props.stage), {value: bus.eventBusName})

    const addMedia = new lambda.Function(this, 'ClippyAddMedia', {
      ...getLambdaProps('add-media'),
      code: lambda.Code.fromAsset(path.join(__dirname, '..', 'dist', 'add-media')),
      handler: 'handler.handler',
    })

    const deleteMedia = new lambda.Function(this, 'ClippyDeleteMedia', {
      ...getLambdaProps('delete-media'),
      code: lambda.Code.fromAsset(path.join(__dirname, '..', 'dist', 'delete-media')),
      handler: 'handler.handler',
    })

    const updateMedia = new lambda.Function(this, 'ClippyUpdateMedia', {
      ...getLambdaProps('update-media'),
      code: lambda.Code.fromAsset(path.join(__dirname, '..', 'dist', 'update-media')),
      handler: 'handler.handler',
    })

    const getMedia = new lambda.Function(this, 'ClippyGetMedia', {
      ...getLambdaProps('get-media'),
      code: lambda.Code.fromAsset(path.join(__dirname, '..', 'dist', 'get-media')),
      handler: 'handler.handler',
    })

    const getMediaItem = new lambda.Function(this, 'ClippyGetMediaItem', {
      ...getLambdaProps('get-media-item'),
      code: lambda.Code.fromAsset(path.join(__dirname, '..', 'dist', 'get-media-item')),
      handler: 'handler.handler',
    })

    const guildHandler = new lambda.Function(this, 'ClippyGuildHandler', {
      ...getLambdaProps('guild-handler'),
      code: lambda.Code.fromAsset(path.join(__dirname, '..', 'dist', 'guild-handler')),
      handler: 'handler.handler',
    })

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
