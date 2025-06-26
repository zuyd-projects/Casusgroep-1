# Frontend Integration Examples

## Business Process Analysis Dashboard

This document provides examples of how to integrate the business process analysis APIs into your frontend for a comprehensive process mining dashboard.

## Dashboard Layout Structure

```
┌─────────────────────────────────────────────────┐
│                 KPI Overview                    │
├──────────────┬──────────────┬──────────────────┤
│ Cycle Time   │ Efficiency   │ Throughput       │
│   45.2 min   │    85.5%     │  3.2 orders/day  │
├──────────────┴──────────────┴──────────────────┤
│            Process Flow Visualization           │
├─────────────────────────────────────────────────┤
│     Activity Performance    │  Recommendations  │
│         (Charts)            │   (Action Items)  │
├─────────────────────────────┼──────────────────┤
│    Resource Utilization     │   Conformance     │
│        (Heatmap)            │    Analysis       │
└─────────────────────────────┴──────────────────┘
```

## API Integration Examples

### 1. Fetching Overall Metrics

```javascript
// Fetch business analysis data
async function fetchBusinessAnalysis(startDate, endDate) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await fetch(`/api/ProcessMining/business-analysis?${params}`);
    const data = await response.json();
    
    return data;
}

// Update KPI cards
function updateKPICards(data) {
    document.getElementById('cycle-time').textContent = `${data.OverallMetrics.AverageCycleTime.toFixed(1)} min`;
    document.getElementById('efficiency').textContent = `${data.OverallMetrics.ProcessEfficiency.toFixed(1)}%`;
    document.getElementById('throughput').textContent = `${data.OverallMetrics.ThroughputPerDay.toFixed(1)} orders/day`;
    document.getElementById('completed-cases').textContent = data.OverallMetrics.CompletedCases;
}
```

### 2. Activity Performance Chart

```javascript
// Fetch and display activity performance
async function loadActivityPerformance() {
    const response = await fetch('/api/ProcessMining/activity-performance');
    const data = await response.json();
    
    // Create bar chart for activity frequencies
    const activityData = data.ActivityDetails.map(activity => ({
        name: activity.Activity,
        occurrences: activity.TotalOccurrences,
        successRate: activity.SuccessRate,
        isBottleneck: activity.Bottleneck
    }));
    
    // Example using Chart.js
    const ctx = document.getElementById('activityChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: activityData.map(a => a.name),
            datasets: [{
                label: 'Occurrences',
                data: activityData.map(a => a.occurrences),
                backgroundColor: activityData.map(a => 
                    a.isBottleneck ? '#ff6b6b' : '#4ecdc4'
                ),
                borderColor: '#333',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Activity Performance (Bottlenecks in Red)'
                }
            }
        }
    });
}
```

### 3. Process Flow Visualization

```javascript
// Create process flow diagram with performance data
async function createProcessFlow() {
    const response = await fetch('/api/ProcessMining/flow');
    const flowData = await response.json();
    
    // Example using D3.js or similar
    const nodes = flowData.Nodes.map(node => ({
        id: node.Id,
        label: node.Label,
        count: node.Count,
        type: node.Type
    }));
    
    const edges = flowData.Edges.map(edge => ({
        source: edge.Source,
        target: edge.Target,
        weight: edge.Count
    }));
    
    // Render with your preferred visualization library
    renderProcessFlow(nodes, edges);
}

function renderProcessFlow(nodes, edges) {
    // Implementation depends on your chosen visualization library
    // Popular options: D3.js, Vis.js, Cytoscape.js, or Mermaid
    
    // Example structure:
    nodes.forEach(node => {
        // Create node elements
        // Size based on count
        // Color based on performance
    });
    
    edges.forEach(edge => {
        // Create connection lines
        // Thickness based on frequency
    });
}
```

### 4. Recommendations Panel

