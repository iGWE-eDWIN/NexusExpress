// import { useParams } from 'react-router-dom';
// import { useEffect, useState } from 'react';
// import { useShipment } from '../context/hooks/useShipment';
// import { MapPin, Package, Clock, CheckCircle, AlertCircle } from 'lucide-react';
// import {
//   MapContainer,
//   TileLayer,
//   Polyline,
//   Marker,
//   Popup,
// } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';

// const TrackingResult = () => {
//   const { trackingNumber } = useParams();
//   const { getShipmentByTracking } = useShipment();
//   const [shipment, setShipment] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [coordinates, setCoordinates] = useState([]);

//   useEffect(() => {
//     const loadShipment = async () => {
//       try {
//         setLoading(true);
//         const data = await getShipmentByTracking(trackingNumber);

//         if (data['shipment']) {
//           setShipment(data['shipment']);
//         } else {
//           setError('Shipment not found');
//         }
//       } catch (err) {
//         setError(`Error loading shipment${err}`);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadShipment();
//   }, [trackingNumber, getShipmentByTracking]);

//   useEffect(() => {
//     const fetchCoordinates = async () => {
//       if (!shipment || !Array.isArray(shipment.trackingHistory)) return;
//       const locationStrings = shipment.trackingHistory.map((e) => {
//         return `${e.location?.city || ''}, ${e.location?.country || ''}`;
//       });

//       const results = await Promise.all(
//         locationStrings.map(async (locStr) => {
//           try {
//             const res = await fetch(
//               `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
//                 locStr
//               )}`
//             );
//             const data = await res.json();
//             if (data?.[0]) {
//               return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
//             }
//           } catch (error) {
//             console.error('Error fetching coordinates:', error);
//             return null;
//           }
//           return null;
//         })
//       );
//       setCoordinates(results.filter(Boolean));
//     };

//     fetchCoordinates();
//   }, [shipment]);

//   if (loading) {
//     return (
//       <div className='max-w-2xl mx-auto text-center'>
//         <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
//         <p className='mt-4 text-gray-600'>Loading shipment details...</p>
//       </div>
//     );
//   }

//   if (error || !shipment) {
//     return (
//       <div className='max-w-2xl mx-auto text-center'>
//         <div className='bg-red-50 border border-red-200 rounded-lg p-8'>
//           <AlertCircle className='w-12 h-12 text-red-500 mx-auto mb-4' />
//           <h2 className='text-2xl font-bold text-red-700 mb-2'>
//             Shipment Not Found
//           </h2>
//           <p className='text-red-600'>
//             {error ||
//               `We couldn't find a shipment with tracking number: ${trackingNumber}`}
//           </p>
//           <p className='text-sm text-red-500 mt-2'>
//             Please check the tracking number and try again.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className='p-6 max-w-4xl mx-auto'>
//       <h2 className='text-2xl font-bold mb-6'>Tracking Result</h2>

//       {/* Basic Info */}
//       <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
//         <div className='flex items-center mb-4'>
//           <Package className='w-5 h-5 text-blue-600 mr-2' />
//           <span className='text-gray-700 font-medium'>
//             Tracking Number: {shipment.trackingNumber}
//           </span>
//         </div>

//         <div className='flex items-center mb-2'>
//           <Clock className='w-5 h-5 text-gray-500 mr-2' />
//           <span className='text-gray-700'>
//             Created: {new Date(shipment.createdAt).toLocaleString()}
//           </span>
//         </div>

//         <div className='flex items-center'>
//           <MapPin className='w-5 h-5 text-green-600 mr-2' />
//           <span className='text-gray-700'>
//             Current Location:{' '}
//             {shipment?.currentLocation?.city?.trim() &&
//             shipment?.currentLocation?.country?.trim()
//               ? `${shipment.currentLocation.city}, ${shipment.currentLocation.country}`
//               : shipment?.trackingHistory?.length
//               ? (() => {
//                   const lastEntry =
//                     shipment.trackingHistory[
//                       shipment.trackingHistory.length - 1
//                     ];
//                   return lastEntry?.location?.city &&
//                     lastEntry?.location?.country
//                     ? `${lastEntry.location.city}, ${lastEntry.location.country}`
//                     : 'Not Available';
//                 })()
//               : 'Not Available'}
//           </span>
//         </div>
//       </div>

