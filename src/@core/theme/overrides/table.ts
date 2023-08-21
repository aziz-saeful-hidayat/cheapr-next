// ** MUI Imports
import { Theme } from '@mui/material/styles'

const Table = (theme: Theme) => {
  return {
    MuiToolbar: {
      styleOverrides: {
        root: {
          '&:not(.navbar-content-container)': {
            backgroundColor: theme.palette.background.paper
          },
        }
      }
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          boxShadow: theme.shadows[0],
          borderTopColor: theme.palette.divider,
          backgroundColor: theme.palette.background.paper,
        }
      }
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          textTransform: 'uppercase',
          '& .MuiTableCell-head': {
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: '0.13px',
            backgroundColor: theme.palette.background.paper
            
          },
          backgroundColor: theme.palette.background.paper,
        }
      }
    },
    
    MuiTableBody: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-body': {
            letterSpacing: '0.25px',
            color: theme.palette.text.secondary,
            backgroundColor: theme.palette.background.paper,
            '&:not(.MuiTableCell-sizeSmall):not(.MuiTableCell-paddingCheckbox):not(.MuiTableCell-paddingNone)': {
              paddingTop: theme.spacing(0),
              paddingBottom: theme.spacing(0),
              backgroundColor: theme.palette.background.paper
            },
            
          }
        }
      }
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head:first-child, & .MuiTableCell-root:first-child ': {
            paddingLeft: theme.spacing(0),
            backgroundColor: theme.palette.background.paper
          },
          '& .MuiTableCell-head:last-child, & .MuiTableCell-root:last-child': {
            paddingRight: theme.spacing(0),
            backgroundColor: theme.palette.background.paper
          },
          backgroundColor: theme.palette.background.paper,
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${theme.palette.divider}`,
          '& .MuiButton-root': {
            textTransform: 'uppercase',
            color: theme.palette.text.secondary,
            backgroundColor: theme.palette.text.secondary,
            paddingLeft: 0,
            paddingRight: 0
          },
          backgroundColor: theme.palette.background.paper,
        },
        stickyHeader: {
          backgroundColor: theme.palette.customColors.tableHeaderBg
        }
      }
    }
  }
}

export default Table