```javascript
// Fetch and display optimization recommendations
async function loadRecommendations() {
    const response = await fetch('/api/ProcessMining/optimization-recommendations');
    const data = await response.json();
    
    const container = document.getElementById('recommendations-panel');
    container.innerHTML = '';
    
    data.Recommendations.forEach(rec => {
        const item = document.createElement('div');
        item.className = `recommendation ${rec.Priority.toLowerCase()}`;
        item.innerHTML = `
            <div class="rec-header">
                <span class="rec-type">${rec.Type}</span>
                <span class="rec-priority priority-${rec.Priority.toLowerCase()}">${rec.Priority}</span>
            </div>
            <div class="rec-issue">${rec.Issue}</div>
            <div class="rec-recommendation">${rec.Recommendation}</div>
            <div class="rec-impact">${rec.EstimatedImprovement}</div>
        `;
        container.appendChild(item);
    });
}
```

### 5. Resource Utilization Heatmap

```javascript
// Create resource utilization heatmap
async function createResourceHeatmap() {
    const response = await fetch('/api/ProcessMining/resource-utilization');
    const data = await response.json();
    
    const heatmapData = data.ResourceDetails.map(resource => ({
        resource: resource.Resource,
        utilization: resource.UtilizationScore,
        activities: resource.TotalActivities,
        efficiency: resource.PerformanceMetrics.SuccessRate
    }));
    
    // Example heatmap implementation
    const container = document.getElementById('resource-heatmap');
    container.innerHTML = '';
    
    heatmapData.forEach(item => {
        const cell = document.createElement('div');
        cell.className = 'heatmap-cell';
        cell.style.backgroundColor = getHeatmapColor(item.utilization);
        cell.innerHTML = `
            <div class="resource-name">${item.resource}</div>
            <div class="utilization">${item.utilization.toFixed(1)}%</div>
        `;
        
        // Add tooltip with detailed info
        cell.title = `
            Resource: ${item.resource}
            Utilization: ${item.utilization.toFixed(1)}%
            Activities: ${item.activities}
            Efficiency: ${item.efficiency.toFixed(1)}%
        `;
        
        container.appendChild(cell);
    });
}

function getHeatmapColor(utilization) {
    // Color scale from green (low) to red (high)
    if (utilization < 30) return '#4caf50'; // Green
    if (utilization < 60) return '#ffeb3b'; // Yellow
    if (utilization < 80) return '#ff9800'; // Orange
    return '#f44336'; // Red
}
```

### 6. Time-based Analysis

```javascript
// Add date range picker and refresh functionality
function initializeDatePicker() {
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const refreshButton = document.getElementById('refresh-btn');
    
    // Set default dates (last 7 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    
    startDateInput.value = startDate.toISOString().split('T')[0];
    endDateInput.value = endDate.toISOString().split('T')[0];
    
    refreshButton.addEventListener('click', async () => {
        const start = startDateInput.value;
        const end = endDateInput.value;
        
        // Refresh all dashboard components
        await Promise.all([
            refreshBusinessAnalysis(start, end),
            refreshActivityPerformance(start, end),
            refreshResourceUtilization(start, end),
            refreshRecommendations(start, end)
        ]);
    });
}

async function refreshBusinessAnalysis(startDate, endDate) {
    const data = await fetchBusinessAnalysis(startDate, endDate);
    updateKPICards(data);
    updateStagePerformanceChart(data.StagePerformance);
}
```

## React Component Examples

### 1. KPI Card Component

```jsx
import React from 'react';

const KPICard = ({ title, value, unit, trend, status }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'good': return 'text-green-600';
            case 'warning': return 'text-yellow-600';
            case 'critical': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <div className={`text-3xl font-bold ${getStatusColor(status)}`}>
                {value} {unit}
            </div>
            {trend && (
                <div className="text-sm text-gray-500 mt-2">
                    {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}% from last period
                </div>
            )}
        </div>
    );
};

export default KPICard;
```

### 2. Business Analysis Dashboard

