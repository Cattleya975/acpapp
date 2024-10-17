import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard() {
  const [metrics, setMetrics] = useState({
    totalEmployees: 0,
    onTime: 0,
    lateArrival: 0,
    absent: 0,
  });

  // Fetch metrics from backend
  useEffect(() => {
    axios.get('http://localhost:8000/attendance-metrics')
      .then(response => setMetrics(response.data))
      .catch(error => console.error('Error fetching metrics:', error));
  }, []);

  return (
    <div className="dashboard">
      <div className="metrics">
        <div className="metric-card">Total Employees: {metrics.totalEmployees}</div>
        <div className="metric-card">On Time: {metrics.onTime}</div>
        <div className="metric-card">Late Arrival: {metrics.lateArrival}</div>
        <div className="metric-card">Absent: {metrics.absent}</div>
      </div>
    </div>
  );
}

export default Dashboard;
