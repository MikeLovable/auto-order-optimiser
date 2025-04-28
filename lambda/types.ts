
// Constants
export const PERIODS = 12; // Default: 12 periods (weeks)
export const SAMPLES = 30; // Default: 30 samples (scenarios)

// Basic array types
export type RequirementArray = number[]; // Manufacturing requirements by week
export type ReceiveArray = number[];     // Scheduled receipts by week
export type InventoryArray = number[];   // Inventory levels by week
export type OrderArray = number[];       // Order quantities by week

// Production Scenario represents a schedule of production requirements for a Part
export interface ProductionScenario {
  Sel: boolean;              // Selection checkbox
  MPN: string;               // Part number (unique identifier)
  InvTgt: number;            // Target inventory level
  SStok: number;             // Safety stock level
  LdTm: number;              // Lead time (weeks)
  MOQ: number;               // Minimum order quantity
  PkQty: number;             // Package quantity
  Rqt: RequirementArray;     // Requirements by week
  Rec: ReceiveArray;         // Scheduled receipts by week
  Inv: InventoryArray;       // Initial inventory levels by week
}

// Order Schedule represents recommended orders to satisfy a Production Scenario
export interface OrderSchedule {
  MPN: string;               // Part number (copied from ProductionScenario)
  InvTgt?: number;           // Target inventory (copied from ProductionScenario)
  SStok?: number;            // Safety stock (copied from ProductionScenario)
  LdTm?: number;             // Lead time (copied from ProductionScenario)
  MOQ?: number;              // Minimum order quantity (copied from ProductionScenario)
  PkQty?: number;            // Package quantity (copied from ProductionScenario)
  Rqt: RequirementArray;     // Requirements (copied from ProductionScenario)
  InRec?: ReceiveArray;      // Scheduled receipts (copied from ProductionScenario)
  Ord: OrderArray;           // Recommended order quantities
  Rec: ReceiveArray;         // Expected receipts based on orders
  Inv: InventoryArray;       // Expected inventory levels
  Notes: string;             // Notes about the recommended schedule
}

// Array types
export type ProductionScenarioArray = ProductionScenario[];
export type OrderScheduleArray = OrderSchedule[];

// API request types
export interface GetProductionScenariosRequest {
  ScenarioSet: string;  // "Customer", "Random", or "Sim"
}

export interface GetOrdersRequest {
  scenarios: ProductionScenarioArray;
}

// API response types
export interface GetProductionScenariosResponse {
  scenarios: ProductionScenarioArray;
}

export interface GetOrdersResponse {
  orderSchedules: OrderScheduleArray;
}
