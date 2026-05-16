import { collection, addDoc, getDocs, query, where, orderBy, updateDoc, doc, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase/config';

const ticketsCollection = () => collection(db, 'tickets');

const generateTicketId = () => `LIT-${Math.floor(1000 + Math.random() * 9000)}`;

export const createTicket = async ({ name, phone, issue, orderId, userId }) => {
  if (!db) throw new Error('Firestore is not configured.');
  
  const payload = {
    ticketId: generateTicketId(),
    name: name || '',
    phone: phone || '',
    issue: issue || '',
    orderId: orderId || null,
    userId: userId || null,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    messages: [
      {
        sender: 'user',
        text: issue,
        timestamp: new Date().toISOString()
      }
    ]
  };

  const ticketRef = await addDoc(ticketsCollection(), payload);
  return {
    id: ticketRef.id,
    ...payload,
  };
};

export const fetchTickets = async (filter = {}) => {
  if (!db) return [];
  let q = query(ticketsCollection(), orderBy('createdAt', 'desc'));
  
  if (filter.orderId && filter.userId) {
    // Compound query: find tickets for this order that belong to this user
    q = query(ticketsCollection(),
      where('orderId', '==', filter.orderId),
      where('userId', '==', filter.userId),
      orderBy('createdAt', 'desc'));
  } else if (filter.orderId) {
    q = query(ticketsCollection(), where('orderId', '==', filter.orderId), orderBy('createdAt', 'desc'));
  } else if (filter.userId) {
    q = query(ticketsCollection(), where('userId', '==', filter.userId), orderBy('createdAt', 'desc'));
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
};

export const addMessageToTicket = async (id, text, sender = 'admin') => {
  if (!db || !id) return null;
  const ticketRef = doc(db, 'tickets', id);
  
  const newMessage = {
    sender,
    text,
    timestamp: new Date().toISOString()
  };

  await updateDoc(ticketRef, {
    messages: arrayUnion(newMessage),
    updatedAt: serverTimestamp(),
    status: sender === 'admin' ? 'replied' : 'pending'
  });

  return newMessage;
};

export const resolveTicket = async (id) => {
  if (!db || !id) return null;
  const ticketRef = doc(db, 'tickets', id);
  await updateDoc(ticketRef, { 
    status: 'resolved',
    updatedAt: serverTimestamp()
  });
  return id;
};

export const closeTicket = async (id) => {
  if (!db || !id) return null;
  const ticketRef = doc(db, 'tickets', id);
  await updateDoc(ticketRef, { 
    status: 'closed',
    updatedAt: serverTimestamp()
  });
  return id;
};
