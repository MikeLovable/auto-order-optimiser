
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { 
  ProductionScenarioArray, 
  OrderScheduleArray,
  ProductionScenario,
  GetProductionScenariosRequest,
  GetOrdersRequest
} from './types';
import { 
  generateRandomProductionScenarios,
  calculateOrderSchedules
} from './algorithm';

// Constants
const PERIODS = parseInt(process.env.PERIODS || '12', 10);
const SAMPLES = parseInt(process.env.SAMPLES || '30', 10);

// Hardcoded "Customer" scenarios (to be replaced manually before deployment)
const CustomerScenarios: ProductionScenarioArray = generateRandomProductionScenarios(SAMPLES);

// Hardcoded "Sim" scenarios (not to be replaced manually)
const SimScenarios: ProductionScenarioArray = generateRandomProductionScenarios(SAMPLES);

/**
 * Lambda handler function
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Lambda handler invoked with event:', JSON.stringify(event, null, 2));
  
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Credentials': true,
    'Content-Type': 'application/json'
  };
  
  // Handle OPTIONS requests for CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'CORS preflight handled successfully' }),
    };
  }
  
  try {
    // Check which API path was called
    const path = event.path;
    console.log(`Processing request for path: ${path}, method: ${event.httpMethod}`);
    
    if (path.includes('GetProductionScenarios')) {
      return await handleGetProductionScenarios(event, headers);
    } else if (path.includes('GetOrders')) {
      return await handleGetOrders(event, headers);
    } else {
      console.log(`Unknown path: ${path}`);
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ message: 'Not Found' }),
      };
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        message: 'Internal Server Error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};

/**
 * Handler for GetProductionScenarios API path
 */
async function handleGetProductionScenarios(
  event: APIGatewayProxyEvent, 
  headers: Record<string, boolean | string>
): Promise<APIGatewayProxyResult> {
  console.log('Handling GetProductionScenarios request');
  
  // For GET requests, parse query parameters instead of body
  let scenarioSet = 'Customer';
  
  if (event.queryStringParameters && event.queryStringParameters.ScenarioSet) {
    scenarioSet = event.queryStringParameters.ScenarioSet;
  }
  
  console.log(`Requested scenario set: ${scenarioSet}`);
  let scenarios: ProductionScenarioArray;
  
  // Return different scenarios based on the ScenarioSet parameter
  switch (scenarioSet) {
    case 'Random':
      console.log('Generating random scenarios');
      // Generate random scenarios at runtime
      scenarios = generateRandomProductionScenarios(SAMPLES);
      break;
    case 'Sim':
      console.log('Returning Sim scenarios');
      // Return hardcoded Sim scenarios
      scenarios = SimScenarios;
      break;
    case 'Customer':
    default:
      console.log('Returning Customer scenarios');
      // Return hardcoded Customer scenarios
      scenarios = CustomerScenarios;
      break;
  }
  
  console.log(`Returning ${scenarios.length} scenarios`);
  
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ scenarios }),
  };
}

/**
 * Handler for GetOrders API path
 */
async function handleGetOrders(
  event: APIGatewayProxyEvent, 
  headers: Record<string, boolean | string>
): Promise<APIGatewayProxyResult> {
  console.log('Handling GetOrders request');
  
  if (!event.body) {
    console.error('Missing request body');
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ message: 'Request body is required' }),
    };
  }

  console.log('Parsing request body');
  const request: GetOrdersRequest = JSON.parse(event.body);
  const { scenarios } = request;

  if (!Array.isArray(scenarios) || scenarios.length === 0) {
    console.error('Invalid or empty scenarios array');
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ message: 'At least one production scenario is required' }),
    };
  }

  console.log(`Calculating order schedules for ${scenarios.length} scenarios`);
  // Calculate order schedules for the provided scenarios
  const orderSchedules = calculateOrderSchedules(scenarios);
  console.log(`Generated ${orderSchedules.length} order schedules`);

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ orderSchedules }),
  };
}
