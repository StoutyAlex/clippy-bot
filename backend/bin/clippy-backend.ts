#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from '@aws-cdk/core'
import { ClippyStack } from '../lib/clippy-stack'

const app = new cdk.App()
const stage = app.node.tryGetContext('stage') || 'dev'

if (!stage || !['dev', 'prod'].includes(stage)) {
  console.error('-c stage={dev | prod} is required, defaulting to dev')
}

const appConfig = app.node.tryGetContext('stackProps')[stage]
const stackName = 'ClippyBackend'

new ClippyStack(app, stackName, appConfig)