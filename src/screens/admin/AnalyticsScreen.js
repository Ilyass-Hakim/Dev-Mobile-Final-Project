import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator, TouchableOpacity } from 'react-native';
import { PieChart, LineChart } from 'react-native-chart-kit';
import { AnalyticsService } from '../../services/AnalyticsService';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get("window").width;

const AnalyticsScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [statusData, setStatusData] = useState([]);
    const [trendData, setTrendData] = useState(null);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        setLoading(true);
        const statuses = await AnalyticsService.getStatusDistribution();
        const trends = await AnalyticsService.getWeeklyTrend();

        setStatusData(statuses);
        setTrendData(trends);
        setLoading(false);
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>Analytics Dashboard</Text>
            </View>

            {/* Status Distribution */}
            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Issues by Status</Text>
                {statusData.length > 0 ? (
                    <PieChart
                        data={statusData}
                        width={screenWidth - 40}
                        height={220}
                        chartConfig={chartConfig}
                        accessor={"count"}
                        backgroundColor={"transparent"}
                        paddingLeft={"15"}
                        center={[10, 0]}
                        absolute
                    />
                ) : (
                    <Text style={styles.noData}>No data available</Text>
                )}
            </View>

            {/* Weekly Trend */}
            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Issues Created (Last 7 Days)</Text>
                {trendData && trendData.datasets.length > 0 ? (
                    <LineChart
                        data={trendData}
                        width={screenWidth - 40}
                        height={220}
                        chartConfig={chartConfig}
                        bezier
                        style={{
                            marginVertical: 8,
                            borderRadius: 16
                        }}
                    />
                ) : (
                    <Text style={styles.noData}>No data available</Text>
                )}
            </View>

            <TouchableOpacity style={styles.refreshButton} onPress={loadAnalytics}>
                <Text style={styles.refreshText}>Refresh Data</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    strokeWidth: 2, // optional, default 3
    barPercentage: 0.5,
    useShadowColorFromDataset: false // optional
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        padding: 20,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 40,
    },
    backButton: {
        marginRight: 15,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    chartContainer: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 15,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        alignItems: 'center'
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
        color: '#333',
        alignSelf: 'flex-start'
    },
    noData: {
        color: '#8E8E93',
        fontStyle: 'italic',
        marginTop: 20,
        marginBottom: 20
    },
    refreshButton: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 40
    },
    refreshText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16
    }
});

export default AnalyticsScreen;
