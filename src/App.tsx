import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import DriverView from './views/DriverView';
import SenderView from './views/SenderView';
import ReceiverView from './views/ReceiverView';
import Navbar from './components/Navbar';

const theme = createTheme({
  palette: {
    primary: {
      main: '#FF6B6B',
    },
    secondary: {
      main: '#4ECDC4',
    },
    background: {
      default: '#F7F7F7',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar />
        <Routes>
          <Route path="/driver" element={<DriverView />} />
          <Route path="/sender" element={<SenderView />} />
          <Route path="/receiver" element={<ReceiverView />} />
          <Route path="/" element={<SenderView />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App; 