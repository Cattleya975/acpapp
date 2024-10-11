import Head from "next/head";
import Link from "next/link";
import Grid from "@mui/material/Grid";
import { Box, Typography, Button, TextField, Container } from "@mui/material";
import { useState } from "react";

export default function Attendance() {
  // State to hold attendance records
  const [attendanceData, setAttendanceData] = useState([]);
  
  // State for input fields
  const [newRecord, setNewRecord] = useState({
    name: "",
    department: "",
    role: "",
    timeIn: ""
  });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setNewRecord((prevRecord) => ({
      ...prevRecord,
      [id]: value,
    }));
  };

  const handleSubmission = () => {
    // Adds the new record to the attendanceData state
    setAttendanceData((prevData) => [
      ...prevData,
      {
        id: prevData.length + 1,
        ...newRecord,
        timeIn: newRecord.timeIn + " AM", // Assuming all times are in AM for simplicity
      }
    ]);
    // Reset the form fields after submission
    setNewRecord({ name: "", department: "", role: "", timeIn: "" });
  };

  return (
    <>
      <Head>
        <title>Employees Attendance Tracker</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <header style={{ textAlign: 'center', margin: '20px 0' }}>
        <Typography variant="h2" sx={{ color: '#E90074', fontWeight: 'bold', textTransform: 'uppercase' }}>
          Welcome to the Attendance Tracker
        </Typography>
      </header>

      <main>
        <Container>
          <section style={{ marginTop: '20px' }}>
            {/* Form to add attendance records */}
            <Box className="add-attendance" sx={{ marginBottom: 4, padding: 2, backgroundColor: '#FFC0CB', borderRadius: 2, boxShadow: 1 }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#E90074', fontWeight: 'bold' }}>
                Add Attendance Record
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <TextField
                    label="Employee Name"
                    id="name"
                    variant="outlined"
                    fullWidth
                    onChange={handleInputChange}
                    value={newRecord.name}
                    sx={{ backgroundColor: '#fff' }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    label="Department"
                    id="department"
                    variant="outlined"
                    fullWidth
                    onChange={handleInputChange}
                    value={newRecord.department}
                    sx={{ backgroundColor: '#fff' }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    label="Role"
                    id="role"
                    variant="outlined"
                    fullWidth
                    onChange={handleInputChange}
                    value={newRecord.role}
                    sx={{ backgroundColor: '#fff' }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    type="time"
                    label="Check In Time"
                    id="timeIn"
                    variant="outlined"
                    fullWidth
                    onChange={handleInputChange}
                    value={newRecord.timeIn}
                    sx={{ backgroundColor: '#fff' }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <Button
                    variant="contained"
                    onClick={handleSubmission}
                    fullWidth
                    sx={{ backgroundColor: '#FF1493', ':hover': { backgroundColor: '#ff69b4' }, color: '#fff', borderRadius: '20px' }}
                  >
                    Add Record
                  </Button>
                </Grid>
              </Grid>
            </Box>

            {/* Display Attendance Records */}
            <Box className="attendance-records" sx={{ padding: 2, backgroundColor: '#FFC0CB', borderRadius: 2, boxShadow: 1 }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#E90074', fontWeight: 'bold' }}>
                Attendance Records
              </Typography>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th>Serial No</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Role</th>
                    <th>Time In</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.length > 0 ? (
                    attendanceData.map((employee) => (
                      <tr key={employee.id} style={{ backgroundColor: '#fff' }}>
                        <td>{employee.id}</td>
                        <td>{employee.name}</td>
                        <td>{employee.department}</td>
                        <td>{employee.role}</td>
                        <td>{employee.timeIn}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center' }}>No attendance records available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Box>
          </section>
        </Container>
      </main>

      <style jsx>{`
        th, td {
          padding: 8px;
          border: 1px solid #ddd;
          text-align: left;
        }

        th {
          background-color: #FF69B4;
          color: #fff;
        }

        a {
          text-decoration: none;
          color: #fff;
          font-weight: bold;
        }

        a:hover {
          color: #FFC0CB;
        }
      `}</style>
    </>
  );
}
