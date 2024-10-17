import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, TextField, Button, Container, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Snackbar, Alert } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    name: '',
    department: '',
    role: '',
  });
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Close Snackbar
  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  // Fetch employees data
  useEffect(() => {
    async function fetchEmployees() {
      try {
        const response = await fetch('http://localhost:8000/api/employees');  // No trailing slash
        if (!response.ok) {
          throw new Error('Failed to fetch employees');
        }
        const data = await response.json();
        setEmployees(data);
      } catch (error) {
        console.error("Error fetching employees:", error);
        setSnackbarMessage('Error fetching employees');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      }
    }
    fetchEmployees();
  }, []);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setForm({ ...form, [id]: value });
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/employees', {  // No trailing slash
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error adding employee');
      }

      const newEmployee = await response.json();
      setEmployees([...employees, newEmployee]);

      setSnackbarMessage('Employee added successfully!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);

      // Clear form after successful submission
      setForm({ name: '', department: '', role: '' });
    } catch (error) {
      console.error("Error adding employee:", error);
      setSnackbarMessage(error.message || 'Error adding employee');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!id) {
      console.error('Employee ID is undefined');
      return;  // Stop if ID is not defined
    }

    try {
      const response = await fetch(`http://localhost:8000/api/employees/${id}`, {  // No trailing slash
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error deleting employee');
      }

      setEmployees(employees.filter(employee => employee.employee_id !== id));
      setSnackbarMessage('Employee deleted successfully');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
    } catch (error) {
      console.error("Error deleting employee:", error);
      setSnackbarMessage('Error deleting employee');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom sx={{ color: '#E90074', textAlign: 'center', marginTop: 4 }}>
        Add a New Employee
      </Typography>
      <Box sx={{ mb: 4, p: 3, backgroundColor: '#FFC0D9', borderRadius: 2, boxShadow: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField 
              label="Name" 
              id="name" 
              value={form.name} 
              fullWidth 
              onChange={handleInputChange} 
              sx={{ backgroundColor: '#fff' }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField 
              label="Department" 
              id="department" 
              value={form.department} 
              fullWidth 
              onChange={handleInputChange} 
              sx={{ backgroundColor: '#fff' }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField 
              label="Role" 
              id="role" 
              value={form.role} 
              fullWidth 
              onChange={handleInputChange} 
              sx={{ backgroundColor: '#fff' }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Button 
              variant="contained" 
              onClick={handleSubmit} 
              sx={{ backgroundColor: '#FF90BC', ':hover': { backgroundColor: '#ff9ebb' } }}
            >
              Submit
            </Button>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button 
              variant="outlined" 
              onClick={() => setForm({ name: '', department: '', role: '' })}  // Reset form
              sx={{ color: '#E90074', borderColor: '#E90074', ':hover': { backgroundColor: '#ffebf2' } }}
            >
              Reset
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Typography variant="h5" gutterBottom sx={{ color: '#E90074', textAlign: 'center', marginBottom: 4 }}>
        Current Employees
      </Typography>
      <Table>
        <TableHead sx={{ backgroundColor: '#FFCAD4' }}>
          <TableRow>
            <TableCell sx={{ color: '#E90074' }}>#</TableCell> {/* Serial Number Column */}
            <TableCell sx={{ color: '#E90074' }}>Name</TableCell>
            <TableCell sx={{ color: '#E90074' }}>Department</TableCell>
            <TableCell sx={{ color: '#E90074' }}>Role</TableCell>
            <TableCell sx={{ color: '#E90074' }}>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {employees.map((employee, index) => (  // Add index for serial number
            <TableRow key={employee.employee_id}>  {/* Updated to employee.employee_id */}
              <TableCell>{index + 1}</TableCell>  {/* Serial number */}
              <TableCell>{employee.name}</TableCell>
              <TableCell>{employee.department}</TableCell>
              <TableCell>{employee.role}</TableCell>
              <TableCell>
                <IconButton><Edit sx={{ color: '#E90074' }} /></IconButton>
                <IconButton onClick={() => handleDelete(employee.employee_id)}><Delete sx={{ color: '#E90074' }} /></IconButton>  {/* Updated to employee.employee_id */}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Snackbar for notifications */}
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}
