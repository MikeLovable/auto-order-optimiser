
import { 
  GetProductionScenariosRequest, 
  GetProductionScenariosResponse, 
  GetOrdersRequest, 
  GetOrdersResponse, 
  ProductionScenarioArray,
  OrderScheduleArray
} from "../types";

// Base URL of the AutoOrderAPI
// In a real project, this would be configured from environment variables
const API_URL = "https://your-api-gateway-url.execute-api.region.amazonaws.com/prod";

/**
 * Get production scenarios from the API
 * 
 * @param scenarioSet Type of scenario set to retrieve ("Customer", "Random", or "Sim")
 * @returns Promise resolving to an array of production scenarios
 */
export async function getProductionScenarios(scenarioSet: string = "Customer"): Promise<ProductionScenarioArray> {
  try {
    // Changed to use GET with query parameters
    const url = new URL(`${API_URL}/GetProductionScenarios`);
    url.searchParams.append('ScenarioSet', scenarioSet);
    
    console.log(`Fetching scenarios from: ${url.toString()}`);
    
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data: GetProductionScenariosResponse = await response.json();
    return data.scenarios;
  } catch (error) {
    console.error("Error fetching production scenarios:", error);
    throw error;
  }
}

/**
 * Get order schedules from the API
 * 
 * @param scenarios Production scenarios to calculate orders for
 * @returns Promise resolving to an array of order schedules
 */
export async function getOrders(scenarios: ProductionScenarioArray): Promise<OrderScheduleArray> {
  try {
    const request: GetOrdersRequest = { scenarios };
    
    console.log(`Sending order request to: ${API_URL}/GetOrders`);
    
    const response = await fetch(`${API_URL}/GetOrders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data: GetOrdersResponse = await response.json();
    return data.orderSchedules;
  } catch (error) {
    console.error("Error fetching order schedules:", error);
    throw error;
  }
}
