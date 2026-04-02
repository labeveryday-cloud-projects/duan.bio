#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { DuanLinksStack } from '../lib/duan-links-stack';
import { DuanLinksHostingStack } from '../lib/duan-links-hosting-stack';

const app = new cdk.App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: 'us-east-1',
};

const linksStack = new DuanLinksStack(app, 'DuanLinksStack', { env });
const hostingStack = new DuanLinksHostingStack(app, 'DuanLinksHostingStack', {
  env,
  table: linksStack.table,
  apiGateway: linksStack.apiGateway,
  useCustomDomain: true,
});

hostingStack.addDependency(linksStack);

// Tag all resources
for (const stack of [linksStack, hostingStack]) {
  cdk.Tags.of(stack).add('Project', 'duan-link-shortener');
  cdk.Tags.of(stack).add('Environment', 'production');
  cdk.Tags.of(stack).add('Owner', 'duanlightfoot');
  cdk.Tags.of(stack).add('ManagedBy', 'cdk');
}
