import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShipment } from '../context/hooks/useShipment';
import { Package, User, MapPin } from 'lucide-react';

const CreateShipment = () => {
  const { addShipment } = useShipment();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    service: 'express',
    weight: '',
    dimensions: '',
    sender: {
      name: '',
      address: '',
      city: '',
      country: '',
      phone: '',
      email: '',
    },
    receiver: {
      name: '',
      address: '',
      city: '',
      country: '',
      phone: '',
      email: '',
    },
  });

  const handleInputChange = (section, field, value) => {
    if (section) {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addShipment(formData);
    navigate('/admin');
  };

  return (
    <div className='max-w-4xl mx-auto'>
      <div className='bg-white rounded-lg shadow-md p-6'>
        <h1 className='text-2xl font-bold text-gray-900 mb-6'>
          Create New Shipment
        </h1>

        <form onSubmit={handleSubmit} className='space-y-8'>
          {/* Service Selection */}
          <div className='border-b pb-6'>
            <h2 className='text-lg font-semibold text-gray-700 mb-4 flex items-center space-x-2'>
              <Package className='w-5 h-5 text-blue-600' />
              <span>Service Type</span>
            </h2>
            <div className='grid md:grid-cols-3 gap-4'>
              {[
                {
                  value: 'express',
                  label: 'Express Delivery',
                  price: '$25',
                  time: '1-2 days',
                },
                {
                  value: 'standard',
                  label: 'Standard Shipping',
                  price: '$15',
                  time: '3-5 days',
                },
                {
                  value: 'economy',
                  label: 'Economy',
                  price: '$10',
                  time: '7-10 days',
                },
              ].map((service) => (
                <label key={service.value} className='cursor-pointer'>
                  <input
                    type='radio'
                    name='service'
                    value={service.value}
                    checked={formData.service === service.value}
                    onChange={(e) =>
                      handleInputChange(null, 'service', e.target.value)
                    }
                    className='sr-only'
                  />
                  <div
                    className={`border-2 rounded-lg p-4 transition-colors ${
                      formData.service === service.value
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <h3 className='font-semibold'>{service.label}</h3>
                    <p className='text-sm text-gray-600'>{service.time}</p>
                    <p className='text-lg font-bold text-blue-600'>
                      {service.price}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Package Details */}
          <div className='border-b pb-6'>
            <h2 className='text-lg font-semibold text-gray-700 mb-4'>
              Package Details
            </h2>
            <div className='grid md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Weight (kg)
                </label>
                <input
                  type='number'
                  step='0.1'
                  required
                  value={formData.weight}
                  onChange={(e) =>
                    handleInputChange(null, 'weight', e.target.value)
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Dimensions (L x W x H cm)
                </label>
                <input
                  type='text'
                  required
                  placeholder='30 x 20 x 15'
                  value={formData.dimensions}
                  onChange={(e) =>
                    handleInputChange(null, 'dimensions', e.target.value)
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
            </div>
          </div>

          {/* Sender Information */}
          <div className='border-b pb-6'>
            <h2 className='text-lg font-semibold text-gray-700 mb-4 flex items-center space-x-2'>
              <User className='w-5 h-5 text-blue-600' />
              <span>Sender Information</span>
            </h2>
            <div className='grid md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Full Name
                </label>
                <input
                  type='text'
                  required
                  value={formData.sender.name}
                  onChange={(e) =>
                    handleInputChange('sender', 'name', e.target.value)
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Phone
                </label>
                <input
                  type='tel'
                  required
                  value={formData.sender.phone}
                  onChange={(e) =>
                    handleInputChange('sender', 'phone', e.target.value)
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Address
                </label>
                <input
                  type='text'
                  required
                  value={formData.sender.address}
                  onChange={(e) =>
                    handleInputChange('sender', 'address', e.target.value)
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  City
                </label>
                <input
                  type='text'
                  required
                  value={formData.sender.city}
                  onChange={(e) =>
                    handleInputChange('sender', 'city', e.target.value)
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Country
                </label>
                <input
                  type='text'
                  required
                  value={formData.sender.country}
                  onChange={(e) =>
                    handleInputChange('sender', 'country', e.target.value)
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
            </div>
          </div>

          {/* Receiver Information */}
          <div className='border-b pb-6'>
            <h2 className='text-lg font-semibold text-gray-700 mb-4 flex items-center space-x-2'>
              <MapPin className='w-5 h-5 text-blue-600' />
              <span>Receiver Information</span>
            </h2>
            <div className='grid md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Full Name
                </label>
                <input
                  type='text'
                  required
                  value={formData.receiver.name}
                  onChange={(e) =>
                    handleInputChange('receiver', 'name', e.target.value)
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Phone
                </label>
                <input
                  type='tel'
                  required
                  value={formData.receiver.phone}
                  onChange={(e) =>
                    handleInputChange('receiver', 'phone', e.target.value)
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Address
                </label>
                <input
                  type='text'
                  required
                  value={formData.receiver.address}
                  onChange={(e) =>
                    handleInputChange('receiver', 'address', e.target.value)
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  City
                </label>
                <input
                  type='text'
                  required
                  value={formData.receiver.city}
                  onChange={(e) =>
                    handleInputChange('receiver', 'city', e.target.value)
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Country
                </label>
                <input
                  type='text'
                  required
                  value={formData.receiver.country}
                  onChange={(e) =>
                    handleInputChange('receiver', 'country', e.target.value)
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className='flex justify-end'>
            <button
              type='submit'
              className='bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2'
            >
              <Package className='w-5 h-5' />
              <span>Create Shipment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateShipment;
