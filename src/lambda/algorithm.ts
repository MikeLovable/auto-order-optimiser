
// Copy of the algorithm file to be bundled with the Lambda function
// This is the same code as in src/utils/algorithm.ts

import { ProductionScenario, OrderSchedule, PERIODS } from "./types";

/**
 * Calculate an optimal order schedule based on a production scenario
 * 
 * This algorithm aims to maintain inventory levels close to target 
 * while avoiding stockouts and excessive inventory. It looks ahead
 * to anticipate future needs and places orders accordingly.
 * 
 * @param scenario The production scenario to generate orders for
 * @returns An optimized order schedule
 */
export function calculateOrderSchedule(scenario: ProductionScenario): OrderSchedule {
  const { MPN, InvTgt, SStok, LdTm, MOQ, PkQty, Rqt, Rec, Inv } = scenario;
  
  // Initialize output arrays with the same length as Rqt
  const weekCount = Rqt.length;
  const calculatedOrd: number[] = new Array(weekCount).fill(0);
  const calculatedRec: number[] = [...Rec]; // Start with existing receiving schedule
  const calculatedInv: number[] = [...Inv]; // Start with existing inventory levels
  
  // Calculate orders for each week
  for (let week = 0; week < weekCount; week++) {
    // Calculate projected inventory and determine if an order is needed
    let projectedInv = week === 0 ? Inv[0] : calculatedInv[week - 1];
    
    // Add receiving for the current week
    projectedInv += calculatedRec[week];
    
    // Subtract requirements for the current week
    projectedInv -= Rqt[week];
    
    // Update inventory for current week
    calculatedInv[week] = Math.max(0, projectedInv);
    
    // Check if we need to place an order
    // Look ahead for LdTm weeks to see if inventory will drop below safety stock
    const targetInv = InvTgt + SStok;
    let shouldOrder = false;
    let criticalWeek = -1;
    let lowestProjectedInv = projectedInv;
    
    // Look ahead to determine if we need to order
    for (let ahead = 1; ahead <= Math.min(LdTm + 3, weekCount - week - 1); ahead++) {
      let futureInv = calculatedInv[week];
      
      // Add future receiving
      for (let i = week + 1; i <= week + ahead && i < weekCount; i++) {
        futureInv += calculatedRec[i];
      }
      
      // Subtract future requirements
      for (let i = week + 1; i <= week + ahead && i < weekCount; i++) {
        futureInv -= Rqt[i];
      }
      
      // Check if we're projected to go below safety stock
      if (futureInv < SStok) {
        shouldOrder = true;
        if (criticalWeek === -1 || futureInv < lowestProjectedInv) {
          criticalWeek = week + ahead;
          lowestProjectedInv = futureInv;
        }
      }
    }
    
    // Check if inventory is already excessive (over 3 times the target)
    const excessiveInv = calculatedInv[week] > InvTgt * 3;
    let nextWeekExcessive = false;
    
    if (week < weekCount - 1) {
      const nextWeekInv = calculatedInv[week] + calculatedRec[week + 1] - Rqt[week + 1];
      nextWeekExcessive = nextWeekInv > InvTgt * 3;
    }
    
    // Don't order if inventory is already excessive for this and next week
    if (excessiveInv && nextWeekExcessive) {
      shouldOrder = false;
    }
    
    // Calculate order quantity if needed
    if (shouldOrder) {
      // Calculate how much to order to reach target inventory by critical week
      let orderQty = targetInv - lowestProjectedInv;
      
      // Enforce minimum order quantity
      orderQty = Math.max(orderQty, MOQ);
      
      // Round up to nearest package quantity
      orderQty = Math.ceil(orderQty / PkQty) * PkQty;
      
      calculatedOrd[week] = orderQty;
      
      // Update future receiving based on lead time
      const receiveWeek = Math.min(week + LdTm, weekCount - 1);
      calculatedRec[receiveWeek] += orderQty;
      
      // Recalculate future inventory levels after this order
      for (let i = receiveWeek; i < weekCount; i++) {
        if (i === 0) {
          calculatedInv[i] = Inv[0] + calculatedRec[i] - Rqt[i];
        } else {
          calculatedInv[i] = Math.max(0, calculatedInv[i - 1] + calculatedRec[i] - Rqt[i]);
        }
      }
    }
  }
  
  // Check for critical conditions and add notes
  let hasZeroInventory = false;
  let hasExcessiveInventory = false;
  let consecutiveExcessWeeks = 0;
  
  for (let week = 0; week < weekCount; week++) {
    if (calculatedInv[week] <= 0) {
      hasZeroInventory = true;
    }
    
    if (calculatedInv[week] >= InvTgt * 3) {
      consecutiveExcessWeeks++;
      if (consecutiveExcessWeeks >= 2) {
        hasExcessiveInventory = true;
      }
    } else {
      consecutiveExcessWeeks = 0;
    }
  }
  
  let finalNotes = "";
  if (hasZeroInventory) {
    finalNotes += "WARNING: Inventory reaches zero or below in some weeks. ";
  }
  
  if (hasExcessiveInventory) {
    finalNotes += "CAUTION: Inventory exceeds 3x target for 2+ consecutive weeks. ";
  }
  
  if (!finalNotes) {
    finalNotes = "Schedule optimized successfully.";
  }
  
  return {
    MPN,
    InvTgt,
    SStok,
    LdTm,
    MOQ,
    PkQty,
    Rqt,
    InRec: Rec,
    Ord: calculatedOrd,
    Rec: calculatedRec,
    Inv: calculatedInv,
    Notes: finalNotes.trim()
  };
}

