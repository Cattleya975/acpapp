import React, { useState } from 'react';
import { Container, Box, Typography, Button, CircularProgress, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import axios from 'axios';

const Attendance = () => {
  const [date, setDate] = useState(''); // Selected date
  const [loading, setLoading] = useState(false); // Loading state for buttons
  const [employees, setEmployees] = useState([]); // List of employees from the database
  const [statuses, setStatuses] = useState({}); // Object to store attendance status for each employee

  // Fetch employees from the database based on the selected date
  const handleShowEmployees = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/api/employees');
      setEmployees(response.data); // Set employees data
      const initialStatuses = {};
      response.data.forEach((employee) => {
        initialStatuses[employee.employee_id] = '--'; // Default status
      });
      setStatuses(initialStatuses);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setLoading(false);
    }
  };

  // Update attendance status in the backend
  const updateAttendance = async (employee, status) => {
    const updatedStatus = status === 'Present' ? `Present at ${new Date().toLocaleTimeString()}` : 'Absent';
    setStatuses((prevStatuses) => ({
        ...prevStatuses,
        [employee.employee_id]: updatedStatus, // Update status in UI
    }));

    try {
        // Ensure the date is in the correct format (YYYY-MM-DD)
        const formattedDate = new Date(date).toISOString().split('T')[0];  // Format date as YYYY-MM-DD
        
        // Send attendance update to the backend
        await axios.post('http://localhost:8000/api/attendance/update', {
            employee_id: employee.employee_id,
            name: employee.name,
            department: employee.department,
            status: updatedStatus,
            date: formattedDate,  // Send the formatted date
        });
    } catch (error) {
        console.error('Error updating attendance:', error);
    }
  };

  return (
    <Container>
      {/* Header */}
      <Typography variant="h3" align="center" sx={{ color: '#E90074', fontWeight: 'bold', marginTop: '20px', textTransform: 'uppercase' }}>
        Welcome to the Attendance Tracker
      </Typography>

      {/* Add Attendance Record Section */}
      <Box sx={{ backgroundColor: '#FFC0CB', padding: '20px', borderRadius: '10px', marginTop: '30px', textAlign: 'center', maxWidth: '600px', margin: 'auto' }}>
        <Typography variant="h6" sx={{ color: '#E90074', fontWeight: 'bold', marginBottom: '10px' }}>
          Add Attendance Record
        </Typography>

        <Box display="flex" justifyContent="center" alignItems="center" sx={{ marginBottom: '20px' }}>
          <label htmlFor="date" style={{ marginRight: '10px', color: '#E90074', fontWeight: 'bold' }}>Date:</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ padding: '8px', borderRadius: '5px', border: '1px solid #E90074', marginRight: '20px' }}
          />
          <Button
            variant="contained"
            onClick={handleShowEmployees}
            disabled={loading || !date}
            sx={{
              backgroundColor: '#FF1493',
              color: '#fff',
              fontWeight: 'bold',
              ':hover': { backgroundColor: '#ff69b4' },
              borderRadius: '20px',
              padding: '10px 20px',
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Show Employees'}
          </Button>
        </Box>
      </Box>

      {/* Attendance Records Table */}
      <Box sx={{ marginTop: '30px', backgroundColor: '#FFC0CB', padding: '20px', borderRadius: '10px' }}>
        <Typography variant="h6" sx={{ color: '#E90074', fontWeight: 'bold', marginBottom: '10px', textAlign: 'center' }}>
          Attendance Check
        </Typography>

        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#FF69B4' }}>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Employee ID</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Name</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Department</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.length > 0 ? (
              employees.map((employee, index) => (
                <TableRow key={index}>
                  <TableCell>{employee.employee_id}</TableCell>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{statuses[employee.employee_id]}</TableCell> {/* Display status */}
                  <TableCell>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => updateAttendance(employee, 'Present')}
                      sx={{ marginRight: '10px', borderRadius: '20px' }}
                    >
                      Present
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => updateAttendance(employee, 'Absent')}
                      sx={{ borderRadius: '20px' }}
                    >
                      Absent
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No attendance records available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
    </Container>
  );
};

export default Attendance;