//       {/* Tracking Timeline (REVERSED ORDER) */}
//       <div className='bg-white rounded-lg shadow-md p-6'>
//         <h3 className='font-semibold text-gray-700 mb-4'>Tracking History</h3>
//         <div className='relative border-l-2 border-blue-300 pl-6 space-y-6'>
//           {Array.isArray(shipment?.trackingHistory) &&
//             [...shipment.trackingHistory].reverse().map((event, index) => {
//               const isMostRecent = index === 0;
//               const locationString =
//                 event?.location?.city && event?.location?.country
//                   ? `${event.location.city}, ${event.location.country}`
//                   : 'Location not specified';

//               return (
//                 <div key={index} className='relative pl-4 mb-6'>
//                   {/* Dot */}
//                   <span
//                     className={`absolute -left-1 top-1 w-4 h-4 rounded-full ${
//                       isMostRecent ? 'bg-green-600' : 'bg-blue-500'
//                     }`}
//                   ></span>

//                   {/* Content */}
//                   <div>
//                     <p className='font-medium text-gray-800'>{event.status}</p>
//                     <p className='text-sm text-gray-600'>{locationString}</p>

//                     {event.description && (
//                       <p className='text-sm text-gray-500 mt-1'>
//                         {event.description}
//                       </p>
//                     )}
//                     <p className='text-xs text-gray-400 mt-1'>
//                       {new Date(event.timestamp).toLocaleString()}
//                     </p>

//                     {isMostRecent && (
//                       <p className='text-xs text-green-600 font-bold mt-1'>
//                         ← Current Location
//                       </p>
//                     )}
//                   </div>
//                 </div>
//               );
//             })}
//         </div>
//       </div>
//       {/* Map with Polyline */}
//       {coordinates.length >= 2 && (
//         <MapContainer
//           center={coordinates[coordinates.length - 1]}
//           zoom={6}
//           scrollWheelZoom={false}
//           className='h-96 rounded-lg shadow-md mb-6'
//         >
//           <TileLayer
//             attribution='&copy; OpenStreetMap contributors'
//             url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
//           />
//           <Polyline positions={coordinates} color='blue' />
//           {coordinates.map((pos, idx) => (
//             <Marker key={idx} position={pos}>
//               <Popup>
//                 {shipment.trackingHistory[idx]?.location?.city},{' '}
//                 {shipment.trackingHistory[idx]?.location?.country}
//               </Popup>
//             </Marker>
//           ))}
//         </MapContainer>
//       )}

//       {/* Delivery Status */}
//       {shipment.status === 'delivered' && (
//         <div className='mt-6 p-4 bg-green-100 text-green-800 rounded-md text-center font-semibold'>
//           Shipment has been delivered successfully.
//         </div>
//       )}
//     </div>
//   );
// };

// export default TrackingResult;
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useShipment } from '../context/hooks/useShipment';
import {
  MapPin,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  Truck,
  Home,
  Warehouse,
  Calendar,
  User,
  Box,
} from 'lucide-react';

import 'leaflet/dist/leaflet.css';

