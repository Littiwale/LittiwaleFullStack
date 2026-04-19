import { collection, addDoc, getDocs, query, orderBy, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

const ticketsCollection = () => collection(db, 'tickets');

const generateTicketId = () => `LIT-${Math.floor(1000 + Math.random() * 9000)}`;

export const createTicket = async ({ name, phone, issue }) => {
  if (!db) throw new Error('Firestore is not configured.');
  const payload = {
    ticketId: generateTicketId(),
    name: name || '',
    phone: phone || '',
    issue: issue || '',
    status: 'pending',
    createdAt: serverTimestamp(),
  };

  const ticketRef = await addDoc(ticketsCollection(), payload);
  return {
    id: ticketRef.id,
    ...payload,
  };
};

export const fetchTickets = async () => {
  if (!db) return [];
  const q = query(ticketsCollection(), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
};

export const resolveTicket = async (ticketId) => {
  if (!db || !ticketId) return null;
  const ticketRef = doc(db, 'tickets', ticketId);
  await updateDoc(ticketRef, { status: 'resolved' });
  return ticketId;
};
