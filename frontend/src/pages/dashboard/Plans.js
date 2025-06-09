import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  RiAddLine, 
  RiEdit2Line, 
  RiDeleteBinLine, 
  RiCloseLine,
  RiCheckLine,
  RiTimeLine
} from 'react-icons/ri';

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentPlan, setCurrentPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    interval: 'monthly',
    features: '',
    status: 'active'
  });

  // Fetch plans on component mount
  useEffect(() => {
    // Mock data for demonstration
    const mockPlans = [
      {
        _id: '1',
        name: 'Basic',
        description: 'Perfect for individuals and small businesses',
        price: 19.99,
        interval: 'monthly',
        features: [
          'Up to 5 listings',
          'Basic analytics',
          'Email support',
          '1 user account'
        ],
        status: 'active',
        subscribers: 245,
        createdAt: '2023-01-15T10:30:00Z'
      },
      {
        _id: '2',
        name: 'Premium',
        description: 'Ideal for growing businesses',
        price: 29.99,
        interval: 'monthly',
        features: [
          'Up to 20 listings',
          'Advanced analytics',
          'Priority email support',
          '3 user accounts',
          'Featured listings'
        ],
        status: 'active',
        subscribers: 178,
        createdAt: '2023-01-20T14:45:00Z'
      },
      {
        _id: '3',
        name: 'Basic Annual',
        description: 'Perfect for individuals and small businesses',
        price: 199.99,
        interval: 'yearly',
        features: [
          'Up to 5 listings',
          'Basic analytics',
          'Email support',
          '1 user account'
        ],
        status: 'active',
        subscribers: 112,
        createdAt: '2023-02-05T09:15:00Z'
      },
      {
        _id: '4',
        name: 'Premium Annual',
        description: 'Ideal for growing businesses',
        price: 299.99,
        interval: 'yearly',
        features: [
          'Up to 20 listings',
          'Advanced analytics',
          'Priority email support',
          '3 user accounts',
          'Featured listings'
        ],
        status: 'active',
        subscribers: 89,
        createdAt: '2023-02-10T16:20:00Z'
      },
      {
        _id: '5',
        name: 'Enterprise',
        description: 'For large businesses with custom needs',
        price: 99.99,
        interval: 'monthly',
        features: [
          'Unlimited listings',
          'Custom analytics dashboard',
          '24/7 phone support',
          'Unlimited user accounts',
          'Featured listings',
          'API access'
        ],
        status: 'inactive',
        subscribers: 32,
        createdAt: '2023-03-12T11:10:00Z'
      }
    ];

    setTimeout(() => {
      setPlans(mockPlans);
      setLoading(false);
    }, 1000);
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Open modal for adding a new plan
  const openAddModal = () => {
    setModalMode('add');
    setFormData({
      name: '',
      description: '',
      price: '',
      interval: 'monthly',
      features: '',
      status: 'active'
    });
    setShowModal(true);
  };

  // Open modal for editing a plan
  const openEditModal = (plan) => {
    setModalMode('edit');
    setCurrentPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description,
      price: plan.price.toString(),
      interval: plan.interval,
      features: plan.features.join('\n'),
      status: plan.status
    });
    setShowModal(true);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Parse features from textarea into array
    const featuresArray = formData.features
      .split('\n')
      .map(feature => feature.trim())
      .filter(feature => feature !== '');
    
    // Parse price to number
    const priceNumber = parseFloat(formData.price);
    
    if (isNaN(priceNumber) || priceNumber <= 0) {
      toast.error('Please enter a valid price');
      return;
    }
    
    // In a real application, this would send to the API
    // For demo purposes, we'll simulate API calls
    
    if (modalMode === 'add') {
      // Simulate adding a new plan
      const newPlan = {
        _id: Date.now().toString(),
        ...formData,
        price: priceNumber,
        features: featuresArray,
        subscribers: 0,
        createdAt: new Date().toISOString()
      };
      
      setPlans([newPlan, ...plans]);
      toast.success('Plan added successfully');
    } else {
      // Simulate updating a plan
      const updatedPlans = plans.map(plan => 
        plan._id === currentPlan._id 
          ? { 
              ...plan, 
              ...formData, 
              price: priceNumber,
              features: featuresArray
            } 
          : plan
      );
      
      setPlans(updatedPlans);
      toast.success('Plan updated successfully');
    }
    
    setShowModal(false);
  };

  // Handle plan deletion
  const handleDelete = async (planId) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      // Simulate deleting a plan
      const updatedPlans = plans.filter(plan => plan._id !== planId);
      setPlans(updatedPlans);
      toast.success('Plan deleted successfully');
    }
  };

  // Format price with currency (Indian Rupee)
  const formatPrice = (price, interval) => {
    // Convert USD to INR (approximate exchange rate: 1 USD = 75 INR)
    const inrAmount = price * 75;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(inrAmount) + (interval === 'monthly' ? '/mo' : '/yr');
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Pricing Plans</h1>
        <button 
          className="btn-primary flex items-center" 
          onClick={openAddModal}
        >
          <RiAddLine className="mr-2" />
          Add New Plan
        </button>
      </div>

      {/* Plans Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No pricing plans found
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan._id} className="card-glass hover:shadow-lg transition-shadow duration-300 relative">
              {plan.status === 'inactive' && (
                <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-bl-lg">
                  Inactive
                </div>
              )}
              
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-800">{plan.name}</h3>
                <p className="text-gray-600 mt-1">{plan.description}</p>
              </div>
              
              <div className="mb-6">
                <span className="text-3xl font-bold text-primary-600">{formatPrice(plan.price, plan.interval)}</span>
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Features:</h4>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <RiCheckLine className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <RiTimeLine className="w-4 h-4 mr-1" />
                  <span>Created: {formatDate(plan.createdAt)}</span>
                </div>
                <div>
                  <span className="font-medium">{plan.subscribers}</span> subscribers
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => openEditModal(plan)}
                  className="p-2 text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
                >
                  <RiEdit2Line className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(plan._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                >
                  <RiDeleteBinLine className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Plan Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {modalMode === 'add' ? 'Add New Plan' : 'Edit Plan'}
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <RiCloseLine className="w-6 h-6" />
                  </button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Plan Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="input"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="input"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                        Price
                      </label>
                      <input
                        type="number"
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        className="input"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="interval" className="block text-sm font-medium text-gray-700 mb-1">
                        Billing Interval
                      </label>
                      <select
                        id="interval"
                        name="interval"
                        value={formData.interval}
                        onChange={handleChange}
                        className="input"
                      >
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="features" className="block text-sm font-medium text-gray-700 mb-1">
                      Features (one per line)
                    </label>
                    <textarea
                      id="features"
                      name="features"
                      value={formData.features}
                      onChange={handleChange}
                      className="input"
                      rows="5"
                      required
                    ></textarea>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="input"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      className="mr-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                    >
                      {modalMode === 'add' ? 'Add Plan' : 'Update Plan'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Plans;
