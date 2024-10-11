import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, Grid, TextField, Button, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Snackbar, Alert } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    name: '',
    department: '',
    role: '',
    startTime: '',
    endTime: ''
  });
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('http://localhost:8000/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setForm({ ...form, [id]: value });
  };

  const handleSubmit = async () => {
    try {
      if (form.startTime && form.endTime) {
        const response = await axios.post('http://localhost:8000/employees', form);
        if (response && response.data) {
          setEmployees([...employees, response.data]);
          setSnackbarMessage('Employee added successfully!');
          setSnackbarSeverity('success');
          setOpenSnackbar(true);
        }
        setForm({ name: '', department: '', role: '', startTime: '', endTime: '' });
      } else {
        setSnackbarMessage('Please enter both start and end time.');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      }
    } catch (error) {
      console.error("Error adding employee:", error);
      setSnackbarMessage('Error adding employee.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/employees/${id}`);
      setEmployees(employees.filter(employee => employee.id !== id));
      setSnackbarMessage('Employee deleted successfully!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
    } catch (error) {
      console.error("Error deleting employee:", error);
      setSnackbarMessage('Error deleting employee.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom sx={{ color: '#E90074', textAlign: 'center', marginTop: 4 }}>
        Add a New Employee
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4, p: 3, backgroundColor: '#FFC0D9', borderRadius: 2, boxShadow: 3 }}>
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
          <TextField 
            label="Start Time" 
            type="time" 
            id="startTime" 
            value={form.startTime} 
            fullWidth 
            onChange={handleInputChange} 
            sx={{ backgroundColor: '#fff' }}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField 
            label="End Time" 
            type="time" 
            id="endTime" 
            value={form.endTime} 
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
            onClick={() => setForm({ name: '', department: '', role: '', startTime: '', endTime: '' })} 
            sx={{ color: '#E90074', borderColor: '#E90074', ':hover': { backgroundColor: '#ffebf2' } }}
          >
            Reset
          </Button>
        </Grid>
      </Grid>

      <Typography variant="h5" gutterBottom sx={{ color: '#E90074', textAlign: 'center', marginBottom: 4 }}>
        Current Employees
      </Typography>
      <Table>
        <TableHead sx={{ backgroundColor: '#FFCAD4' }}>
          <TableRow>
            <TableCell sx={{ color: '#E90074' }}>Name</TableCell>
            <TableCell sx={{ color: '#E90074' }}>Department</TableCell>
            <TableCell sx={{ color: '#E90074' }}>Role</TableCell>
            <TableCell sx={{ color: '#E90074' }}>Working Hours</TableCell>
            <TableCell sx={{ color: '#E90074' }}>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {employees.map(employee => (
            <TableRow key={employee.id}>
              <TableCell>{employee.name}</TableCell>
              <TableCell>{employee.department}</TableCell>
              <TableCell>{employee.role}</TableCell>
              <TableCell>{employee.startTime} - {employee.endTime}</TableCell>
              <TableCell>
                <IconButton><Edit sx={{ color: '#E90074' }} /></IconButton>
                <IconButton onClick={() => handleDelete(employee.id)}><Delete sx={{ color: '#E90074' }} /></IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}
