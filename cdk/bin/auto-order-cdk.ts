
#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AutoOrderStack } from '../lib/auto-order-stack';

const app = new cdk.App();
new AutoOrderStack(app, 'AutoOrderStack', {
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: process.env.CDK_DEFAULT_REGION 
  },
});
