import { db } from '../config/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

export const AnalyticsService = {
    // Get distribution of issues by status (Open, In Progress, Resolved)
    getStatusDistribution: async () => {
        try {
            const issuesRef = collection(db, 'issues');
            const snapshot = await getDocs(issuesRef);

            const distribution = {
                Open: 0,
                'In Progress': 0,
                Resolved: 0,
                Other: 0
            };

            snapshot.forEach(doc => {
                const status = doc.data().status;
                if (distribution[status] !== undefined) {
                    distribution[status]++;
                } else {
                    distribution.Other++;
                }
            });

            // Format for Pie Chart
            return Object.keys(distribution).map(status => ({
                name: status,
                count: distribution[status],
                color: getColorForStatus(status),
                legendFontColor: "#7F7F7F",
                legendFontSize: 15
            })).filter(item => item.count > 0);

        } catch (error) {
            console.error("Error fetching status distribution:", error);
            return [];
        }
    },

    // Get number of issues created per day for the last 7 days
    getWeeklyTrend: async () => {
        try {
            const issuesRef = collection(db, 'issues');
            // Optimally we would query only last 7 days, but for simple MVP getting all and filtering in JS is okay for small datasets
            const q = query(issuesRef, orderBy('createdAt', 'asc'));
            const snapshot = await getDocs(q);

            const last7Days = getLast7Days();
            const counts = new Array(7).fill(0);

            snapshot.forEach(doc => {
                const createdAt = new Date(doc.data().createdAt);
                const dateString = createdAt.toISOString().split('T')[0];

                const index = last7Days.indexOf(dateString);
                if (index !== -1) {
                    counts[index]++;
                }
            });

            return {
                labels: last7Days.map(date => date.substring(5)), // MM-DD
                datasets: [{
                    data: counts
                }]
            };

        } catch (error) {
            console.error("Error fetching weekly trend:", error);
            return { labels: [], datasets: [] };
        }
    }
};

// Helper to get dates for last 7 days
const getLast7Days = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
};

const getColorForStatus = (status) => {
    switch (status) {
        case 'Open': return '#FF3B30'; // Red
        case 'In Progress': return '#FF9500'; // Orange
        case 'Resolved': return '#34C759'; // Green
        default: return '#8E8E93'; // Gray
    }
};
