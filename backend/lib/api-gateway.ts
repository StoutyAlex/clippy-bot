import * as apigateway from '@aws-cdk/aws-apigateway'
import * as secretmanager from '@aws-cdk/aws-secretsmanager'
import * as cdk from '@aws-cdk/core'
import { ApiKeySourceType, Cors } from '@aws-cdk/aws-apigateway';
import { ClippyApiStackProps } from './clippy-stack';
import { buildName } from './build-name';

const getApiGateway = (stack: cdk.Stack, props: ClippyApiStackProps): apigateway.RestApi => {

    const secret = secretmanager.Secret.fromSecretNameV2(stack, 'clippy-api-key', 'ClippyApiKey-dev');

    const api = new apigateway.RestApi(stack, buildName('clippy-api', props.stage), {
        restApiName: 'Clippy API',
        apiKeySourceType: ApiKeySourceType.HEADER,
        defaultCorsPreflightOptions: {
          allowOrigins: Cors.ALL_ORIGINS,
          allowHeaders: [
            'Content-Type',
            'X-Amz-Date',
            'Authorization',
            'X-Api-Key',
          ],
          allowMethods: ['POST'],
          allowCredentials: true,
        },
        deployOptions: {
          metricsEnabled: true,
          loggingLevel: apigateway.MethodLoggingLevel.ERROR
        },      
    })

    const apiKey = api.addApiKey('ApiKey', {
    value: secret.secretValue.toString(),
    apiKeyName: buildName('clippy-api-key', props.stage)
    })

    const usagePlan: apigateway.UsagePlanProps = {
    name: 'ClippyApiUsagePlan',
    apiStages: [{ api, stage: api.deploymentStage }],
    apiKey,
    }

    api.addUsagePlan('ClippyApiUsagePlan', usagePlan)

    return api;
};

export { getApiGateway };
