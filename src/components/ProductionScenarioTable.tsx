
import React from 'react';
import { ProductionScenarioArray, PERIODS } from '../types';
import { Checkbox } from "@/components/ui/checkbox";

interface ProductionScenarioTableProps {
  scenarios: ProductionScenarioArray;
  onSelectionChange: (index: number, selected: boolean) => void;
}

const ProductionScenarioTable: React.FC<ProductionScenarioTableProps> = ({ 
  scenarios, 
  onSelectionChange 
}) => {
  // Create week headers for columns (0 to PERIODS)
  const weekHeaders = Array.from({ length: PERIODS + 1 }, (_, i) => i);
  
  // Calculate if all rows are selected
  const allSelected = scenarios.length > 0 && scenarios.every(scenario => scenario.Sel);
  const someSelected = scenarios.length > 0 && scenarios.some(scenario => scenario.Sel);
  
  // Handle select all checkbox change
  const handleSelectAll = (checked: boolean) => {
    // Update all scenarios at once
    scenarios.forEach((_, index) => {
      onSelectionChange(index, checked);
    });
  };

  return (
    <div className="overflow-x-auto border border-black">
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-100 text-xs">
            <th className="border p-1 sticky left-0 bg-gray-100 w-8">
              <div className="flex items-center justify-center">
                <Checkbox 
                  checked={allSelected} 
                  indeterminate={!allSelected && someSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all rows"
                />
              </div>
            </th>
            <th className="border p-1 sticky left-10 bg-gray-100 w-24">MPN</th>
            <th className="border p-1 sticky left-32 bg-gray-100 w-28">MPN Attributes</th>
            <th className="border p-1 w-12">Info</th>
            {weekHeaders.map((week) => (
              <th key={week} className="border p-1 w-10 text-center">W{week}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {scenarios.map((scenario, scenarioIndex) => (
            <React.Fragment key={`${scenario.MPN}-${scenarioIndex}`}>
              {/* Requirements Row */}
              <tr className="text-xs">
                <td rowSpan={3} className="border p-1 sticky left-0 bg-white">
                  <div className="h-full flex items-center justify-center">
                    <Checkbox
                      checked={scenario.Sel}
                      onCheckedChange={(checked) => {
                        if (checked !== 'indeterminate') {
                          onSelectionChange(scenarioIndex, checked);
                        }
                      }}
                      aria-label={`Select ${scenario.MPN}`}
                    />
                  </div>
                </td>
                <td rowSpan={3} className="border p-1 sticky left-10 bg-white">
                  <div className="h-full flex items-center font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                    {scenario.MPN}
                  </div>
                </td>
                <td rowSpan={3} className="border p-1 sticky left-32 bg-white">
                  <div className="h-full flex flex-col justify-center text-xs">
                    <div>LdTm[{scenario.LdTm}]</div>
                    <div>MOQ[{scenario.MOQ}]</div>
                    <div>PkQty[{scenario.PkQty}]</div>
                    <div>InvTgt[{scenario.InvTgt}]</div>
                    <div>SStok[{scenario.SStok}]</div>
                  </div>
                </td>
                <td className="border p-1 font-medium text-center">Rqt</td>
                {scenario.Rqt.map((value, i) => (
                  <td key={`rqt-${i}`} className="border p-1 text-xs text-center">{value}</td>
                ))}
              </tr>
              {/* Receipts Row */}
              <tr className="text-xs">
                <td className="border p-1 font-medium text-center">Rec</td>
                {scenario.Rec.map((value, i) => (
                  <td key={`rec-${i}`} className="border p-1 text-xs text-center">{value}</td>
                ))}
              </tr>
              {/* Inventory Row */}
              <tr className="text-xs">
                <td className="border p-1 font-medium text-center">Inv</td>
                {scenario.Inv.map((value, i) => (
                  <td key={`inv-${i}`} className="border p-1 text-xs text-center">{value}</td>
                ))}
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductionScenarioTable;
