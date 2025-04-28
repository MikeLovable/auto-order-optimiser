
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
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
    'Content-Type': 'application/json'
  };
  
  try {
    // Check which API path was called
    const path = event.path;
    
    if (path.includes('GetProductionScenarios')) {
      return await handleGetProductionScenarios(event, headers);
    } else if (path.includes('GetOrders')) {
      return await handleGetOrders(event, headers);
    } else {
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
  if (!event.body) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ message: 'Request body is required' }),
    };
  }

  const request: GetProductionScenariosRequest = JSON.parse(event.body);
  const { ScenarioSet = 'Customer' } = request;

  let scenarios: ProductionScenarioArray;
  
  // Return different scenarios based on the ScenarioSet parameter
  switch (ScenarioSet) {
    case 'Random':
      // Generate random scenarios at runtime
      scenarios = generateRandomProductionScenarios(SAMPLES);
      break;
    case 'Sim':
      // Return hardcoded Sim scenarios
      scenarios = SimScenarios;
      break;
    case 'Customer':
    default:
      // Return hardcoded Customer scenarios
      scenarios = CustomerScenarios;
      break;
  }

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
  if (!event.body) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ message: 'Request body is required' }),
    };
  }

  const request: GetOrdersRequest = JSON.parse(event.body);
  const { scenarios } = request;

  if (!Array.isArray(scenarios) || scenarios.length === 0) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ message: 'At least one production scenario is required' }),
    };
  }

  // Calculate order schedules for the provided scenarios
  const orderSchedules = calculateOrderSchedules(scenarios);

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ orderSchedules }),
  };
}
