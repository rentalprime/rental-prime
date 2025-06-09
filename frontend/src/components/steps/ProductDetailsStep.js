import React from 'react';

const ProductDetailsStep = ({ formData, onChange }) => {
  const handleSpecChange = (idx, field, value) => {
    const updated = formData.specifications.map((s, i) => i === idx ? { ...s, [field]: value } : s);
    onChange('specifications', updated);
  };
  const addSpec = () => onChange('specifications', [...formData.specifications, { key: '', value: '' }]);
  const removeSpec = (idx) => onChange('specifications', formData.specifications.filter((_, i) => i !== idx));

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-blue-700 mb-2 flex items-center gap-2">Product Details <span className="text-blue-400" title="Describe your product">📝</span></h2>
      <div>
        <label className="block text-sm font-medium text-blue-900 mb-1">Description <span className="text-red-500">*</span></label>
        <textarea
          className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
          value={formData.description}
          onChange={e => onChange('description', e.target.value)}
          placeholder="Describe your product..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-blue-900 mb-1">Specifications <span className="text-gray-400">(optional)</span></label>
        {formData.specifications.map((spec, idx) => (
          <div className="flex gap-2 mb-2" key={idx}>
            <input
              type="text"
              className="w-1/3 px-2 py-1 border rounded focus:ring-blue-500"
              placeholder="Key"
              value={spec.key}
              onChange={e => handleSpecChange(idx, 'key', e.target.value)}
            />
            <input
              type="text"
              className="w-2/3 px-2 py-1 border rounded focus:ring-blue-500"
              placeholder="Value"
              value={spec.value}
              onChange={e => handleSpecChange(idx, 'value', e.target.value)}
            />
            <button type="button" className="text-red-500 font-bold" onClick={() => removeSpec(idx)} title="Remove">×</button>
          </div>
        ))}
        <button type="button" className="text-blue-600 mt-1" onClick={addSpec}>+ Add Specification</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-blue-900 mb-1">Rental Price <span className="text-red-500">*</span></label>
          <div className="flex items-center">
            <span className="text-gray-500 mr-1">$</span>
            <input
              type="number"
              className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500"
              value={formData.price}
              onChange={e => onChange('price', e.target.value)}
              placeholder="e.g. 25"
              min={0}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-blue-900 mb-1">Price Period</label>
          <select
            className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500"
            value={formData.pricePeriod}
            onChange={e => onChange('pricePeriod', e.target.value)}
          >
            <option value="day">Per Day</option>
            <option value="week">Per Week</option>
            <option value="month">Per Month</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-blue-900 mb-1">Deposit Amount</label>
          <div className="flex items-center">
            <span className="text-gray-500 mr-1">$</span>
            <input
              type="number"
              className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500"
              value={formData.deposit}
              onChange={e => onChange('deposit', e.target.value)}
              placeholder="e.g. 100"
              min={0}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-blue-900 mb-1">Minimum Rental Duration</label>
          <input
            type="number"
            className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500"
            value={formData.minDuration}
            onChange={e => onChange('minDuration', e.target.value)}
            min={1}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsStep;
