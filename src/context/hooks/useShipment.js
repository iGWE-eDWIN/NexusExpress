import { useContext } from 'react';
import ShipmentContext from '../ShipmentContext';

export const useShipment = () => {
  const context = useContext(ShipmentContext);
  if (!context) {
    throw new Error('useShipment must be used within ShipmentProvider');
  }
  return context;
};
