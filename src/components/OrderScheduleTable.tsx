
import React from 'react';
import { OrderScheduleArray, PERIODS } from '../types';

interface OrderScheduleTableProps {
  orderSchedules: OrderScheduleArray;
  loading?: boolean;
}

const OrderScheduleTable: React.FC<OrderScheduleTableProps> = ({ orderSchedules, loading = false }) => {
  // Create week headers for columns (0 to PERIODS)
  const weekHeaders = Array.from({ length: PERIODS + 1 }, (_, i) => i);

  // Helper function to determine cell background color based on inventory value
  const getInventoryCellColor = (value: number, index: number, invTgt: number = 100) => {
    // Red for zero inventory
    if (value <= 0) {
      return 'bg-red-200';
    }
    
    // Check for consecutive excessive inventory
    if (value >= invTgt * 3) {
      // Look at previous cell to see if it was also excessive
      if (index > 0 && orderSchedules[0].Inv[index - 1] >= invTgt * 3) {
        return 'bg-orange-200';
      }
    }
    
    return '';
  };

  if (loading) {
    return (
      <div className="border border-gray-300 p-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2">Calculating optimal order schedules...</p>
      </div>
    );
  }

  if (!orderSchedules.length) {
    return (
      <div className="border border-gray-300 p-4 text-center">
        <p>No order schedules to display. Select production scenarios and click "Recommend Orders".</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      {/* Color code legend */}
      <div className="mb-2 text-sm flex gap-4">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-200 mr-1"></div>
          <span>Zero inventory</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-orange-200 mr-1"></div>
          <span>Excessive inventory (over 3x target for 2+ weeks)</span>
        </div>
      </div>
      
      <table className="w-full table-auto border-collapse border-gray-300">
        <thead>
          <tr className="bg-gray-100 text-xs">
            <th className="border border-gray-300 p-1 sticky left-0 bg-gray-100">MPN</th>
            <th className="border border-gray-300 p-1 sticky left-10 bg-gray-100">MPN Attributes</th>
            <th className="border border-gray-300 p-1 sticky left-36 bg-gray-100">Notes</th>
            <th className="border border-gray-300 p-1 sticky left-[320px] bg-gray-100">Dir</th>
            <th className="border border-gray-300 p-1">Type</th>
            {weekHeaders.map((week) => (
              <th key={week} className="border border-gray-300 p-1 w-10 text-center">W{week}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orderSchedules.map((schedule, scheduleIndex) => (
            <React.Fragment key={`${schedule.MPN}-${scheduleIndex}`}>
              {/* Input section */}
              <tr className="text-xs">
                {/* Merged cells for MPN info */}
                <td rowSpan={7} className="border border-gray-300 p-1 align-top font-medium sticky left-0 bg-white">
                  {schedule.MPN}
                </td>
                <td rowSpan={7} className="border border-gray-300 p-1 align-top text-xs sticky left-10 bg-white">
                  <div>LdTm[{schedule.LdTm}], MOQ[{schedule.MOQ}]</div>
                  <div>PkQty[{schedule.PkQty}]</div>
                  <div>InvTgt[{schedule.InvTgt}], SStok[{schedule.SStok}]</div>
                </td>
                <td rowSpan={7} className="border border-gray-300 p-1 align-top text-xs sticky left-36 bg-white">
                  {schedule.Notes}
                </td>
                <td rowSpan={3} className="border border-gray-300 p-1 align-middle text-center font-medium sticky left-[320px] bg-gray-50">
                  In
                </td>
                <td className="border border-gray-300 p-1 font-medium text-center">Rqt</td>
                {schedule.Rqt.map((value, i) => (
                  <td key={`in-rqt-${i}`} className="border border-gray-300 p-1 text-xs text-center">
                    {value}
                  </td>
                ))}
              </tr>
              <tr className="text-xs">
                <td className="border border-gray-300 p-1 font-medium text-center">Rec</td>
                {schedule.InRec?.map((value, i) => (
                  <td key={`in-rec-${i}`} className="border border-gray-300 p-1 text-xs text-center">
                    {value}
                  </td>
                )) || <td className="border border-gray-300 p-1">-</td>}
              </tr>
              <tr className="text-xs">
                <td className="border border-gray-300 p-1 font-medium text-center">Inv</td>
                {/* If no initial inventory, display placeholder */}
                {schedule.Inv && schedule.Inv.slice(0, 1).map((value, i) => (
                  <td key={`in-inv-${i}`} className="border border-gray-300 p-1 text-xs text-center">
                    {value}
                  </td>
                ))}
                {Array(PERIODS).fill(0).map((_, i) => (
                  <td key={`in-inv-placeholder-${i}`} className="border border-gray-300 p-1 text-xs text-center">-</td>
                ))}
              </tr>
              {/* Output section */}
              <tr className="text-xs">
                <td rowSpan={4} className="border border-gray-300 p-1 align-middle text-center font-medium sticky left-[320px] bg-gray-50">
                  Out
                </td>
                <td className="border border-gray-300 p-1 font-medium text-center">Rqt</td>
                {schedule.Rqt.map((value, i) => (
                  <td key={`out-rqt-${i}`} className="border border-gray-300 p-1 text-xs text-center">
                    {value}
                  </td>
                ))}
              </tr>
              <tr className="text-xs">
                <td className="border border-gray-300 p-1 font-medium text-center">Ord</td>
                {schedule.Ord.map((value, i) => (
                  <td key={`ord-${i}`} className="border border-gray-300 p-1 text-xs text-center">
                    {value}
                  </td>
                ))}
              </tr>
              <tr className="text-xs">
                <td className="border border-gray-300 p-1 font-medium text-center">Rec</td>
                {schedule.Rec.map((value, i) => (
                  <td key={`out-rec-${i}`} className="border border-gray-300 p-1 text-xs text-center">
                    {value}
                  </td>
                ))}
              </tr>
              <tr className="text-xs">
                <td className="border border-gray-300 p-1 font-medium text-center">Inv</td>
                {schedule.Inv.map((value, i) => (
                  <td 
                    key={`out-inv-${i}`} 
                    className={`border border-gray-300 p-1 text-xs text-center ${getInventoryCellColor(value, i, schedule.InvTgt)}`}
                  >
                    {value}
                  </td>
                ))}
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderScheduleTable;