const TrackingResult = () => {
  const { trackingNumber } = useParams();
  const { getShipmentByTracking } = useShipment();
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [coordinates, setCoordinates] = useState([]);

  useEffect(() => {
    const loadShipment = async () => {
      try {
        setLoading(true);
        const data = await getShipmentByTracking(trackingNumber);
        // console.log('Shipment data:', data['shipment']);

        if (data['shipment']) {
          setShipment(data['shipment']);
        } else {
          setError('Shipment not found');
        }
      } catch (err) {
        setError(`Error loading shipment${err}`);
      } finally {
        setLoading(false);
      }
    };

    loadShipment();
  }, [trackingNumber, getShipmentByTracking]);

  useEffect(() => {
    const fetchCoordinates = async () => {
      if (!shipment || !Array.isArray(shipment.trackingHistory)) return;
      const locationStrings = shipment.trackingHistory.map((e) => {
        return `${e.location?.city || ''}, ${e.location?.country || ''}`;
      });

      const results = await Promise.all(
        locationStrings.map(async (locStr) => {
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                locStr
              )}`
            );
            const data = await res.json();
            if (data?.[0]) {
              return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
            }
          } catch (error) {
            console.error('Error fetching coordinates:', error);
            return null;
          }
          return null;
        })
      );
      setCoordinates(results.filter(Boolean));
    };

    fetchCoordinates();
  }, [shipment]);

  // const formatWeight = (weight) => {
  //   if (!weight) return 'Not specified';
  //   if (typeof weight === 'object') {
  //     return `${weight.value || ''} ${weight.unit || ''}`.trim();
  //   }
  //   return weight;
  // };

  // const formatDimensions = (dimensions) => {
  //   if (!dimensions) return 'Not specified';
  //   if (typeof dimensions === 'object') {
  //     return `${dimensions.length || ''} × ${dimensions.width || ''} × ${
  //       dimensions.height || ''
  //     } ${dimensions.unit || ''}`.trim();
  //   }
  //   return dimensions;
  // };

  const formatLocation = (location) => {
    if (!location) return 'Not specified';
    if (typeof location === 'object') {
      return `${location.city || ''}, ${location.country || ''}`.trim();
    }
    return location;
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-white-100 to-white-100 flex items-center justify-center'>
        <div className='max-w-2xl mx-auto text-center bg-white p-8 rounded-xl shadow-lg'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading shipment details...</p>
        </div>
      </div>
    );
  }

  if (error || !shipment) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center'>
        <div className='max-w-2xl mx-auto text-center bg-white p-8 rounded-xl shadow-lg'>
          <div className='bg-red-50 border border-red-200 rounded-lg p-8'>
            <AlertCircle className='w-12 h-12 text-red-500 mx-auto mb-4' />
            <h2 className='text-2xl font-bold text-red-700 mb-2'>
              Shipment Not Found
            </h2>
            <p className='text-red-600'>
              {error ||
                `We couldn't find a shipment with tracking number: ${trackingNumber}`}
            </p>
            <p className='text-sm text-red-500 mt-2'>
              Please check the tracking number and try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {' '}
      <div className='min-h-screen bg-gradient-to-br from-white-100 to-white-100 py-8 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-6xl mx-auto'>
          {/* Header Section */}
          <div className='text-center mb-8'>
            <h1 className='text-3xl font-bold text-gray-800 mb-2'>
              Shipment Tracking
            </h1>
            <p className='text-gray-600'>Track your package in real-time</p>
          </div>

          {/* Main Tracking Card */}
          <div className='bg-white rounded-xl shadow-lg overflow-hidden mb-8'>
            {/* Status Bar */}
            <div
              className={`bg-${
                shipment.status === 'delivered' ? 'green' : 'blue'
              }-500 text-white p-4`}
            >
              <div className='flex justify-between items-center'>
                <div>
                  <h2 className='text-xl font-bold'>
                    Tracking Number: {shipment.trackingNumber}
                  </h2>
                  <p className='text-sm opacity-90'>
                    Last updated:{' '}
                    {new Date(
                      shipment.updatedAt || shipment.createdAt
                    ).toLocaleString()}
                  </p>
                </div>
                <div className='bg-white/20 px-4 py-2 rounded-full text-sm font-semibold'>
                  {shipment.status.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Shipment Overview */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border-b'>
              <div className='flex items-start space-x-4'>
                <div className='bg-blue-100 p-3 rounded-full'>
                  <Box className='w-5 h-5 text-blue-600' />
                </div>
                <div>
                  <h3 className='text-sm font-medium text-gray-500'>Package</h3>
                  <p className='font-medium'>
                    {shipment.packageType || 'Standard'}
                  </p>
                </div>
              </div>

              <div className='flex items-start space-x-4'>
                <div className='bg-green-100 p-3 rounded-full'>
                  <User className='w-5 h-5 text-green-600' />
                </div>
                <div>
                  <h3 className='text-sm font-medium text-gray-500'>
                    Recipient
                  </h3>
                  <p className='font-medium'>
                    {shipment.receiver.name || 'Not specified'}
                  </p>
                </div>
              </div>

              <div className='flex items-start space-x-4'>
                <div className='bg-purple-100 p-3 rounded-full'>
                  <Calendar className='w-5 h-5 text-purple-600' />
                </div>
                <div>
                  <h3 className='text-sm font-medium text-gray-500'>
                    Estimated Delivery
                  </h3>
                  <p className='font-medium'>
                    {shipment.estimatedDelivery
                      ? new Date(
                          shipment.estimatedDelivery
                        ).toLocaleDateString()
                      : 'Calculating...'}
                  </p>
                </div>
              </div>
            </div>

            {/* Map Section */}
            {/* {coordinates.length >= 2 && (
            <div className='p-4 border-b'>
              <h3 className='text-lg font-semibold text-gray-800 mb-4'>
                Shipment Route
              </h3>
              <MapContainer
                center={coordinates[coordinates.length - 1]}
                zoom={6}
                scrollWheelZoom={true}
                className='h-96 rounded-lg shadow-md'
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                />
                <Polyline positions={coordinates} color='blue' />
                {coordinates.map((pos, idx) => (
                  <Marker key={idx} position={pos}>
                    <Popup>
                      {shipment.trackingHistory[idx]?.location?.city},{' '}
                      {shipment.trackingHistory[idx]?.location?.country}
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          )} */}

            {/* Tracking Timeline */}
            <div className='p-6'>
              <h3 className='text-lg font-semibold text-gray-800 mb-6'>
                Tracking History
              </h3>
              <div className='relative space-y-8'>
                {Array.isArray(shipment?.trackingHistory) &&
                  [...shipment.trackingHistory]
                    .reverse()
                    .map((event, index) => {
                      const isMostRecent = index === 0;
                      const locationString = formatLocation(event?.location);

                      return (
                        <div key={index} className='relative pl-10'>
                          {/* Icon */}
                          <div
                            className={`absolute left-0 top-0 flex items-center justify-center w-8 h-8 rounded-full ${
                              isMostRecent
                                ? 'bg-green-100 text-green-600'
                                : 'bg-blue-100 text-blue-600'
                            }`}
                          >
                            {event.status
                              .toLowerCase()
                              .includes('delivered') ? (
                              <CheckCircle className='w-5 h-5' />
                            ) : event.status
                                .toLowerCase()
                                .includes('shipped') ? (
                              <Truck className='w-5 h-5' />
                            ) : event.status
                                .toLowerCase()
                                .includes('processed') ? (
                              <Warehouse className='w-5 h-5' />
                            ) : (
                              <MapPin className='w-5 h-5' />
                            )}
                          </div>

                          {/* Content */}
                          <div className='bg-gray-50 p-4 rounded-lg'>
                            <div className='flex justify-between items-start'>
                              <div>
                                <p className='font-medium text-gray-800'>
                                  {event.status}
                                </p>
                                <p className='text-sm text-gray-600 mt-1'>
                                  <MapPin className='inline w-4 h-4 mr-1' />
                                  {locationString}
                                </p>
                              </div>
                              <p className='text-xs text-gray-500 whitespace-nowrap'>
                                {new Date(event.timestamp).toLocaleString()}
                              </p>
                            </div>

                            {event.description && (
                              <p className='text-sm text-gray-600 mt-2 pl-5 border-l-2 border-gray-200'>
                                {event.description}
                              </p>
                            )}

                            {isMostRecent && (
                              <span className='inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full'>
                                Current Location
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
              </div>
            </div>
          </div>

          {/* Additional Shipment Details */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
            {/* Origin/Destination */}
            <div className='bg-white rounded-xl shadow-md p-6'>
              <h3 className='text-lg font-semibold text-gray-800 mb-4'>
                Route Details
              </h3>
              <div className='space-y-4'>
                <div className='flex items-start space-x-4'>
                  <div className='bg-blue-100 p-2 rounded-full'>
                    <Home className='w-5 h-5 text-blue-600' />
                  </div>
                  <div>
                    <h4 className='text-sm font-medium text-gray-500'>
                      Origin
                    </h4>
                    <p className='font-medium'>
                      {formatLocation(shipment.sender)}
                    </p>
                  </div>
                </div>
                <div className='flex items-start space-x-4'>
                  <div className='bg-green-100 p-2 rounded-full'>
                    <MapPin className='w-5 h-5 text-green-600' />
                  </div>
                  <div>
                    <h4 className='text-sm font-medium text-gray-500'>
                      Destination
                    </h4>
                    <p className='font-medium'>
                      {formatLocation(shipment.receiver)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Package Details */}
            {/* <div className='bg-white rounded-xl shadow-md p-6'>
            <h3 className='text-lg font-semibold text-gray-800 mb-4'>
              Package Details
            </h3>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <h4 className='text-sm font-medium text-gray-500'>Weight</h4>
                <p className='font-medium'>{formatWeight(shipment.weight)}</p>
              </div>
              <div>
                <h4 className='text-sm font-medium text-gray-500'>
                  Dimensions
                </h4>
                <p className='font-medium'>
                  {formatDimensions(shipment.dimensions)}
                </p>
              </div>
              <div>
                <h4 className='text-sm font-medium text-gray-500'>Carrier</h4>
                <p className='font-medium'>
                  {shipment.carrier || 'Standard Shipping'}
                </p>
              </div>
              <div>
                <h4 className='text-sm font-medium text-gray-500'>Service</h4>
                <p className='font-medium'>{shipment.service || 'Regular'}</p>
              </div>
            </div>
          </div> */}
          </div>

          {/* Delivery Status Banner */}
          {shipment.status === 'delivered' && (
            <div className='bg-green-50 border border-green-200 rounded-xl p-6 text-center'>
              <div className='flex flex-col items-center'>
                <CheckCircle className='w-10 h-10 text-green-500 mb-2' />
                <h3 className='text-xl font-bold text-green-800 mb-1'>
                  Delivered Successfully
                </h3>
                <p className='text-green-600'>
                  Your package was delivered on{' '}
                  {new Date(
                    shipment.deliveredAt || shipment.updatedAt
                  ).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Footer */}
      <footer className='bg-gray-900 text-gray-300 pt-16 pb-8 border-t border-gray-800'>
        <div className='max-w-7xl mx-auto px-6'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-10 mb-12'>
            <div>
              <h3 className='text-white text-xl font-bold mb-4'>
                Nexus Express
              </h3>
              <p className='mb-4'>
                Delivering peace of mind, one parcel at a time.
              </p>
              <div className='flex space-x-4'>
                {['twitter', 'facebook', 'linkedin', 'instagram'].map(
                  (social) => (
                    <a
                      key={social}
                      href={`#${social}`}
                      className='text-gray-400 hover:text-white transition'
                    >
                      <span className='sr-only'>{social}</span>
                      <svg
                        className='h-6 w-6'
                        fill='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          d={`M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z`}
                        />
                      </svg>
                    </a>
                  )
                )}
              </div>
            </div>
            <div>
              <h4 className='text-white font-semibold mb-4'>Services</h4>
              <ul className='space-y-2'>
                {[
                  'Local Delivery',
                  'International Shipping',
                  'Warehousing',
                  'Supply Chain',
                ].map((item) => (
                  <li key={item}>
                    <a
                      href={`#${item.toLowerCase().replace(' ', '-')}`}
                      className='hover:text-white transition'
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className='text-white font-semibold mb-4'>Contact</h4>
              <address className='not-italic'>
                <p className='mb-2'>123 Shipping Lane</p>
                <p className='mb-2'>Logistics City, LC 12345</p>
                <p className='mb-2'>Email: support@nexusexpress.com</p>
                <p>Phone: +1 (440) 281‑7685</p>
              </address>
            </div>
          </div>
          <div className='pt-8 border-t border-gray-800 text-center text-sm'>
            © {new Date().getFullYear()} Nexus Express. All rights reserved. |
            <a href='#privacy' className='hover:text-white ml-2'>
              Privacy Policy
            </a>{' '}
            |
            <a href='#terms' className='hover:text-white ml-2'>
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TrackingResult;
