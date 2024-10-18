import React, { useState } from "react";
import Head from "next/head";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Paper,
  Button
} from "@mui/material";
import axios from "axios";

function WorkingHour() {
  const [loading, setLoading] = useState(false); // Loading state
  const [employees, setEmployees] = useState([]); // Employee attendance data
  const [errorMessage, setErrorMessage] = useState(""); // Initialize errorMessage state

  // Function to fetch attendance data
  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      // Fetch attendance data from the API
      const response = await axios.get(`http://localhost:8000/api/attendance/all`);
      setEmployees(response.data);
      setErrorMessage(""); // Clear error message on success
    } catch (error) {
      console.error("Error fetching data:", error);
      setEmployees([]); // Clear employee data on error
      setErrorMessage("Failed to load attendance data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Function to calculate timeliness based on status and time in
  const calculateTimeliness = (timeIn, status) => {
    const officialStartTime = "09:01 AM"; // Cutoff for "Late"
    
    if (status === "Absent") {
      return "--"; // If absent, return "--"
    }
    
    const arrivedTime = new Date(`01/01/2000 ${timeIn}`);
    const cutoffTime = new Date(`01/01/2000 ${officialStartTime}`);

    if (arrivedTime <= cutoffTime) {
      return "In Time"; // If arrived before or at 9:01 AM
    } else {
      return "Late"; // If arrived after 9:01 AM
    }
  };
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const loginTime = new Date().toISOString();  // Capture login time as ISO string
    try {
      const response = await fetch('http://localhost:8000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
          login_time: loginTime  // Send login time to backend
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await response.json();
      setSnackbarMessage('Login successful!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      // Handle successful login (e.g., redirect, save token)
    } catch (error) {
      setSnackbarMessage(error.message);
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
};


  return (
    <>
      <Head>
        <title>Working Hour</title>
        <meta name="description" content="Working Hour Page" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <main>
        <Box sx={{ flexGrow: 1, padding: 2, backgroundColor: '#FFC0CB', minHeight: '100vh' }}> {/* Light pink background for the page */}
          <Typography variant="h4" component="h1" sx={{ marginBottom: 2, color: '#E90074' }}> {/* Dark pink color for the header */}
            Working Hour and Timeliness
          </Typography>

          {/* Box to align the button to the right */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 2 }}>
            <Button
              variant="contained"
              onClick={fetchAttendanceData}
              disabled={loading}
              sx={{
                backgroundColor: '#FF1493', // Pink color
                color: '#fff',
                '&:hover': {
                  backgroundColor: '#FF69B4', // Slightly lighter pink on hover
                },
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Show Data'}
            </Button>
          </Box>

          <Box>
            <Typography variant="h6" component="h2" sx={{ marginBottom: '10px', color: '#FF1493' }}> {/* Pink text */}
              Employee Attendance Record and Timeliness (work start at 09:00 AM)
            </Typography>

            {loading ? (
              <CircularProgress sx={{ color: '#FF69B4' }} /> // Pink color for loading spinner
            ) : (
              <TableContainer component={Paper} sx={{ backgroundColor: '#FFD1DC' }}> {/* Light pink background for the table */}
                <Table>
                  <TableHead sx={{ backgroundColor: '#FF69B4' }}> {/* Pink header */}
                    <TableRow>
                      <TableCell sx={{ color: '#fff' }}>Date</TableCell>
                      <TableCell sx={{ color: '#fff' }}>Name</TableCell>
                      <TableCell sx={{ color: '#fff' }}>Department</TableCell>
                      <TableCell sx={{ color: '#fff' }}>Status</TableCell>
                      <TableCell sx={{ color: '#fff' }}>Timeliness</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {employees.length > 0 ? (
                      employees.map((employee, index) => {
                        const timeliness = calculateTimeliness(employee.time_in, employee.status);

                        return (
                          <TableRow key={index} sx={{ backgroundColor: '#FFE4E1' }}> {/* Light pink rows */}
                            <TableCell>{new Date(employee.date).toLocaleDateString()}</TableCell>
                            <TableCell>{employee.name}</TableCell>
                            <TableCell>{employee.department}</TableCell>
                            <TableCell>{employee.status}</TableCell>
                            <TableCell>{timeliness}</TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No Record Available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Box>
      </main>

      <style jsx>{`
        a {
          text-decoration: none;
          color: black;
        }
      `}</style>
    </>
  );
}

export default WorkingHour;
