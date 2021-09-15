import * as cdk from '@aws-cdk/core'
import { NodejsFunction, NodejsFunctionProps } from "@aws-cdk/aws-lambda-nodejs";
import { ClippyStack } from './clippy-stack';
import path = require('path');
import { Runtime } from '@aws-cdk/aws-lambda';

export interface ClippyLambdaProps extends Omit<NodejsFunctionProps, 'functionName'> {
    name: string
    fileName?: string
    environment?: {}
  }
  
class ClippyLambda extends NodejsFunction {
    constructor(scope: ClippyStack, id: string, props: ClippyLambdaProps) {

        const lambdaProps: NodejsFunctionProps = {
            functionName: props.name,
            entry: path.join(__dirname, '..', 'src', 'lambdas', `${props.fileName || props.name}.ts`),
            runtime: Runtime.NODEJS_14_X,
            environment: {
                ...props.environment,
            }
        }

        super(scope, id, lambdaProps)
    }
};

export { ClippyLambda };
