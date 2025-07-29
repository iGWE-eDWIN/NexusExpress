import { useReducer, useEffect, useCallback } from 'react';
import { shipmentsAPI, chatAPI } from '../services/api';
import ShipmentContext from './ShipmentContext';
import SocketService from '../services/socket';

const initialState = {
  shipments: [],
  chatMessages: [],
  activeChats: [], // For admin to track open chats
  loading: false,
  error: null,
};

const shipmentReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_SHIPMENTS':
      return { ...state, shipments: action.payload };
    case 'ADD_SHIPMENT':
      return { ...state, shipments: [action.payload, ...state.shipments] };
    case 'UPDATE_SHIPMENT':
      return {
        ...state,
        shipments: state.shipments.map((shipment) =>
          shipment._id === action.payload._id ? action.payload : shipment
        ),
      };
    case 'SET_CHAT_MESSAGES':
      return {
        ...state,
        chatMessages: Array.isArray(action.payload) ? action.payload : [],
      };
    case 'APPEND_CHAT_MESSAGE':
      return {
        ...state,
        chatMessages: [...state.chatMessages, action.payload],
      };
    case 'ADD_ACTIVE_CHAT':
      return {
        ...state,
        activeChats: state.activeChats.some(
          (chat) => chat.id === action.payload.id
        )
          ? state.activeChats
          : [...state.activeChats, action.payload],
      };
    case 'REMOVE_ACTIVE_CHAT':
      return {
        ...state,
        activeChats: state.activeChats.filter(
          (chat) => chat.id !== action.payload
        ),
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

export const ShipmentProvider = ({ children, isAdmin = false }) => {
  const [state, dispatch] = useReducer(shipmentReducer, initialState);

  // Handle new messages and chat updates
  const handleNewMessage = useCallback(
    (message) => {
      dispatch({ type: 'APPEND_CHAT_MESSAGE', payload: message });

      // For admin: track active chats
      if (isAdmin && message.room) {
        dispatch({
          type: 'ADD_ACTIVE_CHAT',
          payload: {
            id: message.room,
            name: message.username || message.trackingNumber || 'General Chat',
            lastMessage: message.content,
            timestamp: message.timestamp,
            isGeneral: message.isGeneral,
            unread: true,
          },
        });
      }
    },
    [isAdmin]
  );

  // Handle shipment updates
  const handleTrackingUpdate = useCallback((update) => {
    dispatch({ type: 'UPDATE_SHIPMENT', payload: update });
  }, []);

  // Initialize socket connection and listeners
  useEffect(() => {
    SocketService.connect();

    if (isAdmin) {
      SocketService.emit('join-admin');
    } else {
      SocketService.emit('join-general');
    }

    SocketService.onNewMessage(handleNewMessage);
    SocketService.on('tracking-updated', handleTrackingUpdate);

    // For admin: listen for new chat connections
    if (isAdmin) {
      SocketService.on('new-chat-started', (chatInfo) => {
        dispatch({
          type: 'ADD_ACTIVE_CHAT',
          payload: {
            id: chatInfo.room,
            name:
              chatInfo.username || chatInfo.trackingNumber || 'General Chat',
            isGeneral: chatInfo.isGeneral,
            unread: true,
          },
        });
      });
    }

    return () => {
      // SocketService.offMessageReceived();
      // SocketService.offTrackingUpdated();
      SocketService.offNewMessage(handleNewMessage);
      SocketService.off('tracking-updated', handleTrackingUpdate);
      if (isAdmin) {
        SocketService.off('new-chat-started');
      }
      SocketService.disconnect();
    };
  }, [isAdmin, handleNewMessage, handleTrackingUpdate]);

  const loadShipments = async (params = {}) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await shipmentsAPI.getAll(params);
      // console.log(response.data.shipments);
      dispatch({ type: 'SET_SHIPMENTS', payload: response.data.shipments });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const getShipmentByTracking = async (trackingNumber) => {
    try {
      const response = await shipmentsAPI.getByTracking(trackingNumber);
      if (!isAdmin) {
        SocketService.emit('join-tracking', trackingNumber);
      }
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return null;
    }
  };

  const addShipment = async (shipmentData) => {
    try {
      const response = await shipmentsAPI.create(shipmentData);
      // console.log(response.data.shipment);
      const newShipment = response.data.shipment;
      dispatch({ type: 'ADD_SHIPMENT', payload: newShipment });
      return newShipment.trackingNumber;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const updateShipment = async (id, updates) => {
    // console.log('Updating shipment:', id, updates);
    const {
      status,
      currentLocation: { city, country },
      description,
    } = updates;
    // console.log('Update details:', status, city, country, description);
    const upd = {
      status,
      city,
      country,
      description,
      trackingHistory: [
        ...updates.trackingHistory,
        {
          status,
          location: { city, country },
          description,
          timestamp: new Date(),
        },
      ],
    };
    try {
      const response = await shipmentsAPI.update(id, upd);
      console.log('Updated shipment:', response.data.shipment);
      dispatch({ type: 'UPDATE_SHIPMENT', payload: response.data.shipment });

      // Notify tracking room about update
      if (response.data.shipment.trackingNumber) {
        SocketService.emit('shipment-updated', {
          trackingNumber: response.data.shipment.trackingNumber,
          update: response.data.shipment,
        });
      }

      return response.data.shipment;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // 🔹 Admin fetch all chats
  const getAllChats = async () => {
    try {
      const res = await chatAPI.getAllChats();
      // console.log('Fetched chats:', res.data.chats[0]['messages']);
      dispatch({
        type: 'SET_CHAT_MESSAGES',
        payload: res.data.chats[0]['messages'],
      });
      return res.data.chats[0]['messages'] || [];
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
      return [];
    }
  };

  // 🔹 Fetch messages in a chat room (join via socket + optionally fetch from DB)
  const getChatMessages = async (identifier, isGeneral = false) => {
    try {
      const room = isGeneral
        ? `general-${identifier}`
        : `tracking-${identifier}`;

      SocketService.emit('join-room', room);

      const res = await chatAPI.getChat(identifier);
      const messages = res.data?.messages || [];

      dispatch({ type: 'SET_CHAT_MESSAGES', payload: messages });
      return messages;
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
      return [];
    }
  };

  const sendChatMessage = async (
    messageData,
    identifier,
    isGeneral = false
  ) => {
    console.log('Sending chat message:', messageData);
    try {
      const room = isGeneral
        ? `general-${identifier}`
        : `tracking-${identifier}`;

      const sender = isAdmin
        ? 'Admin'
        : isGeneral
        ? identifier
        : `User-${identifier}`;

      const socketMessage = {
        ...messageData,
        sender,
        room,
        isAdmin,
        isGeneral,
        username: isGeneral ? identifier : undefined,
        trackingNumber: isGeneral ? undefined : identifier,
      };

      // SocketService.emit('send-chat-message', socketMessage);
      SocketService.sendMessage(socketMessage);
      dispatch({ type: 'APPEND_CHAT_MESSAGE', payload: socketMessage });

      return socketMessage;
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
      throw err;
    }
  };

  const markChatAsRead = (chatId) => {
    dispatch({
      type: 'UPDATE_ACTIVE_CHAT',
      payload: {
        id: chatId,
        updates: { unread: false },
      },
    });
  };

  const value = {
    ...state,
    loadShipments,
    getShipmentByTracking,
    addShipment,
    updateShipment,
    getChatMessages,
    sendChatMessage,
    markChatAsRead,
    getAllChats,
    chatMessages: state.chatMessages,
    shipments: state.shipments,
    isAdmin,
  };

  return (
    <ShipmentContext.Provider value={value}>
      {children}
    </ShipmentContext.Provider>
  );
};
