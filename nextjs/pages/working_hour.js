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
  Button,
  CircularProgress,
  Paper
} from "@mui/material";
import axios from "axios";

function WorkingHour() {
  const [date, setDate] = useState("2023-03-15"); // Default date
  const [loading, setLoading] = useState(false); // Loading state for Show button
  const [employees, setEmployees] = useState([]); // Employee data with attendance
  const officialStartTime = "09:00 AM"; // Default start time for everyone

  // Function to fetch employee and attendance data based on selected date
  const fetchWorkingHourData = async () => {
    setLoading(true);
    try {
      // Fetch attendance data for the selected date
      const response = await axios.get(`http://localhost:8000/api/attendance/${date}`);
      setEmployees(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  // Function to calculate timeliness based on time in and start time
  const calculateTimeliness = (timeIn) => {
    if (!timeIn || timeIn === "--") {
      return "Absent"; // If no timeIn, employee is absent
    }

    const start = new Date(`01/01/2000 ${officialStartTime}`);
    const arrived = new Date(`01/01/2000 ${timeIn}`);
    const lateMinutes = (arrived - start) / (1000 * 60); // Calculate difference in minutes

    if (lateMinutes <= 0) {
      return "On Time"; // If arrived before or exactly at 9 AM
    } else {
      const hours = Math.floor(lateMinutes / 60);
      const minutes = lateMinutes % 60;
      return `Late ${hours ? hours + " Hr " : ""}${minutes} Mins`; // If arrived after 9 AM
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
        <Box sx={{ flexGrow: 1, padding: 2 }}>
          <Box sx={{ marginBottom: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4" component="h1">
              Working Hour
            </Typography>
            <Box>
              <label htmlFor="date" style={{ marginRight: '10px' }}>Date: </label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{ padding: '5px', borderRadius: '5px' }}
              />
              <Button
                variant="contained"
                onClick={fetchWorkingHourData}
                disabled={loading}
                sx={{
                  backgroundColor: '#FF1493',
                  color: '#fff',
                  fontWeight: 'bold',
                  marginLeft: '20px',
                  padding: '10px 20px',
                }}
              >
                {loading ? <CircularProgress size={24} /> : 'Show'}
              </Button>
            </Box>
          </Box>

          <Box>
            <Typography variant="h6" component="h2" sx={{ marginBottom: '10px' }}>
              Analyse Working Hour
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Start Time</TableCell>
                    <TableCell>Time In</TableCell>
                    <TableCell>Timeliness</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employees.length > 0 ? (
                    employees.map((employee, index) => {
                      const timeIn = employee.timeIn || "--";
                      const timeliness = calculateTimeliness(timeIn);

                      return (
                        <TableRow key={index}>
                          <TableCell>{employee.name}</TableCell>
                          <TableCell>{officialStartTime}</TableCell>
                          <TableCell>{timeIn}</TableCell>
                          <TableCell>{timeliness}</TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No Record Available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
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
