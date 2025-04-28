
import React from 'react';
import { ProductionScenarioArray, PERIODS } from '../types';

interface ProductionScenarioTableProps {
  scenarios: ProductionScenarioArray;
  onSelectionChange: (index: number, selected: boolean) => void;
}

const ProductionScenarioTable: React.FC<ProductionScenarioTableProps> = ({ scenarios, onSelectionChange }) => {
  // Create week headers for columns (0 to PERIODS)
  const weekHeaders = Array.from({ length: PERIODS + 1 }, (_, i) => i);

  return (
    <div className="overflow-x-auto border border-black">
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-100 text-xs">
            <th className="border p-1 sticky left-0 bg-gray-100">Sel</th>
            <th className="border p-1 sticky left-10 bg-gray-100">MPN</th>
            <th className="border p-1 sticky left-32 bg-gray-100">MPN Attributes</th>
            <th className="border p-1">Info</th>
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
                {/* Merged cells for scenario info */}
                <td rowSpan={3} className="border p-1 align-top text-center sticky left-0 bg-white">
                  <input
                    type="checkbox"
                    checked={scenario.Sel}
                    onChange={(e) => onSelectionChange(scenarioIndex, e.target.checked)}
                    className="w-4 h-4"
                  />
                </td>
                <td rowSpan={3} className="border p-1 align-top font-medium sticky left-10 bg-white">
                  {scenario.MPN}
                </td>
                <td rowSpan={3} className="border p-1 align-top text-xs sticky left-32 bg-white">
                  <div>LdTm[{scenario.LdTm}], MOQ[{scenario.MOQ}]</div>
                  <div>PkQty[{scenario.PkQty}]</div>
                  <div>InvTgt[{scenario.InvTgt}], SStok[{scenario.SStok}]</div>
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
