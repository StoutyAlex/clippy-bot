import * as cdk from '@aws-cdk/core'
import * as lambda from '@aws-cdk/aws-lambda'
import * as apigateway from '@aws-cdk/aws-apigateway'
import * as dynamodb from '@aws-cdk/aws-dynamodb'
import { getApiGateway } from './api-gateway';
import { buildName } from './build-name';
import { FunctionProps } from '@aws-cdk/aws-lambda';

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

    const table = new dynamodb.Table(this, 'partnersInformationTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      tableName: buildName('clippy-media-table', props.stage),
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    })

    const getLambdaProps = (name: string, environment = {}): Omit<FunctionProps, 'handler'> => ({
      functionName: buildName(name, props.stage),
      runtime: lambda.Runtime.NODEJS_14_X,    // execution environment
      code: lambda.Code.fromAsset(path.join(__dirname, '..', 'dist')),
      environment: {
        ...environment,
        TABLE_NAME: table.tableName
      }
    })

    const addMedia = new lambda.Function(this, 'ClippyAddMedia', {
      ...getLambdaProps('add-media'),
      handler: 'add-media.handler',
    })

    const deleteMedia = new lambda.Function(this, 'ClippyDeleteMedia', {
      ...getLambdaProps('delete-media'),
      handler: 'delete-media.handler',
    })

    const updateMedia = new lambda.Function(this, 'ClippyUpdateMedia', {
      ...getLambdaProps('update-media'),
      handler: 'update-media.handler',
    })

    const getMedia = new lambda.Function(this, 'ClippyGetMedia', {
      ...getLambdaProps('get-media'),
      handler: 'get-media.handler',
    })

    const getMediaItem = new lambda.Function(this, 'ClippyGetMediaItem', {
      ...getLambdaProps('get-media-item'),
      handler: 'get-media-item.handler',
    })

    table.grantReadData(getMedia)
    table.grantReadData(getMediaItem)
    table.grantReadWriteData(deleteMedia)
    table.grantReadWriteData(addMedia)
    table.grantReadWriteData(updateMedia)

    const api = getApiGateway(this, props);

    const versionedRoot = api.root.addResource('v1')
    const mediaRoute = versionedRoot.addResource('media')
    const mediaItem = mediaRoute.addResource('{id}')

    const addMediaIntegration = new apigateway.LambdaIntegration(addMedia, { requestTemplates })
    const updateMediaIntegration = new apigateway.LambdaIntegration(updateMedia, { requestTemplates })
    const deleteMediaIntegration = new apigateway.LambdaIntegration(deleteMedia, { requestTemplates })
    const getMediaIntegration = new apigateway.LambdaIntegration(getMedia, { requestTemplates })
    const getMediaItemIntegration = new apigateway.LambdaIntegration(getMediaItem, { requestTemplates });

    // /v1/media
    mediaRoute.addMethod('POST', addMediaIntegration, { apiKeyRequired: true })
    mediaRoute.addMethod('PUT', updateMediaIntegration, { apiKeyRequired: true })
    mediaRoute.addMethod('DELETE', deleteMediaIntegration, { apiKeyRequired: true })
    mediaRoute.addMethod('GET', getMediaIntegration, { apiKeyRequired: true })

    // /v1/media/{item}
    mediaItem.addMethod('GET', getMediaItemIntegration,  { apiKeyRequired: true })
  }
}
