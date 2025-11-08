import * as React from 'react';
import { createTheme, ThemeOptions } from '@mui/material/styles';

// Brand color palette (exact specifications from reference)
export const brandColors = {
  primary: '#136E1B',
  primaryDark: '#0F5815',
  backgroundDefault: '#F1F6F1',
  backgroundPaper: '#E6F1E6',
  textPrimary: '#0A2E0E',
  textSecondary: '#3F6042',
  track: '#CFE5D0',
  white: '#FFFFFF',
} as const;

// Typography scale for mobile-first design
export const typography = {
  title: {
    fontSize: '1.5rem', // 24px
    fontWeight: 600,
    lineHeight: 1.2,
  },
  sectionHeading: {
    fontSize: '1.125rem', // 18px
    fontWeight: 600,
    lineHeight: 1.3,
  },
  body: {
    fontSize: '1rem', // 16px on mobile, 14px on smaller screens
    fontWeight: 400,
    lineHeight: 1.5,
  },
  bodySmall: {
    fontSize: '0.875rem', // 14px
    fontWeight: 400,
    lineHeight: 1.4,
  },
} as const;

// Spacing scale (4/8/12/16px as specified)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

// Mobile-first theme configuration with exact specifications
const themeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: brandColors.primary,
      dark: brandColors.primaryDark,
      contrastText: brandColors.white,
    },
    background: {
      default: brandColors.backgroundDefault, // #F1F6F1
      paper: brandColors.backgroundPaper,     // #E6F1E6
    },
    text: {
      primary: brandColors.textPrimary,   // #0A2E0E
      secondary: brandColors.textSecondary, // #3F6042
    },
    // Custom color tokens
    grey: {
      100: brandColors.track, // #CFE5D0 for progress track
      200: brandColors.backgroundPaper,
      300: brandColors.textSecondary,
      900: brandColors.textPrimary,
    },
  },
  typography: {
    fontFamily: [
      'Poppins',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    // Exact typography specifications from reference
    h5: {
      fontSize: '24px',
      fontWeight: 800,
      color: brandColors.primary, // For "Bolo"
    },
    h6: {
      fontSize: '18px',
      fontWeight: 700, // Section headers
    },
    body1: {
      fontSize: '16px', // Base text
    },
    body2: {
      fontSize: '14px', // Tile labels
    },
    subtitle2: {
      fontSize: '12px', // Project meta
    },
    // Custom token for big stat numbers
    displayStat: {
      fontSize: '32px',
      fontWeight: 800,
    } as any,
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  spacing: (factor: number) => `${4 * factor}px`,
  shape: {
    borderRadius: 20, // Exact specification: 20px
  },
  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.12)',
    '0 6px 18px rgba(19,110,27,0.10)', // Soft shadow for tiles/cards
    '0 10px 25px rgba(0,0,0,0.15)',
  ] as any,
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  components: {
    // Component style overrides (exact specifications)
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
        color: 'default',
      },
      styleOverrides: {
        root: {
          height: '56px',
          backgroundColor: '#fff',
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 2,
      },
      styleOverrides: {
        root: {
          backgroundColor: brandColors.backgroundPaper, // #E6F1E6
          borderRadius: 20,
          padding: 16,
          boxShadow: '0 6px 18px rgba(19,110,27,0.10)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: ({ theme: _, ownerState }) => ({
          ...(ownerState.variant === 'contained' && ownerState.color === 'primary' && {
            height: 44,
            borderRadius: 9999,
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: brandColors.primaryDark,
            },
          }),
        }),
      },
    },
    MuiChip: {
      styleOverrides: {
        root: ({ ownerState }) => ({
          ...(ownerState.size === 'small' && {
            height: 26,
            borderRadius: 9999,
            paddingInline: 12,
            fontWeight: 700,
            ...(ownerState.color === 'primary' && ownerState.variant === 'filled' && {
              color: '#fff',
            }),
          }),
        }),
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: 6,
          borderRadius: 9999,
          backgroundColor: brandColors.track, // #CFE5D0
        },
        bar: {
          borderRadius: 9999,
          backgroundColor: brandColors.primary,
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          height: 64,
          backgroundColor: brandColors.white,
          borderTop: `1px solid ${brandColors.backgroundPaper}`,
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          minWidth: 44,
          '& .MuiSvgIcon-root': {
            fontSize: '22px', // Icon size 22px
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '12px', // Label font-size 12px
          },
          color: brandColors.textSecondary, // default color
          '&.Mui-selected': {
            color: brandColors.primary, // selected color
          },
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          width: 32,
          height: 32,
          fontWeight: 700,
          backgroundColor: brandColors.primary,
          color: '#fff',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          minWidth: 44,
          minHeight: 44,
        },
      },
    },
  },
};

export const theme = createTheme(themeOptions);
// Custom theme extensions for additional design tokens
declare module '@mui/material/styles' {
  interface Theme {
    custom: {
      spacing: typeof spacing;
      brandColors: typeof brandColors;
    };
  }
  
  interface ThemeOptions {
    custom?: {
      spacing?: typeof spacing;
      brandColors?: typeof brandColors;
    };
  }

  // Extend MUI typography variants to include our custom "displayStat"
  interface TypographyVariants {
    displayStat: React.CSSProperties;
  }

  interface TypographyVariantsOptions {
    displayStat?: React.CSSProperties;
  }
}

// Allow the "displayStat" variant to be used on the Typography component
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    displayStat: true;
  }
}

// Enhanced theme with custom tokens
export const enhancedTheme = createTheme({
  ...themeOptions,
  custom: {
    spacing,
    brandColors,
  },
});