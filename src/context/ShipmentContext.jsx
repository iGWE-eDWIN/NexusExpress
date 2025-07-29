// context/ShipmentContext.js
import { createContext } from 'react';

const ShipmentContext = createContext(undefined); // Good: avoids accidental undefined access
export default ShipmentContext;
