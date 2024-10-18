import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, CircularProgress, Paper, Grid } from '@mui/material';
import axios from 'axios';

const Dashboard = () => {
  const [attendanceData, setAttendanceData] = useState({
    totalEmployees: 0,
    present: 0,
    absent: 0,
  });
  const [loading, setLoading] = useState(true);

  // Function to fetch today's attendance summary
  const fetchAttendanceData = async () => {
    try {
      setLoading(true);

      // Fetch today's attendance summary from the backend
      const response = await axios.get('http://localhost:8000/api/attendance/today-summary');
      const summary = response.data;

      setAttendanceData({
        totalEmployees: summary.totalEmployees,
        present: summary.present,
        absent: summary.absent,
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching attendance data:', error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData(); // Fetch data when the component loads
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 5 }}>
      <Paper elevation={4} sx={{ backgroundColor: '#ffe4e1', padding: 6, borderRadius: 5 }}>
        <Box display="flex" justifyContent="center" alignItems="center" mb={5}>
          <Typography variant="h3" sx={{ color: '#e91e63', fontWeight: 'bold' }}>
            Employee Attendance Dashboard
          </Typography>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
            <CircularProgress size={60} sx={{ color: '#ff69b4' }} />
          </Box>
        ) : (
          <Grid container spacing={5}>
            <Grid item xs={12} md={4}>
              <Paper
                elevation={3}
                sx={{ padding: 4, textAlign: 'center', backgroundColor: '#ffc1e3', borderRadius: 4 }}
              >
                <Typography variant="h4" sx={{ color: '#d81b60', fontWeight: 'bold' }}>
                  Total Employees
                </Typography>
                <Typography variant="h2" sx={{ color: '#e91e63', fontWeight: 'bold', mt: 2 }}>
                  {attendanceData.totalEmployees}
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper
                elevation={3}
                sx={{ padding: 4, textAlign: 'center', backgroundColor: '#ffc1e3', borderRadius: 4 }}
              >
                <Typography variant="h4" sx={{ color: '#d81b60', fontWeight: 'bold' }}>
                  Present
                </Typography>
                <Typography variant="h2" sx={{ color: '#e91e63', fontWeight: 'bold', mt: 2 }}>
                  {attendanceData.present}
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper
                elevation={3}
                sx={{ padding: 4, textAlign: 'center', backgroundColor: '#ffc1e3', borderRadius: 4 }}
              >
                <Typography variant="h4" sx={{ color: '#d81b60', fontWeight: 'bold' }}>
                  Absent
                </Typography>
                <Typography variant="h2" sx={{ color: '#e91e63', fontWeight: 'bold', mt: 2 }}>
                  {attendanceData.absent}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Paper>
    </Container>
  );
};

export default Dashboard;
