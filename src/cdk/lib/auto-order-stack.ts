
import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import { Construct } from 'constructs';

export class AutoOrderStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create the Lambda function
    const autoOrderFunction = new lambda.Function(this, 'AutoOrderFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda')),
      memorySize: 256,
      timeout: cdk.Duration.seconds(30),
      environment: {
        PERIODS: '12',
        SAMPLES: '30',
      },
    });

    // Create the API Gateway
    const api = new apigateway.RestApi(this, 'AutoOrderAPI', {
      restApiName: 'AutoOrderAPI',
      description: 'API for Auto Order Optimization',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
        allowCredentials: true,
      },
    });

    // Create the GetProductionScenarios resource and method
    const getProductionScenariosResource = api.root.addResource('GetProductionScenarios');
    getProductionScenariosResource.addMethod('POST', new apigateway.LambdaIntegration(autoOrderFunction));

    // Create the GetOrders resource and method
    const getOrdersResource = api.root.addResource('GetOrders');
    getOrdersResource.addMethod('POST', new apigateway.LambdaIntegration(autoOrderFunction));

    // Output the API URL
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'URL of the Auto Order API',
    });
  }
}
