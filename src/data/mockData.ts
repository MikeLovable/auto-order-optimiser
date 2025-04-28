
import { ProductionScenarioArray, OrderScheduleArray, SAMPLES } from "../types";
import { generateRandomProductionScenarios, calculateOrderSchedules } from "../utils/algorithm";

// Generate 20 random production scenarios for local testing
export const LocalProductionScenarioArray: ProductionScenarioArray = generateRandomProductionScenarios(20);

// Generate order schedules from the production scenarios
export const LocalOrderScheduleArray: OrderScheduleArray = calculateOrderSchedules(LocalProductionScenarioArray);

// Generate 100 sample production scenarios for demonstration
export const DemonstrationScenarios: ProductionScenarioArray = generateRandomProductionScenarios(100);

// Calculate order schedules for demonstration
export const DemonstrationOrderSchedules: OrderScheduleArray = calculateOrderSchedules(DemonstrationScenarios);

// Hardcoded "Customer" scenarios (to be replaced manually before deployment if desired)
export const CustomerScenarios: ProductionScenarioArray = generateRandomProductionScenarios(SAMPLES);

// Hardcoded "Sim" scenarios (not to be replaced manually)
export const SimScenarios: ProductionScenarioArray = generateRandomProductionScenarios(SAMPLES);
