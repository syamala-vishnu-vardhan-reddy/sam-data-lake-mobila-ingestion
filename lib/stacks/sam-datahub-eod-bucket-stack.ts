import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as glue from 'aws-cdk-lib/aws-glue';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3assets from 'aws-cdk-lib/aws-s3-assets';
import * as path from 'path';

declare const __dirname: string;

export class SamDatahubEodBucketStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // IAM Role for Glue Job
    const glueJobRole = new iam.Role(this, 'GlueJobRole', {
      assumedBy: new iam.ServicePrincipal('glue.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSGlueServiceRole'),
      ],
    });

    // S3 bucket for Glue temporary files
    const glueTempBucket = new s3.Bucket(this, 'GlueTempBucket', {
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        autoDeleteObjects: true,
    });
    glueTempBucket.grantReadWrite(glueJobRole);

    // Asset for the Glue job script
    const glueScriptAsset = new s3assets.Asset(this, 'GlueScriptAsset', {
      path: path.join(__dirname, '../../scripts/sam-datahub-li-pos-eod-transactions-glue-qut.py'),
    });

    // Grant the Glue job role access to the script asset bucket
    glueScriptAsset.bucket.grantRead(glueJobRole);

    // Glue Job definition (scriptLocation removed)
    new glue.CfnJob(this, 'SamDatahubLiPosEodTransactionsGlueQut', {
      name: 'sam-datahub-li-pos-eod-transactions-glue-qut',
      role: glueJobRole.roleArn,
      command: {
        name: 'glueetl',
        scriptLocation: `s3://${glueScriptAsset.s3BucketName}/${glueScriptAsset.s3ObjectKey}`,
        pythonVersion: '3',
      },
      glueVersion: '3.0',
      workerType: 'G.1X',
      numberOfWorkers: 2,
      executionProperty: {
        maxConcurrentRuns: 1,
      },
      defaultArguments: {
        '--job-language': 'python',
        '--TempDir': glueTempBucket.s3UrlForObject('temp/'),
      },
      description: 'Glue job for LI POS EOD transactions',
    });
  }
}
