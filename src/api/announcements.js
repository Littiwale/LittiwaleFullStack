import { db } from '../firebase/config'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'

export const fetchAnnouncements = async () => {
    try {
        const announcementsRef = collection(db, 'announcements')
        const q = query(
            announcementsRef,
            where('active', '==', true),
            orderBy('createdAt', 'desc')
        )
        const snapshot = await getDocs(q)
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (error) {
        console.error('Error fetching announcements:', error)
        return []
    }
}
