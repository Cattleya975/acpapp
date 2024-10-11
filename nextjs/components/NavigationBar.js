import Link from 'next/link';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';

const NavBar = () => (
  <AppBar position="static" sx={{ backgroundColor: '#E90074', boxShadow: 'none' }}>
    <Toolbar>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        {/* Dashboard Link */}
        <Typography variant="body1" sx={{ flexGrow: 1 }}>
          <Link href="/" style={{ textDecoration: 'none', color: 'black' }}>Home</Link>
        </Typography>

        {/* Other Links */}
        <Box sx={{ display: 'flex', gap: 3 }}>
          <Typography variant="body1">
            <Link href="/dashboard" style={{ textDecoration: 'none', color: 'black' }}>Dashboard</Link>
          </Typography>
          <Typography variant="body1">
            <Link href="/Attendance" style={{ textDecoration: 'none', color: 'black' }}>Attendance</Link>
          </Typography>
          <Typography variant="body1">
            <Link href="/working_hour" style={{ textDecoration: 'none', color: 'black' }}>Working Hour</Link>
          </Typography>
          <Typography variant="body1">
            <Link href="/Employees" style={{ textDecoration: 'none', color: 'black' }}>Employee</Link>
          </Typography>
          <Typography variant="body1">
            <Link href="/Register" style={{ textDecoration: 'none', color: 'black' }}>Log in</Link>
          </Typography>
        </Box>
      </Box>
    </Toolbar>
  </AppBar>
);

export default NavBar;
