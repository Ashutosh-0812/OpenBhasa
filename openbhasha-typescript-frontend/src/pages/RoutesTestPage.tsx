import React, { useState } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  ExpandMore,
  CheckCircle,
  Error,
  PlayArrow,
  Refresh,
} from '@mui/icons-material';
// import { routesTester } from '@/services/routesTester';

interface TestResult {
  endpoint: string;
  method: string;
  status: 'success' | 'error' | 'skipped';
  message: string;
  statusCode?: number;
  data?: any;
}

export const RoutesTestPage: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [summary, setSummary] = useState<{
    total: number;
    success: number;
    errors: number;
    skipped: number;
  } | null>(null);

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);
    setSummary(null);

    try {
      // TODO: Replace with actual routes tester service
      // const originalLog = (routesTester as any).log;
      const capturedResults: TestResult[] = [];
      
      // Mock test results for now
      const mockResults: TestResult[] = [
        { endpoint: '/api/auth/login', method: 'POST', status: 'success', message: 'Login successful', statusCode: 200 },
        { endpoint: '/api/auth/register', method: 'POST', status: 'success', message: 'Registration successful', statusCode: 201 },
        { endpoint: '/api/dashboard/student', method: 'GET', status: 'error', message: 'Route not found', statusCode: 404 },
      ];
      
      for (const result of mockResults) {
        capturedResults.push(result);
        setResults([...capturedResults]);
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
      }

      // await routesTester.runAllTests();

      // Calculate summary
      const success = capturedResults.filter(r => r.status === 'success').length;
      const errors = capturedResults.filter(r => r.status === 'error').length;
      const skipped = capturedResults.filter(r => r.status === 'skipped').length;

      setSummary({
        total: capturedResults.length,
        success,
        errors,
        skipped,
      });

      // Restore original log method - commented out for mock
      // (routesTester as any).log = originalLog;
    } catch (error) {
      console.error('Test execution error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle sx={{ color: 'success.main' }} />;
      case 'error':
        return <Error sx={{ color: 'error.main' }} />;
      default:
        return <PlayArrow sx={{ color: 'warning.main' }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      default:
        return 'warning';
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Typography variant="h4" component="h1">
            API Routes Tester
          </Typography>
          <Chip label="Development Tool" color="secondary" size="small" />
        </Box>

        <Typography variant="body1" sx={{ mb: 3 }}>
          This tool tests all the backend API routes to ensure proper connectivity
          and functionality between the frontend and backend services.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            variant="contained"
            startIcon={isRunning ? <CircularProgress size={20} /> : <PlayArrow />}
            onClick={runTests}
            disabled={isRunning}
            size="large"
          >
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </Button>

          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => {
              setResults([]);
              setSummary(null);
            }}
            disabled={isRunning}
          >
            Clear Results
          </Button>
        </Box>

        {summary && (
          <Alert
            severity={summary.errors === 0 ? 'success' : 'warning'}
            sx={{ mb: 3 }}
          >
            <Typography variant="h6">Test Summary</Typography>
            <Typography>
              Total: {summary.total} | 
              Success: {summary.success} | 
              Errors: {summary.errors} | 
              Skipped: {summary.skipped} |
              Success Rate: {((summary.success / summary.total) * 100).toFixed(1)}%
            </Typography>
          </Alert>
        )}
      </Paper>

      {results.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Test Results
          </Typography>

          <List>
            {results.map((result, index) => (
              <ListItem key={index} sx={{ mb: 1 }}>
                <ListItemIcon>
                  {getStatusIcon(result.status)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={result.method}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {result.endpoint}
                      </Typography>
                      <Chip
                        label={result.status}
                        size="small"
                        color={getStatusColor(result.status) as any}
                      />
                    </Box>
                  }
                  secondary={result.message}
                />
              </ListItem>
            ))}
          </List>

          {results.some(r => r.data) && (
            <Accordion sx={{ mt: 2 }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6">Detailed Response Data</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box component="pre" sx={{ 
                  overflow: 'auto', 
                  backgroundColor: 'grey.100',
                  p: 2,
                  borderRadius: 1,
                  fontSize: '0.875rem'
                }}>
                  {JSON.stringify(
                    results
                      .filter(r => r.data)
                      .map(r => ({ endpoint: r.endpoint, data: r.data })),
                    null,
                    2
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default RoutesTestPage;