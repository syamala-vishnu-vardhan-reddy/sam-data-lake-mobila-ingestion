#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { SamDatahubEodBucketStack } from '../lib/stacks/sam-datahub-eod-bucket-stack';

const app = new cdk.App();
new SamDatahubEodBucketStack(app, 'SamDatahubEodBucketStack');
