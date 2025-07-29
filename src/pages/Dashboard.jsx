// AIzaSyD7bDih_modT0qgpL23h-rj5G6cN_80AHE   APIKEY

import { useState, useEffect } from 'react';

import {
  Package,
  Clock,
  Search,
  Filter,
  Edit3,
  MessageCircle,
} from 'lucide-react';
import { useShipment } from '../context/hooks/useShipment';
// import { useAuth } from '../context/hooks/useAuth';

const AdminDashboard = () => {
  const {
    loadShipments,
    updateShipment,
    getAllChats,
    chatMessages,
    shipments,
  } = useShipment();

  // console.log(shipments);
  // const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('shipments');
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [messages, setMessages] = useState([]);

  // console.log(chatMessages);

  useEffect(() => {
    getAllChats();
    setMessages(Array.isArray(chatMessages) ? chatMessages : []);
    loadShipments();
  }, []);

  const filteredShipments = shipments.filter((shipment) => {
    const matchesSearch =
      shipment.trackingNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      shipment.sender.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.receiver.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || shipment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'in-transit':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'delayed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className='max-w-7xl mx-auto'>
      <div className='bg-white rounded-lg shadow-md'>
        <div className='border-b px-6 py-4'>
          <h1 className='text-2xl font-bold text-gray-900'>Admin Dashboard</h1>
          <p className='text-gray-600'>
            Manage shipments and view customer messages
          </p>
        </div>

        <div className='border-b px-6'>
          <nav className='flex space-x-8'>
            {[
              {
                id: 'shipments',
                label: 'All Shipments',
                icon: Package,
                count: shipments.length,
              },
              {
                id: 'messages',
                label: 'Messages',
                icon: MessageCircle,
                count: Array.isArray(messages) ? messages.length : 0,
              },
              {
                id: 'analytics',
                label: 'Analytics',
                icon: Clock,
                count: null,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className='w-5 h-5' />
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      tab.count > 0
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className='p-6'>
          {activeTab === 'shipments' && (
            <div>
              <div className='flex flex-col md:flex-row gap-4 mb-6'>
                <div className='flex-1'>
                  <div className='relative'>
                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                    <input
                      type='text'
                      placeholder='Search by tracking number, sender, or receiver...'
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>
                </div>
                <div className='flex items-center space-x-2'>
                  <Filter className='w-5 h-5 text-gray-400' />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className='px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  >
                    <option value='all'>All Status</option>
                    <option value='pending'>Pending</option>
                    <option value='in-transit'>In Transit</option>
                    <option value='delivered'>Delivered</option>
                    <option value='delayed'>Delayed</option>
                  </select>
                </div>
              </div>

              <div className='overflow-x-auto'>
                <table className='w-full border-collapse'>
                  <thead>
                    <tr className='bg-gray-50'>
                      <th className='text-left p-3 font-medium text-gray-700'>
                        Tracking Number
                      </th>
                      <th className='text-left p-3 font-medium text-gray-700'>
                        Sender
                      </th>
                      <th className='text-left p-3 font-medium text-gray-700'>
                        Receiver
                      </th>
                      <th className='text-left p-3 font-medium text-gray-700'>
                        Status
                      </th>
                      <th className='text-left p-3 font-medium text-gray-700'>
                        Current Location
                      </th>
                      <th className='text-left p-3 font-medium text-gray-700'>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredShipments.map((shipment) => (
                      <tr
                        key={shipment.trackingNumber}
                        className='border-b hover:bg-gray-50'
                      >
                        <td className='p-3 font-mono text-sm'>
                          {shipment.trackingNumber}
                        </td>
                        <td className='p-3'>
                          <div className='text-sm'>
                            <div className='font-medium'>
                              {shipment.sender.name}
                            </div>
                            <div className='text-gray-600'>
                              {shipment.sender.city}, {shipment.sender.country}
                            </div>
                          </div>
                        </td>
                        <td className='p-3'>
                          <div className='text-sm'>
                            <div className='font-medium'>
                              {shipment.receiver.name}
                            </div>
                            <div className='text-gray-600'>
                              {shipment.receiver.city},{' '}
                              {shipment.receiver.country}
                            </div>
                          </div>
                        </td>
                        <td className='p-3'>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              shipment.status
                            )}`}
                          >
                            {shipment.status.replace('-', ' ')}
                          </span>
                        </td>
                        <td className='p-3 text-sm'>
                          {/* {shipment.currentLocation} */}
                          {shipment.currentLocation?.city},{' '}
                          {shipment.currentLocation?.country}
                        </td>
                        <td className='p-3'>
                          <button
                            onClick={() => setSelectedShipment(shipment)}
                            className='text-blue-600 hover:text-blue-800 flex items-center space-x-1'
                          >
                            <Edit3 className='w-4 h-4' />
                            <span>Edit</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div>
              <h2 className='text-lg font-semibold mb-4'>Customer Messages</h2>
              <div className='space-y-4'>
                {messages.map((msg) => (
                  <div
                    key={msg.id || msg._id}
                    className='bg-gray-50 border border-gray-200 rounded-lg p-4'
                  >
                    <div className='font-medium text-gray-900'>
                      {msg.sender}
                    </div>
                    <div className='text-sm text-gray-700 mt-1'>
                      {msg.message}
                    </div>
                    <div className='text-xs text-gray-500 mt-2'>
                      {new Date(msg.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
                {messages.length === 0 && (
                  <p className='text-gray-500 text-center py-8'>No messages</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div>
              <h2 className='text-lg font-semibold mb-4'>Analytics Overview</h2>
              <div className='grid md:grid-cols-4 gap-6'>
                <div className='bg-blue-50 p-4 rounded-lg'>
                  <h3 className='font-medium text-blue-900'>Total Shipments</h3>
                  <p className='text-2xl font-bold text-blue-600'>
                    {shipments.length}
                  </p>
                </div>
                <div className='bg-green-50 p-4 rounded-lg'>
                  <h3 className='font-medium text-green-900'>Delivered</h3>
                  <p className='text-2xl font-bold text-green-600'>
                    {shipments.filter((s) => s.status === 'delivered').length}
                  </p>
                </div>
                <div className='bg-yellow-50 p-4 rounded-lg'>
                  <h3 className='font-medium text-yellow-900'>In Transit</h3>
                  <p className='text-2xl font-bold text-yellow-600'>
                    {shipments.filter((s) => s.status === 'in-transit').length}
                  </p>
                </div>
                <div className='bg-red-50 p-4 rounded-lg'>
                  <h3 className='font-medium text-red-900'>Delayed</h3>
                  <p className='text-2xl font-bold text-red-600'>
                    {shipments.filter((s) => s.status === 'delayed').length}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedShipment && (
        <EditShipmentModal
          shipment={selectedShipment}
          onClose={() => setSelectedShipment(null)}
          onUpdate={(trackingNumber, updates) => {
            updateShipment(trackingNumber, updates);
            setSelectedShipment(null);
          }}
        />
      )}
    </div>
  );
};

const EditShipmentModal = ({ shipment, onClose, onUpdate }) => {
  const [status, setStatus] = useState(shipment.status);
  const [locationCity, setLocationCity] = useState(
    shipment.currentLocation?.city || ''
  );
  const [locationCountry, setLocationCountry] = useState(
    shipment.currentLocation?.country || ''
  );
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const location = {
      city: locationCity,
      country: locationCountry,
    };

    onUpdate(shipment.trackingNumber, {
      status,
      currentLocation: location,
      description,
      trackingHistory: [
        ...shipment.trackingHistory,
        {
          status,
          location,
          description,
          timestamp: new Date().toISOString(),
        },
      ],
    });
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg p-6 w-full max-w-md'>
        <h2 className='text-xl font-bold mb-4'>Update Shipment</h2>
        <form onSubmit={handleSubmit}>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value='pending'>Pending</option>
                <option value='in-transit'>In Transit</option>
                <option value='delivered'>Delivered</option>
                <option value='delayed'>Delayed</option>
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Current Location - City
              </label>
              <input
                type='text'
                value={locationCity}
                onChange={(e) => setLocationCity(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2 mt-4'>
                Current Location - Country
              </label>
              <input
                type='text'
                value={locationCountry}
                onChange={(e) => setLocationCountry(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Additional update information...'
              />
            </div>
          </div>
          <div className='flex justify-end space-x-3 mt-6'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
            >
              Update Shipment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard;