/**
 * Generate a random production scenario for testing
 * 
 * @param mpnIndex Optional index to use for MPN naming
 * @returns A randomly generated production scenario
 */
export function generateRandomProductionScenario(mpnIndex?: number): ProductionScenario {
  // Generate a unique MPN if index is provided
  const mpnId = mpnIndex !== undefined 
    ? `MPN_${String.fromCharCode(65 + (mpnIndex % 26))}${String.fromCharCode(65 + (Math.floor(mpnIndex / 26) % 26))}${mpnIndex % 10}`
    : `MPN_${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 10)}`;

  // Generate random inventory target (10-200)
  const invTgt = Math.floor(Math.random() * 191) + 10;
  
  // Generate safety stock (0-5% of inventory target)
  const sStok = Math.floor(Math.random() * (invTgt * 0.05 + 1));
  
  // Generate lead time (1-5 weeks)
  const ldTm = Math.floor(Math.random() * 5) + 1;
  
  // Generate MOQ (2-100)
  const moq = Math.floor(Math.random() * 99) + 2;
  
  // Generate package quantity (2 to 1/5 of MOQ)
  const pkQty = Math.floor(Math.random() * (moq / 5 - 1)) + 2;
  
  // Generate requirements, receipts, and inventory arrays
  const rqt = Array.from({ length: PERIODS + 1 }, () => Math.floor(Math.random() * 401));
  const rec = Array.from({ length: PERIODS + 1 }, () => Math.floor(Math.random() * 401));
  const inv = Array.from({ length: PERIODS + 1 }, () => Math.floor(Math.random() * 401));
  
  return {
    Sel: true,
    MPN: mpnId,
    InvTgt: invTgt,
    SStok: sStok,
    LdTm: ldTm,
    MOQ: moq,
    PkQty: pkQty,
    Rqt: rqt,
    Rec: rec,
    Inv: inv
  };
}

/**
 * Generate a set of random production scenarios
 * 
 * @param count Number of scenarios to generate
 * @returns An array of random production scenarios
 */
export function generateRandomProductionScenarios(count: number): ProductionScenario[] {
  return Array.from({ length: count }, (_, i) => generateRandomProductionScenario(i));
}

/**
 * Calculate order schedules for multiple production scenarios
 * 
 * @param scenarios Array of production scenarios
 * @returns Array of calculated order schedules
 */
export function calculateOrderSchedules(scenarios: ProductionScenario[]): OrderSchedule[] {
  return scenarios.filter(scenario => scenario.Sel).map(calculateOrderSchedule);
}
