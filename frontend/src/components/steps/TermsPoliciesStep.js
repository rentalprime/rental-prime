import React from 'react';

const TermsPoliciesStep = ({ formData, onChange }) => (
  <div className="space-y-6">
    <h2 className="text-xl font-bold text-blue-700 mb-2 flex items-center gap-2">Terms & Policies <span className="text-blue-400" title="Rental rules">📃</span></h2>
    <div>
      <label className="block text-sm font-medium text-blue-900 mb-1">Rental Terms <span className="text-red-500">*</span></label>
      <textarea
        className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
        value={formData.rentalTerms}
        onChange={e => onChange('rentalTerms', e.target.value)}
        placeholder="Specify your rental terms and conditions..."
      />
    </div>
    <div className="flex items-center gap-2 mt-2">
      <input
        type="checkbox"
        checked={formData.acceptDeposit}
        onChange={e => onChange('acceptDeposit', e.target.checked)}
        className="accent-blue-600"
        id="acceptDeposit"
      />
      <label htmlFor="acceptDeposit" className="text-sm font-medium text-blue-900">I accept the security deposit policy</label>
    </div>
    <div>
      <label className="block text-sm font-medium text-blue-900 mb-1">Cancellation Policy</label>
      <select
        className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500"
        value={formData.cancellation}
        onChange={e => onChange('cancellation', e.target.value)}
      >
        <option value="flexible">Flexible - Full refund 1 day prior</option>
        <option value="moderate">Moderate - Full refund 3 days prior</option>
        <option value="strict">Strict - 50% refund up to 1 week</option>
        <option value="non_refundable">Non-refundable</option>
      </select>
    </div>
    <div>
      <label className="block text-sm font-medium text-blue-900 mb-1">Additional Notes <span className="text-gray-400">(optional)</span></label>
      <textarea
        className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
        value={formData.notes}
        onChange={e => onChange('notes', e.target.value)}
        placeholder="Any additional info for renters..."
      />
    </div>
  </div>
);

export default TermsPoliciesStep;
