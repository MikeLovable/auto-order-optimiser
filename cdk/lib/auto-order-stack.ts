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

    // Create the API Gateway with proper CORS configuration
    const api = new apigateway.RestApi(this, 'AutoOrderAPI', {
      restApiName: 'AutoOrderAPI',
      description: 'API for Auto Order Optimization',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token'],
        allowCredentials: true,
      },
    });

    // Create the GetProductionScenarios resource and method - switched to GET
    const getProductionScenariosResource = api.root.addResource('GetProductionScenarios');
    getProductionScenariosResource.addMethod('GET', new apigateway.LambdaIntegration(autoOrderFunction));
    
    // Add OPTIONS method for CORS preflight requests
    getProductionScenariosResource.addMethod('OPTIONS', new apigateway.MockIntegration({
      integrationResponses: [{
        statusCode: '200',
        responseParameters: {
          'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
          'method.response.header.Access-Control-Allow-Methods': "'GET,OPTIONS'",
          'method.response.header.Access-Control-Allow-Origin': "'*'",
          'method.response.header.Access-Control-Allow-Credentials': "'true'"
        },
      }],
      passthroughBehavior: apigateway.PassthroughBehavior.WHEN_NO_MATCH,
      requestTemplates: {
        "application/json": "{\"statusCode\": 200}"
      }
    }), {
      methodResponses: [{
        statusCode: '200',
        responseParameters: {
          'method.response.header.Access-Control-Allow-Headers': true,
          'method.response.header.Access-Control-Allow-Methods': true,
          'method.response.header.Access-Control-Allow-Origin': true,
          'method.response.header.Access-Control-Allow-Credentials': true,
        }
      }]
    });

    // Create the GetOrders resource and method - keep as POST
    const getOrdersResource = api.root.addResource('GetOrders');
    getOrdersResource.addMethod('POST', new apigateway.LambdaIntegration(autoOrderFunction));
    
    // Add OPTIONS method for CORS preflight requests
    getOrdersResource.addMethod('OPTIONS', new apigateway.MockIntegration({
      integrationResponses: [{
        statusCode: '200',
        responseParameters: {
          'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
          'method.response.header.Access-Control-Allow-Methods': "'POST,OPTIONS'",
          'method.response.header.Access-Control-Allow-Origin': "'*'",
          'method.response.header.Access-Control-Allow-Credentials': "'true'"
        },
      }],
      passthroughBehavior: apigateway.PassthroughBehavior.WHEN_NO_MATCH,
      requestTemplates: {
        "application/json": "{\"statusCode\": 200}"
      }
    }), {
      methodResponses: [{
        statusCode: '200',
        responseParameters: {
          'method.response.header.Access-Control-Allow-Headers': true,
          'method.response.header.Access-Control-Allow-Methods': true,
          'method.response.header.Access-Control-Allow-Origin': true,
          'method.response.header.Access-Control-Allow-Credentials': true,
        }
      }]
    });

    // Output the API URL
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'URL of the Auto Order API',
    });
  }
}
