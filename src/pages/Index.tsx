
import React, { useState, useEffect } from 'react';
import { 
  ProductionScenarioArray, 
  OrderScheduleArray,
  ProductionScenario,
  PERIODS,
  SAMPLES
} from '../types';
import { 
  LocalProductionScenarioArray, 
  LocalOrderScheduleArray,
  DemonstrationScenarios,
  DemonstrationOrderSchedules
} from '../data/mockData';
import { getProductionScenarios, getOrders } from '../services/apiService';
import { calculateOrderSchedules } from '../utils/algorithm';
import ProductionScenarioTable from '../components/ProductionScenarioTable';
import OrderScheduleTable from '../components/OrderScheduleTable';

// Scenario set options
const SCENARIO_SETS = ["Customer", "Random", "Sim"];

const Index = () => {
  // State for selected scenario set
  const [scenarioSet, setScenarioSet] = useState<string>("Customer");
  
  // State for production scenarios and order schedules
  const [productionScenarios, setProductionScenarios] = useState<ProductionScenarioArray>([]);
  const [orderSchedules, setOrderSchedules] = useState<OrderScheduleArray>([]);
  
  // Loading states for async operations
  const [loadingScenarios, setLoadingScenarios] = useState<boolean>(false);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(false);
  
  // Keep track of the source of scenarios (local or API)
  const [scenarioSource, setScenarioSource] = useState<'local' | 'api' | null>(null);
  
  // Handler for scenario selection changes
  const handleSelectionChange = (index: number, selected: boolean) => {
    const updatedScenarios = [...productionScenarios];
    updatedScenarios[index] = { ...updatedScenarios[index], Sel: selected };
    setProductionScenarios(updatedScenarios);
  };
  
  // Handler for getting local scenarios
  const handleGetLocalScenarios = () => {
    setProductionScenarios(LocalProductionScenarioArray);
    setOrderSchedules([]);
    setScenarioSource('local');
  };
  
  // Handler for getting API scenarios
  const handleGetApiScenarios = async () => {
    setLoadingScenarios(true);
    try {
      console.log(`Fetching ${scenarioSet} scenarios from API`);
      const scenarios = await getProductionScenarios(scenarioSet);
      setProductionScenarios(scenarios);
      setOrderSchedules([]);
      setScenarioSource('api');
    } catch (error) {
      console.error("Error fetching scenarios:", error);
      // In a real app, we'd show a toast notification here
      alert("Failed to fetch scenarios from API. Using local data instead.");
      handleGetLocalScenarios();
    } finally {
      setLoadingScenarios(false);
    }
  };
  
  // Handler for local recommendation
  const handleRecommendLocal = () => {
    const selectedScenarios = productionScenarios.filter(scenario => scenario.Sel);
    if (selectedScenarios.length === 0) {
      alert("Please select at least one scenario.");
      return;
    }
    
    setLoadingOrders(true);
    try {
      // Calculate orders locally using our algorithm
      const calculatedOrders = calculateOrderSchedules(selectedScenarios);
      setOrderSchedules(calculatedOrders);
    } catch (error) {
      console.error("Error calculating orders locally:", error);
      alert("Failed to calculate orders locally.");
    } finally {
      setLoadingOrders(false);
    }
  };
  
  // Handler for API recommendation
  const handleRecommendApi = async () => {
    const selectedScenarios = productionScenarios.filter(scenario => scenario.Sel);
    if (selectedScenarios.length === 0) {
      alert("Please select at least one scenario.");
      return;
    }
    
    setLoadingOrders(true);
    try {
      // Get orders from API
      console.log(`Sending ${selectedScenarios.length} selected scenarios to API for order calculation`);
      const orders = await getOrders(selectedScenarios);
      setOrderSchedules(orders);
    } catch (error) {
      console.error("Error fetching orders from API:", error);
      alert("Failed to get orders from API. Calculating locally instead.");
      handleRecommendLocal();
    } finally {
      setLoadingOrders(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Row 1: Title */}
      <div className="h-[50px] flex items-center justify-center mb-6">
        <h1 className="text-3xl font-bold">Auto Order Generator</h1>
      </div>
      
      {/* Row 2: Scenario Selection */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-4 mb-4 items-center">
          <select
            value={scenarioSet}
            onChange={(e) => setScenarioSet(e.target.value)}
            className="border border-gray-300 rounded py-1 px-2"
          >
            {SCENARIO_SETS.map((set) => (
              <option key={set} value={set}>{set}</option>
            ))}
          </select>
          
          <button
            onClick={handleGetLocalScenarios}
            className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
          >
            Get Local Scenarios
          </button>
          
          <button
            onClick={handleGetApiScenarios}
            className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600"
            disabled={loadingScenarios}
          >
            {loadingScenarios ? 'Loading...' : 'Get API Scenarios'}
          </button>
        </div>
        
        <div className="border border-gray-300 rounded">
          {loadingScenarios ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2">Loading production scenarios...</p>
            </div>
          ) : productionScenarios.length > 0 ? (
            <ProductionScenarioTable 
              scenarios={productionScenarios} 
              onSelectionChange={handleSelectionChange} 
            />
          ) : (
            <div className="p-8 text-center">
              <p>No production scenarios loaded. Click one of the buttons above to load scenarios.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Row 3: Order Recommendation Buttons */}
      <div className="mb-6 space-x-4">
        <button
          onClick={handleRecommendLocal}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={loadingOrders || productionScenarios.length === 0}
        >
          RecommendLocal
        </button>
        <button
          onClick={handleRecommendApi}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          disabled={loadingOrders || productionScenarios.length === 0}
        >
          RecommendOrders
        </button>
      </div>
      
      {/* Row 4: Order Schedule Table */}
      <div className="mb-12">
        <h2 className="text-xl font-bold mb-2">Order Schedule Results</h2>
        <OrderScheduleTable 
          orderSchedules={orderSchedules} 
          loading={loadingOrders} 
        />
      </div>
      
      {/* Row 5: Demonstration */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Demonstration (100 Samples)</h2>
        <OrderScheduleTable 
          orderSchedules={DemonstrationOrderSchedules.slice(0, 100)} 
        />
      </div>
    </div>
  );
};

export default Index;
