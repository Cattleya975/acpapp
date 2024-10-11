import React from "react";
import Head from "next/head";
import { Box, Typography, Button } from "@mui/material";
import Link from "next/link";

const Home = () => {
  return (
    <>
      <Head>
        <title>Employees Attendance Tracker</title>
        <meta name="description" content="Track and manage employee attendance effectively." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <main>
        <Box sx={{ padding: 4, textAlign: "center", backgroundColor: "#FFC0CB", minHeight: "100vh" }}>
          <Typography variant="h2" component="h1" gutterBottom sx={{ color: '#E90074' }}>
            Welcome to the Employees Attendance Tracker
          </Typography>
          <Typography variant="h6" gutterBottom sx={{ color: '#E90074' }}>
            Efficiently track and manage employee attendance and working hours.
          </Typography>
          <Typography variant="body1" sx={{ marginBottom: 4, color: '#E90074' }}>
            Use this platform to get insights on attendance trends, check punctuality, and manage employee attendance records.
          </Typography>

          <Box sx={{ marginTop: 4 }}>
            <Link href="/dashboard" passHref>
              <Button
                variant="contained"
                sx={{ 
                  marginRight: 2, 
                  backgroundColor: '#FF69B4', 
                  ':hover': { backgroundColor: '#ff85b8' }, 
                  color: '#fff', 
                  textTransform: 'none',
                  borderRadius: '20px' 
                }}
              >
                Go to Dashboard
              </Button>
            </Link>
            <Link href="/Attendance" passHref>
              <Button
                variant="contained"
                sx={{ 
                  marginRight: 2, 
                  backgroundColor: '#FF69B4', 
                  ':hover': { backgroundColor: '#ff85b8' }, 
                  color: '#fff', 
                  textTransform: 'none',
                  borderRadius: '20px' 
                }}
              >
                View Attendance
              </Button>
            </Link>
            <Link href="/working_hour" passHref>
              <Button
                variant="contained"
                sx={{ 
                  marginRight: 2, 
                  backgroundColor: '#FF69B4', 
                  ':hover': { backgroundColor: '#ff85b8' }, 
                  color: '#fff', 
                  textTransform: 'none',
                  borderRadius: '20px' 
                }}
              >
                Analyze Working Hours
              </Button>
            </Link>
            <Link href="/Employees" passHref>
              <Button
                variant="contained"
                sx={{ 
                  marginRight: 2, 
                  backgroundColor: '#FF69B4', 
                  ':hover': { backgroundColor: '#ff85b8' }, 
                  color: '#fff', 
                  textTransform: 'none',
                  borderRadius: '20px' 
                }}
              >
                Manage Employees
              </Button>
            </Link>
          </Box>

          {/* Sign Up Section */}
          <Box sx={{ marginTop: 4 }}>
            <Typography variant="body1" sx={{ marginBottom: 2, color: '#E90074' }}>
              Don't have an account?
            </Typography>
            <Link href="/Register" passHref>
              <Button
                variant="outlined"
                sx={{ 
                  backgroundColor: '#fff', 
                  color: '#E90074', 
                  borderColor: '#E90074', 
                  ':hover': { backgroundColor: '#ffe5ec' }, 
                  textTransform: 'none',
                  borderRadius: '20px' 
                }}
              >
                Sign Up Here
              </Button>
            </Link>
          </Box>
        </Box>
      </main>

      <style jsx>{`
        main {
          background-color: #FFC0CB;
        }

        * {
          color: #E90074 !important;
        }
      `}</style>
    </>
  );
};

export default Home;
