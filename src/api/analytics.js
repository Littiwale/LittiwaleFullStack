import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Fetches and processes analytics data for the last 30 days
 */
export const fetchAnalyticsData = async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const ordersRef = collection(db, 'orders');
    const q = query(
        ordersRef, 
        where('createdAt', '>=', Timestamp.fromDate(thirtyDaysAgo)),
        orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Filter to included statuses
    const validOrders = orders.filter(o => ['PLACED', 'DELIVERED', 'RECEIVED', 'PREPARING', 'OUT_FOR_DELIVERY'].includes(o.status));

    const metrics = {
        totalRevenue: 0,
        totalOrders: validOrders.length,
        todayOrders: 0,
        yesterdayOrders: 0,
        dailyStats: {}, // { 'YYYY-MM-DD': { revenue: 0, orders: 0 } }
        topItems: {},   // { 'Item Name': quantity }
        customers: {}   // { 'Email/Phone': count }
    };

    const today = new Date().toISOString().split('T')[0];
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().split('T')[0];

    validOrders.forEach(order => {
        const dateStr = order.createdAt?.toDate ? order.createdAt.toDate().toISOString().split('T')[0] : today;
        
        // 1. Revenue & Orders Trend
        if (!metrics.dailyStats[dateStr]) metrics.dailyStats[dateStr] = { revenue: 0, orders: 0 };
        metrics.dailyStats[dateStr].revenue += order.total;
        metrics.dailyStats[dateStr].orders += 1;
        metrics.totalRevenue += order.total;

        // 2. Today vs Yesterday Comparison
        if (dateStr === today) metrics.todayOrders += 1;
        if (dateStr === yesterday) metrics.yesterdayOrders += 1;

        // 3. Top Selling Items
        order.items.forEach(item => {
            const name = `${item.name} (${item.variant})`;
            metrics.topItems[name] = (metrics.topItems[name] || 0) + item.quantity;
        });

        // 4. Repeat Customers
        const customerId = order.customer.phone || order.customer.email;
        if (customerId) {
            if (!metrics.customers[customerId]) {
                metrics.customers[customerId] = { name: order.customer.name, count: 0 };
            }
            metrics.customers[customerId].count += 1;
        }
    });

    return metrics;
};
