import React from "react";
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  Paper
} from "@mui/material";

function WorkingHour() {
  const officialStartTime = "09:00 AM";

  // Simulating data from Employee and Attendance pages
  const employees = [
    { name: "Cattleya", startTime: "09:00 AM" },
    { name: "Poomk", startTime: "09:00 AM" },
    { name: "Matthew", startTime: "09:00 AM" },
    { name: "Notatda", startTime: "09:00 AM" },
    { name: "Jimmy", startTime: "09:00 AM" },
    { name: "Son", startTime: "09:00 AM" },
    { name: "Tangmo", startTime: "09:00 AM" },
    { name: "Maria", startTime: "09:00 AM" }
  ];

  const attendances = [
    { name: "Cattleya", timeIn: "09:46 AM" },
    { name: "Poomk", timeIn: "10:06 AM" },
    { name: "Matthew", timeIn: "09:46 AM" },
    { name: "Notatda", timeIn: "09:45 AM" },
    { name: "Jimmy", timeIn: "10:06 AM" },
    { name: "Son", timeIn: "09:46 AM" },
    { name: "Tangmo", timeIn: "11:00 AM" },
    { name: "Maria", timeIn: "09:46 AM" }
  ];

  const calculateTimeliness = (startTime, timeIn) => {
    const start = new Date(`01/01/2000 ${startTime}`);
    const arrived = new Date(`01/01/2000 ${timeIn}`);
    const lateMinutes = (arrived - start) / (1000 * 60);

    if (lateMinutes <= 0) {
      return "on time";
    } else {
      const hours = Math.floor(lateMinutes / 60);
      const minutes = lateMinutes % 60;
      return `late ${hours ? hours + " Hr " : ""}${minutes} Mins`;
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
          <Box sx={{ marginBottom: 2 }}>
            <Typography variant="h4" component="h1">
              Working Hour
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" component="h2">
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
                  {employees.map((employee, index) => {
                    const attendance = attendances.find(a => a.name === employee.name);
                    const timeliness = calculateTimeliness(employee.startTime, attendance?.timeIn);

                    return (
                      <TableRow key={index}>
                        <TableCell>{employee.name}</TableCell>
                        <TableCell>{employee.startTime}</TableCell>
                        <TableCell>{attendance?.timeIn}</TableCell>
                        <TableCell>{timeliness}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <Box sx={{ marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <FormControl variant="filled">
              <InputLabel id="perPage-label">Per Page</InputLabel>
              <Select labelId="perPage-label" id="perPage" defaultValue={10}>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={20}>20</MenuItem>
                <MenuItem value={50}>50</MenuItem>
              </Select>
            </FormControl>
            <Pagination count={10} color="primary" />
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
