import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: {
      main: '#4F8A3D', // Main Green
      light: '#A6D198', // Light Accent Green
      dark: '#3C6A2E', // Darker Green (hover state)
      contrastText: '#FFFFFF'
    },
    secondary: {
      main: '#A6D198', // Accent Green
      light: '#D7E8D4', // Very Light Green
      dark: '#8BC084', // Darker Accent
      contrastText: '#4F8A3D'
    },
    background: {
      default: '#F9FAF9', // Soft Neutral Background
      paper: '#FFFFFF'
    },
    text: {
      primary: '#4F8A3D', // Main Green for primary text
      secondary: '#555555' // Gray for secondary text
    },
    // Custom color for coins/rewards
    gold: {
      main: '#EBC061', // Soft Gold
      light: '#FFF7E5', // Light Gold Background
      dark: '#B38B00', // Dark Gold Text
      contrastText: '#B38B00'
    },
    // Level progress colors
    level: {
      main: '#F2F8F1', // Light Green Background
      accent: '#D7E8D4' // Medium Green Background
    },
    success: {
      main: '#4F8A3D', // Use main green for success
      light: '#A6D198',
      dark: '#3C6A2E'
    },
    error: {
      main: '#F44336',
      light: '#EF5350',
      dark: '#C62828'
    },
    warning: {
      main: '#EBC061', // Use gold for warnings
      light: '#FFF7E5',
      dark: '#B38B00'
    },
    info: {
      main: '#2196F3',
      light: '#64B5F6',
      dark: '#1976D2'
    }
  },
  typography: {
    fontFamily:
      '"Inter", "Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    // Page titles - 24px, 700 weight
    h1: {
      fontFamily: '"Poppins", sans-serif',
      fontWeight: 700,
      fontSize: '1.5rem', // 24px
      lineHeight: 1.2,
      color: '#4F8A3D'
    },
    // Section headers - 18px, 600 weight
    h2: {
      fontFamily: '"Poppins", sans-serif',
      fontWeight: 600,
      fontSize: '1.125rem', // 18px
      lineHeight: 1.3,
      color: '#4F8A3D'
    },
    h3: {
      fontFamily: '"Poppins", sans-serif',
      fontWeight: 600,
      fontSize: '1.125rem', // 18px
      lineHeight: 1.3,
      color: '#4F8A3D'
    },
    // Card labels - 16px, 500 weight
    h4: {
      fontFamily: '"Poppins", sans-serif',
      fontWeight: 500,
      fontSize: '1rem', // 16px
      lineHeight: 1.4,
      color: '#4F8A3D'
    },
    h5: {
      fontFamily: '"Poppins", sans-serif',
      fontWeight: 500,
      fontSize: '1rem', // 16px
      lineHeight: 1.4,
      color: '#4F8A3D'
    },
    h6: {
      fontFamily: '"Poppins", sans-serif',
      fontWeight: 500,
      fontSize: '1rem', // 16px
      lineHeight: 1.4,
      color: '#4F8A3D'
    },
    // Body text - 14px, 400 weight
    body1: {
      fontFamily: '"Inter", sans-serif',
      fontSize: '0.875rem', // 14px
      fontWeight: 400,
      lineHeight: 1.6,
      color: '#4F8A3D'
    },
    body2: {
      fontFamily: '"Inter", sans-serif',
      fontSize: '0.875rem', // 14px
      fontWeight: 400,
      lineHeight: 1.6,
      color: '#555555'
    },
    button: {
      fontFamily: '"Poppins", sans-serif',
      fontWeight: 500,
      textTransform: 'none',
      fontSize: '0.875rem'
    },
    caption: {
      fontFamily: '"Inter", sans-serif',
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.4,
      color: '#555555'
    }
  },
  shape: {
    borderRadius: 12
  },
  spacing: 8,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
          fontSize: '0.875rem',
          fontWeight: 500,
          textTransform: 'none',
          boxShadow: 'none',
          minHeight: '48px',
          minWidth: '160px',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(79, 138, 61, 0.15)'
          }
        },
        contained: {
          backgroundColor: '#4F8A3D',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#3C6A2E'
          }
        },
        outlined: {
          borderColor: '#4F8A3D',
          color: '#4F8A3D',
          '&:hover': {
            backgroundColor: 'rgba(79, 138, 61, 0.1)',
            borderColor: '#3C6A2E'
          }
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: '#FFFFFF',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#4F8A3D'
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#4F8A3D'
            }
          },
          '& .MuiInputLabel-root': {
            color: '#555555',
            '&.Mui-focused': {
              color: '#4F8A3D'
            }
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
          border: '1px solid #E9E9E9',
          backgroundColor: '#FFFFFF',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
          color: '#4F8A3D'
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#F9FAF9',
          borderRight: '1px solid #E9E9E9'
        }
      }
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '4px 8px',
          '&.Mui-selected': {
            backgroundColor: '#A6D198',
            borderBottom: '3px solid #4F8A3D',
            color: '#4F8A3D',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: '#8BC084'
            }
          },
          '&:hover': {
            borderBottom: '2px solid #A6D198'
          }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontSize: '0.75rem',
          fontWeight: 500
        },
        colorPrimary: {
          backgroundColor: '#4F8A3D',
          color: '#FFFFFF'
        },
        colorSecondary: {
          backgroundColor: '#A6D198',
          color: '#4F8A3D'
        }
      }
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12
        },
        standardSuccess: {
          backgroundColor: '#F2F8F1',
          color: '#4F8A3D'
        },
        standardError: {
          backgroundColor: '#FFEBEE',
          color: '#C62828'
        },
        standardWarning: {
          backgroundColor: '#FFF7E5',
          color: '#B38B00'
        },
        standardInfo: {
          backgroundColor: '#E3F2FD',
          color: '#1976D2'
        }
      }
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#A6D198',
          '& .MuiTableCell-head': {
            color: '#4F8A3D',
            fontWeight: 600,
            fontSize: '0.875rem'
          }
        }
      }
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: '#D7E8D4',
          height: '14px'
        },
        bar: {
          background: 'linear-gradient(to right, #4F8A3D, #A6D198)',
          borderRadius: 10
        }
      }
    },
    // Custom styles for reward cards
    MuiBox: {
      styleOverrides: {
        root: {
          '&.reward-card': {
            borderRadius: 16,
            padding: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'transform 0.2s ease',
            height: '140px',
            '&:hover': {
              transform: 'translateY(-2px)'
            }
          },
          '&.coin-card': {
            backgroundColor: '#FFF7E5'
          },
          '&.streak-card': {
            backgroundColor: '#F2F8F1'
          },
          '&.level-card': {
            backgroundColor: '#D7E8D4'
          },
          '&.achievement-card': {
            backgroundColor: '#F9F9F9'
          }
        }
      }
    }
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920
    }
  }
})

export default theme