```jsx
import React, { useState, useEffect } from 'react';
import KPICard from './KPICard';
import ActivityChart from './ActivityChart';
import RecommendationsPanel from './RecommendationsPanel';

const BusinessAnalysisDashboard = () => {
    const [analysisData, setAnalysisData] = useState(null);
    const [dateRange, setDateRange] = useState({
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchAnalysisData();
    }, [dateRange]);

    const fetchAnalysisData = async () => {
        const params = new URLSearchParams({
            startDate: dateRange.start,
            endDate: dateRange.end
        });
        
        const response = await fetch(`/api/ProcessMining/business-analysis?${params}`);
        const data = await response.json();
        setAnalysisData(data);
    };

    if (!analysisData) return <div>Loading...</div>;

    const { OverallMetrics } = analysisData;

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Business Process Analysis</h1>
            
            {/* Date Range Selector */}
            <div className="flex space-x-4">
                <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                    className="border rounded px-3 py-2"
                />
                <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                    className="border rounded px-3 py-2"
                />
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <KPICard
                    title="Average Cycle Time"
                    value={OverallMetrics.AverageCycleTime.toFixed(1)}
                    unit="minutes"
                    status={OverallMetrics.AverageCycleTime < 30 ? 'good' : 'warning'}
                />
                <KPICard
                    title="Process Efficiency"
                    value={OverallMetrics.ProcessEfficiency.toFixed(1)}
                    unit="%"
                    status={OverallMetrics.ProcessEfficiency > 90 ? 'good' : 'warning'}
                />
                <KPICard
                    title="Throughput"
                    value={OverallMetrics.ThroughputPerDay.toFixed(1)}
                    unit="orders/day"
                    status="good"
                />
                <KPICard
                    title="Completion Rate"
                    value={(OverallMetrics.CompletedCases / OverallMetrics.TotalCases * 100).toFixed(1)}
                    unit="%"
                    status="good"
                />
            </div>

            {/* Charts and Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ActivityChart />
                <RecommendationsPanel />
            </div>
        </div>
    );
};

export default BusinessAnalysisDashboard;
```

## CSS Styling Examples

```css
/* Dashboard Layout */
.dashboard-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;
    padding: 1rem;
}

/* KPI Cards */
.kpi-card {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border-left: 4px solid var(--primary-color);
}

.kpi-value {
    font-size: 2rem;
    font-weight: bold;
    margin: 0.5rem 0;
}

.kpi-value.good { color: #10b981; }
.kpi-value.warning { color: #f59e0b; }
.kpi-value.critical { color: #ef4444; }

/* Recommendations */
.recommendation {
    background: white;
    border-radius: 6px;
    padding: 1rem;
    margin-bottom: 0.5rem;
    border-left: 4px solid #e5e7eb;
}

.recommendation.high {
    border-left-color: #ef4444;
}

.recommendation.medium {
    border-left-color: #f59e0b;
}

.recommendation.low {
    border-left-color: #10b981;
}

/* Resource Heatmap */
.resource-heatmap {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 0.5rem;
    padding: 1rem;
}

.heatmap-cell {
    padding: 1rem;
    border-radius: 4px;
    text-align: center;
    color: white;
    font-weight: bold;
}

/* Process Flow */
.process-flow {
    height: 400px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow: hidden;
}
```

## Real-time Updates

```javascript
// WebSocket connection for real-time updates
class ProcessMiningWebSocket {
    constructor(dashboardUrl) {
        this.ws = new WebSocket(`wss://${window.location.host}/ws/process-mining`);
        this.setupEventHandlers();
    }

    setupEventHandlers() {
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleUpdate(data);
        };

        this.ws.onopen = () => {
            console.log('Process mining WebSocket connected');
        };

        this.ws.onclose = () => {
            console.log('Process mining WebSocket disconnected');
            // Implement reconnection logic
        };
    }

    handleUpdate(data) {
        switch (data.type) {
            case 'new_event':
                this.updateEventCounters();
                break;
            case 'anomaly_detected':
                this.showAnomalyAlert(data.anomaly);
                break;
            case 'process_completed':
                this.refreshMetrics();
                break;
        }
    }

    updateEventCounters() {
        // Refresh relevant counters without full page reload
    }

    showAnomalyAlert(anomaly) {
        // Show notification or update anomaly panel
    }

    refreshMetrics() {
        // Refresh key metrics
    }
}

// Initialize WebSocket
const processWS = new ProcessMiningWebSocket();
```

This implementation provides a comprehensive foundation for integrating the business process analysis features into your frontend dashboard, with examples for various frontend frameworks and visualization approaches.
