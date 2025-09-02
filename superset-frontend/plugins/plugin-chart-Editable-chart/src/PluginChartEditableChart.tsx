/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// // The following Styles component is a <div> element, which has been styled using Emotion
// // For docs, visit https://emotion.sh/docs/styled

// // Theming variables are provided for your use via a ThemeProvider
// // imported from @superset-ui/core. For variables available, please visit
// // https://github.com/apache-superset/superset-ui/blob/master/packages/superset-ui-core/src/theme/index.ts

// import React, {
//   useState,
//   useEffect,
//   useCallback,
//   useMemo,
//   useRef,
// } from 'react';
// import { styled, GenericDataType } from '@superset-ui/core';
// import {
//   DataGrid,
//   GridColDef,
//   GridRowModel,
//   GridToolbarContainer,
//   GridToolbarQuickFilter,
// } from '@mui/x-data-grid';
// import { Button, Box } from '@mui/material';
// import { createTheme, ThemeProvider } from '@mui/material/styles';
// import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { PluginChartEditableTableProps } from './types';
// import UpdateTable from './api/nifi';

// interface StylesProps {
//   height: number;
//   width: number;
// }

// const Styles = styled.div<StylesProps>`
//   height: ${({ height }) => height}px;
//   width: ${({ width }) => width}px;
// `;

// const theme = createTheme({
//   palette: {
//     mode: 'light',
//   },
// });

// const breakDownDate = (dateValue: any, timeGrain: string): string | null => {
//   if (!dateValue) return null;

//   try {
//     const date = new Date(dateValue);
//     if (isNaN(date.getTime())) return null;

//     switch (timeGrain) {
//       case 'P1Y':
//         return `${date.getUTCFullYear()}`;
//       case 'P1M': {
//         const monthNames = [
//           'Jan',
//           'Feb',
//           'Mar',
//           'Apr',
//           'May',
//           'Jun',
//           'Jul',
//           'Aug',
//           'Sep',
//           'Oct',
//           'Nov',
//           'Dec',
//         ];
//         return `${monthNames[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
//       }
//       case 'P1W': {
//         const d = new Date(date);
//         d.setUTCHours(0, 0, 0, 0);
//         d.setUTCDate(d.getUTCDate() + 3 - (d.getUTCDay() || 7));
//         const week1 = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
//         week1.setUTCDate(week1.getUTCDate() + 3 - (week1.getUTCDay() || 7));
//         const week = Math.ceil(
//           ((d.getTime() - week1.getTime()) / 86400000 + 1) / 7,
//         );
//         return `W${week.toString().padStart(2, '0')}-${date.getUTCFullYear()}`;
//       }
//       default:
//         return date.toISOString().split('T')[0];
//     }
//   } catch (error) {
//     console.error('Date processing error:', error);
//     return dateValue?.toString() ?? null;
//   }
// };

// const PluginChartEditableTable: React.FC<PluginChartEditableTableProps> = ({
//   height,
//   width,
//   queriesData,
//   datasource,
//   formData,
// }) => {
//   const {
//     groupby: groupbyColumns = [],
//     timeGrainSqla: timeGrain = 'P1M',
//     datasource: datasetName = '',
//     editableColumns = [],
//     updateUrl = '',
//   } = formData;

//   // State management
//   const [rows, setRows] = useState<any[]>([]);
//   const [baseColumns, setBaseColumns] = useState<GridColDef[]>([]);
//   const [updatedRows, setUpdatedRows] = useState<{
//     data: GridRowModel[];
//     datasource: string;
//   }>({ data: [], datasource: datasetName });
//   const [editedCells, setEditedCells] = useState<Set<string>>(new Set());
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   // Extract query data safely
//   const queryResponse = queriesData?.[0] || {};
//   const queryData = queryResponse.data || [];
//   const colnames = queryResponse.colnames || [];
//   const coltypes = queryResponse.coltypes || [];
//   const columnMetadata = datasource?.columns || [];

//   // Create refs to track processed state
//   const lastProcessedData = useRef<any>(null);

//   // Process data when Superset data is ready
//   useEffect(() => {
//     // Skip if no data or already processed
//     if (queryData.length === 0 || colnames.length === 0) {
//       setLoading(false);
//       return;
//     }

//     // Check if data has actually changed
//     const dataSignature = JSON.stringify({
//       queryData: queryData.slice(0, 1),
//       colnames,
//       coltypes,
//     });

//     if (lastProcessedData.current === dataSignature) {
//       setLoading(false);
//       return;
//     }

//     try {
//       // Create column name to type mapping
//       const columnTypes: Record<string, GenericDataType> = {};
//       columnMetadata.forEach((col: any) => {
//         columnTypes[col.column_name] = col.type_generic;
//       });

//       // Transform data - PRESERVE ORIGINAL DATES
//       const transformedData = queryData.map((row: any, index: number) => {
//         const transformedRow = { ...row, id: row.id ?? index };

//         // Store original date separately
//         if (row.Date) {
//           transformedRow.__originalDate = row.Date; // Preserve original date
//           transformedRow.Date = breakDownDate(row.Date, timeGrain); // Create display value
//         }

//         // Convert numeric columns to numbers
//         colnames.forEach((col: string, idx: number) => {
//           if (coltypes[idx] === 0) {
//             transformedRow[col] = parseFloat(row[col]) || 0;
//           }
//         });

//         return transformedRow;
//       });

//       // Create column definitions
//       const gridColumns = colnames.map((col: string, idx: number) => {
//         const isEditable = editableColumns.includes(col);
//         const isNumeric = coltypes[idx] === 0;
//         const headerName =
//           columnMetadata.find((c: any) => c.column_name === col)
//             ?.verbose_name || col;

//         // Special handling for Date column
//         if (col === 'Date') {
//           return {
//             field: 'Date',
//             headerName,
//             flex: 1,
//             editable: false, // Date column is not editable
//             type: 'string',
//             headerAlign: 'left',
//             align: 'left',
//             valueFormatter: (params: any) => params.value || '',
//             renderCell: (params: any) => (
//               <div
//                 style={{
//                   display: 'flex',
//                   alignItems: 'center',
//                   width: '100%',
//                   justifyContent: 'flex-start',
//                 }}
//               >
//                 {params.formattedValue || params.value || ''}
//               </div>
//             ),
//           };
//         }

//         return {
//           field: col,
//           headerName,
//           flex: 1,
//           editable: isEditable,
//           type: isNumeric ? 'number' : 'string',
//           headerAlign: isNumeric ? 'right' : 'left',
//           align: isNumeric ? 'right' : 'left',
//           headerClassName: isEditable ? 'editable-header' : '',
//           valueFormatter: isNumeric
//             ? (params: any) => (params?.value ?? 0).toString()
//             : undefined,
//           renderCell: !isEditable
//             ? (params: any) => (
//                 <div
//                   style={{
//                     display: 'flex',
//                     alignItems: 'center',
//                     width: '100%',
//                     justifyContent: isNumeric ? 'flex-end' : 'flex-start',
//                   }}
//                 >
//                   {String(params.formattedValue ?? params.value ?? '')}
//                 </div>
//               )
//             : undefined,
//         };
//       });

//       setRows(transformedData);
//       setBaseColumns(gridColumns);
//       setLoading(false);

//       // Store the signature of the processed data
//       lastProcessedData.current = dataSignature;
//     } catch (err) {
//       console.error('Error processing data:', err);
//       setError('Failed to process data');
//       setLoading(false);
//     }
//   }, [
//     queryData,
//     columnMetadata,
//     timeGrain,
//     editableColumns,
//     colnames,
//     coltypes,
//   ]);

//   const processRowUpdate = useCallback(
//     (newRow: GridRowModel, oldRow: GridRowModel) => {
//       // Preserve original date from previous state
//       if (oldRow.__originalDate) {
//         newRow.__originalDate = oldRow.__originalDate;
//       }

//       const changedFields = Object.keys(newRow).filter(
//         field => newRow[field] !== oldRow[field],
//       );

//       if (changedFields.length === 0) return oldRow;

//       const newEditedCells = new Set(editedCells);
//       changedFields.forEach(field => {
//         newEditedCells.add(`${newRow.id}-${field}`);
//       });
//       setEditedCells(newEditedCells);

//       setRows(prev =>
//         prev.map(row => (row.id === newRow.id ? { ...row, ...newRow } : row)),
//       );

//       setUpdatedRows(prev => {
//         const changedMeasures: Record<string, any> = {};
//         changedFields.forEach(field => {
//           if (editableColumns.includes(field)) {
//             changedMeasures[field] = newRow[field];
//           }
//         });

//         if (Object.keys(changedMeasures).length === 0) return prev;

//         const currentDimensions: Record<string, any> = {};
//         groupbyColumns.forEach((col: string) => {
//           currentDimensions[col] = newRow[col];
//         });

//         const existingIndex = prev.data.findIndex(item =>
//           groupbyColumns.every(
//             (col: string) => item.dimensions[col] === currentDimensions[col],
//           ),
//         );

//         const newData = [...prev.data];
//         if (existingIndex >= 0) {
//           newData[existingIndex] = {
//             ...newData[existingIndex],
//             measures: {
//               ...newData[existingIndex].measures,
//               ...changedMeasures,
//             },
//           };
//         } else {
//           newData.push({
//             dimensions: currentDimensions,
//             measures: changedMeasures,
//           });
//         }

//         return { ...prev, data: newData };
//       });

//       return newRow;
//     },
//     [editableColumns, groupbyColumns, editedCells],
//   );

//   const saveUpdates = useCallback(async () => {
//     if (updatedRows.data.length === 0) {
//       toast.info('No changes to save');
//       return;
//     }

//     try {
//       const payload = {
//         ...updatedRows,
//         data: updatedRows.data.map(item => {
//           const dimensions = { ...item.dimensions };
//           const measures = { ...item.measures };

//           // Find the original row to get the original date
//           const originalRow = rows.find(row =>
//             groupbyColumns.every((col: string) => row[col] === dimensions[col]),
//           );

//           // Use original date if available
//           const dateValue = originalRow?.__originalDate || dimensions.Date;

//           // Process date based on time grain for backend
//           if (dateValue) {
//             const date = new Date(dateValue);

//             if (!isNaN(date.getTime())) {
//               switch (timeGrain) {
//                 case 'P1Y':
//                   dimensions['Year(Date)'] = date.getUTCFullYear();
//                   delete dimensions.Date;
//                   break;
//                 case 'P1M':
//                   dimensions['Year(Date)'] = date.getUTCFullYear();
//                   dimensions['Month(Date)'] = date.getUTCMonth() + 1;
//                   delete dimensions.Date;
//                   break;
//                 case 'P1W':
//                   dimensions['Year(Date)'] = date.getUTCFullYear();
//                   // Calculate ISO week number
//                   const d = new Date(date);
//                   d.setUTCHours(0, 0, 0, 0);
//                   d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
//                   const yearStart = new Date(
//                     Date.UTC(d.getUTCFullYear(), 0, 1),
//                   );
//                   const weekNo = Math.ceil(
//                     ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
//                   );
//                   dimensions['Week(Date)'] = weekNo;
//                   delete dimensions.Date;
//                   break;
//                 default:
//                   // Keep original date format
//                   dimensions.Date = dateValue;
//                   break;
//               }
//             }
//           }

//           return { dimensions, measures };
//         }),
//       };

//       const response = await UpdateTable(payload, updateUrl);
//       if (response === 'OK') {
//         toast.success('Changes saved successfully!');
//         setEditedCells(new Set());
//         setUpdatedRows(prev => ({ ...prev, data: [] }));
//       } else {
//         toast.error('Failed to save changes. Server returned an error.');
//       }
//     } catch (error) {
//       console.error('Update failed:', error);
//       toast.error('Failed to save changes. Please try again.');
//     }
//   }, [updatedRows, updateUrl, timeGrain, rows, groupbyColumns]);

//   const CustomToolbar = useCallback(
//     () => (
//       <GridToolbarContainer
//         sx={{
//           minHeight: '40px',
//           padding: '0',
//           '& .MuiButton-root, & .MuiInput-root': {
//             fontSize: '13px',
//           },
//           '& .MuiInput-root': {
//             padding: '4px 8px',
//             height: '32px',
//           },
//         }}
//       >
//         <GridToolbarQuickFilter
//           debounceMs={500}
//           placeholder="Search..."
//           size="small"
//         />
//         <Box sx={{ flexGrow: 1 }} />
//         <Button
//           variant="contained"
//           onClick={saveUpdates}
//           size="small"
//           disabled={editedCells.size === 0}
//           sx={{
//             padding: '5px 10px',
//             fontSize: '14px',
//             fontWeight: 600,
//             textTransform: 'none',
//             borderRadius: '5px',
//             background: '#209eb2',
//             color: '#ffffff',
//             boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
//             transition: 'all 0.3s ease',
//             '&:hover': {
//               backgroundColor: '#11c3e0',
//               boxShadow: '0px 6px 8px rgba(0, 0, 0, 0.15)',
//             },
//             '&:disabled': {
//               backgroundColor: '#e0e0e0',
//               color: '#9e9e9e',
//               boxShadow: 'none',
//             },
//           }}
//         >
//           Save Changes {editedCells.size > 0 ? `(${editedCells.size})` : ''}
//         </Button>
//       </GridToolbarContainer>
//     ),
//     [saveUpdates, editedCells.size],
//   );

//   const columns = useMemo(() => {
//     return baseColumns.map(col => ({
//       ...col,
//       cellClassName: (params: any) =>
//         editedCells.has(`${params.id}-${params.field}`) ? 'cell-highlight' : '',
//     }));
//   }, [baseColumns, editedCells]);

//   if (loading) return <div>Loading chart data...</div>;
//   if (error) return <div style={{ color: 'red', margin: '1rem' }}>{error}</div>;
//   if (!rows.length) return <div>No data available for this chart.</div>;

//   return (
//     <ThemeProvider theme={theme}>
//       <Styles height={height} width={width}>
//         <ToastContainer position="bottom-right" theme="dark" />
//         <DataGrid
//           rows={rows}
//           columns={columns}
//           getRowId={row => row.id}
//           editMode="cell"
//           processRowUpdate={processRowUpdate}
//           slots={{ toolbar: CustomToolbar }}
//           rowHeight={35}
//           pageSizeOptions={[10, 25, 50, 100]}
//           disableColumnMenu
//           sx={{
//             backgroundColor: '#fff',
//             border: 'none',
//             fontFamily: '"Segoe UI", sans-serif',
//             fontSize: '13px',
//             color: '#444',

//             '& .MuiDataGrid-root': {
//               border: 'none',
//               backgroundColor: '#fff',
//               fontFamily: '"Segoe UI", sans-serif',
//               fontSize: '13px',
//               color: '#444',
//             },
//             '& .MuiDataGrid-columnHeaders': {
//               borderBottom: '1px solid #e8e8e8',
//               minHeight: '32px !important',
//               backgroundColor: '#fff',
//             },
//             '& .MuiDataGrid-columnHeader': {
//               fontWeight: 500,
//               '& .MuiDataGrid-columnHeaderTitleContainer': {
//                 justifyContent: 'flex-start',
//                 paddingLeft: '8px',
//               },
//             },
//             '& .MuiDataGrid-row': {
//               borderBottom: '1px solid #e8e8e8',
//               '&:hover': {
//                 backgroundColor: '#fafafa !important',
//               },
//             },
//             '& .MuiDataGrid-cell': {
//               padding: '0 6px',
//               borderRight: '1px solid #e8e8e8',
//               display: 'flex',
//               alignItems: 'center',
//               '&.readonly-cell': {
//                 backgroundColor: '#f8f9fa !important',
//                 '&::after': {
//                   content: '"🔒"',
//                   marginLeft: '3px',
//                   opacity: 0.4,
//                   fontSize: '10px',
//                 },
//               },
//             },

//             // Highlighted cells (edited)
//             '& .cell-highlight': {
//               backgroundColor: '#fdf3d3',
//               transition: 'background-color 0.3s',
//             },

//             // Numeric header alignment
//             '& .numeric-header .MuiDataGrid-columnHeaderTitleContainer': {
//               justifyContent: 'flex-end',
//               paddingRight: '8px',
//             },

//             // Text header alignment
//             '& .text-header .MuiDataGrid-columnHeaderTitleContainer': {
//               justifyContent: 'flex-start',
//               paddingLeft: '8px',
//             },

//             // Numeric cell input alignment
//             '& .numeric-cell input': {
//               textAlign: 'right',
//             },
//             '& .editable-header': {
//               backgroundColor: '#ffc000 !important',
//               fontWeight: 'bold !important',
//             },
//           }}
//         />
//       </Styles>
//     </ThemeProvider>
//   );
// };

// export default PluginChartEditableTable;

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { styled, GenericDataType } from '@superset-ui/core';
import {
  DataGrid,
  GridColDef,
  GridRowModel,
  GridToolbarContainer,
  GridToolbarQuickFilter,
} from '@mui/x-data-grid';
import { Button, Box } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PluginChartEditableTableProps } from './types';
import UpdateTable from './api/nifi';

interface StylesProps {
  height: number;
  width: number;
}

const Styles = styled.div<StylesProps>`
  height: ${({ height }) => height}px;
  width: ${({ width }) => width}px;
`;

const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

// Format temporal column values based on time grain
const breakDownDate = (dateValue: any, timeGrain: string): string | null => {
  if (!dateValue) return null;

  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return null;

    switch (timeGrain) {
      case 'P1Y':
        return `${date.getUTCFullYear()}`;
      case 'P1M': {
        const monthNames = [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ];
        return `${monthNames[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
      }
      case 'P1W': {
        const d = new Date(date);
        d.setUTCHours(0, 0, 0, 0);
        d.setUTCDate(d.getUTCDate() + 3 - (d.getUTCDay() || 7));
        const week1 = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
        week1.setUTCDate(week1.getUTCDate() + 3 - (week1.getUTCDay() || 7));
        const week = Math.ceil(
          ((d.getTime() - week1.getTime()) / 86400000 + 1) / 7,
        );
        return `W${week.toString().padStart(2, '0')}-${date.getUTCFullYear()}`;
      }
      default:
        return date.toISOString().split('T')[0];
    }
  } catch (error) {
    console.error('Date processing error:', error);
    return dateValue?.toString() ?? null;
  }
};

const PluginChartEditableTable: React.FC<PluginChartEditableTableProps> = ({
  height,
  width,
  queriesData,
  datasource,
  formData,
}) => {
  const {
    groupby: groupbyColumns = [],
    timeGrainSqla: timeGrain = 'P1M',
    datasource: datasetName = '',
    editableColumns = [],
    updateUrl = '',
  } = formData;

  // State
  const [rows, setRows] = useState<any[]>([]);
  const [baseColumns, setBaseColumns] = useState<GridColDef[]>([]);
  const [updatedRows, setUpdatedRows] = useState<{
    data: GridRowModel[];
    datasource: string;
  }>({ data: [], datasource: datasetName });
  const [editedCells, setEditedCells] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Query response
  const queryResponse = queriesData?.[0] || {};
  const queryData = queryResponse.data || [];
  const colnames = queryResponse.colnames || [];
  const coltypes = queryResponse.coltypes || [];
  const columnMetadata = datasource?.columns || [];

  // Track processed state
  const lastProcessedData = useRef<any>(null);

  // Identify temporal columns
  const temporalColumns = useMemo(
    () => colnames.filter((_, idx) => coltypes[idx] === 2),
    [colnames, coltypes],
  );

  // Process Superset query data
  useEffect(() => {
    if (queryData.length === 0 || colnames.length === 0) {
      setLoading(false);
      return;
    }

    const dataSignature = JSON.stringify({
      queryData: queryData.slice(0, 1),
      colnames,
      coltypes,
    });

    if (lastProcessedData.current === dataSignature) {
      setLoading(false);
      return;
    }

    try {
      const columnTypes: Record<string, GenericDataType> = {};
      columnMetadata.forEach((col: any) => {
        columnTypes[col.column_name] = col.type_generic;
      });

      const transformedData = queryData.map((row: any, index: number) => {
        const transformedRow = { ...row, id: row.id ?? index };

        // Handle all temporal columns dynamically
        temporalColumns.forEach((tcol: string) => {
          if (row[tcol]) {
            transformedRow[`__original_${tcol}`] = row[tcol];
            transformedRow[tcol] = breakDownDate(row[tcol], timeGrain);
          }
        });

        // Convert numeric
        colnames.forEach((col: string, idx: number) => {
          if (coltypes[idx] === 0) {
            transformedRow[col] = parseFloat(row[col]) || 0;
          }
        });

        return transformedRow;
      });

      // Grid column definitions
      const gridColumns = colnames.map((col: string, idx: number) => {
        const isEditable = editableColumns.includes(col);
        const isNumeric = coltypes[idx] === 0;
        const isTemporal = coltypes[idx] === 2;
        const headerName =
          columnMetadata.find((c: any) => c.column_name === col)
            ?.verbose_name || col;

        if (isTemporal) {
          return {
            field: col,
            headerName,
            flex: 1,
            editable: false,
            type: 'string',
            headerAlign: 'left',
            align: 'left',
            valueFormatter: (params: any) => params.value || '',
            renderCell: (params: any) => (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {params.formattedValue || params.value || ''}
              </div>
            ),
          };
        }

        return {
          field: col,
          headerName,
          flex: 1,
          editable: isEditable,
          type: isNumeric ? 'number' : 'string',
          headerAlign: isNumeric ? 'right' : 'left',
          align: isNumeric ? 'right' : 'left',
          headerClassName: isEditable ? 'editable-header' : '',
          valueFormatter: isNumeric
            ? (params: any) => (params?.value ?? 0).toString()
            : undefined,
          renderCell: !isEditable
            ? (params: any) => (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    justifyContent: isNumeric ? 'flex-end' : 'flex-start',
                  }}
                >
                  {String(params.formattedValue ?? params.value ?? '')}
                </div>
              )
            : undefined,
        };
      });

      setRows(transformedData);
      setBaseColumns(gridColumns);
      setLoading(false);
      lastProcessedData.current = dataSignature;
    } catch (err) {
      console.error('Error processing data:', err);
      setError('Failed to process data');
      setLoading(false);
    }
  }, [
    queryData,
    columnMetadata,
    timeGrain,
    editableColumns,
    colnames,
    coltypes,
    temporalColumns,
  ]);

  // Handle row edits
  const processRowUpdate = useCallback(
    (newRow: GridRowModel, oldRow: GridRowModel) => {
      // Preserve original temporal values
      temporalColumns.forEach(tcol => {
        if (oldRow[`__original_${tcol}`]) {
          newRow[`__original_${tcol}`] = oldRow[`__original_${tcol}`];
        }
      });

      const changedFields = Object.keys(newRow).filter(
        field => newRow[field] !== oldRow[field],
      );

      if (changedFields.length === 0) return oldRow;

      const newEditedCells = new Set(editedCells);
      changedFields.forEach(field => {
        newEditedCells.add(`${newRow.id}-${field}`);
      });
      setEditedCells(newEditedCells);

      setRows(prev =>
        prev.map(row => (row.id === newRow.id ? { ...row, ...newRow } : row)),
      );

      setUpdatedRows(prev => {
        const changedMeasures: Record<string, any> = {};
        changedFields.forEach(field => {
          if (editableColumns.includes(field)) {
            changedMeasures[field] = newRow[field];
          }
        });

        if (Object.keys(changedMeasures).length === 0) return prev;

        const currentDimensions: Record<string, any> = {};
        groupbyColumns.forEach((col: string) => {
          currentDimensions[col] = newRow[col];
        });

        const existingIndex = prev.data.findIndex(item =>
          groupbyColumns.every(
            (col: string) => item.dimensions[col] === currentDimensions[col],
          ),
        );

        const newData = [...prev.data];
        if (existingIndex >= 0) {
          newData[existingIndex] = {
            ...newData[existingIndex],
            measures: {
              ...newData[existingIndex].measures,
              ...changedMeasures,
            },
          };
        } else {
          newData.push({
            dimensions: currentDimensions,
            measures: changedMeasures,
          });
        }

        return { ...prev, data: newData };
      });

      return newRow;
    },
    [editableColumns, groupbyColumns, editedCells, temporalColumns],
  );

  // Save updates
  const saveUpdates = useCallback(async () => {
    if (updatedRows.data.length === 0) {
      toast.info('No changes to save');
      return;
    }

    try {
      const payload = {
        ...updatedRows,
        data: updatedRows.data.map(item => {
          const dimensions = { ...item.dimensions };
          const measures = { ...item.measures };

          temporalColumns.forEach(tcol => {
            const originalRow = rows.find(row =>
              groupbyColumns.every(
                (col: string) => row[col] === dimensions[col],
              ),
            );
            const dateValue =
              originalRow?.[`__original_${tcol}`] || dimensions[tcol];

            if (dateValue) {
              const date = new Date(dateValue);
              if (!isNaN(date.getTime())) {
                switch (timeGrain) {
                  case 'P1Y':
                    dimensions[`Year(${tcol})`] = date.getUTCFullYear();
                    delete dimensions[tcol];
                    break;
                  case 'P1M':
                    dimensions[`Year(${tcol})`] = date.getUTCFullYear();
                    dimensions[`Month(${tcol})`] = date.getUTCMonth() + 1;
                    delete dimensions[tcol];
                    break;
                  case 'P1W': {
                    dimensions[`Year(${tcol})`] = date.getUTCFullYear();
                    const d = new Date(date);
                    d.setUTCHours(0, 0, 0, 0);
                    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
                    const yearStart = new Date(
                      Date.UTC(d.getUTCFullYear(), 0, 1),
                    );
                    const weekNo = Math.ceil(
                      ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
                    );
                    dimensions[`Week(${tcol})`] = weekNo;
                    delete dimensions[tcol];
                    break;
                  }
                  default:
                    dimensions[tcol] = dateValue;
                    break;
                }
              }
            }
          });

          return { dimensions, measures };
        }),
      };

      const response = await UpdateTable(payload, updateUrl);
      if (response === 'OK') {
        toast.success('Changes saved successfully!');
        setEditedCells(new Set());
        setUpdatedRows(prev => ({ ...prev, data: [] }));
      } else {
        toast.error('Failed to save changes. Server returned an error.');
      }
    } catch (error) {
      console.error('Update failed:', error);
      toast.error('Failed to save changes. Please try again.');
    }
  }, [
    updatedRows,
    updateUrl,
    timeGrain,
    rows,
    groupbyColumns,
    temporalColumns,
  ]);

  // Toolbar
  const CustomToolbar = useCallback(
    () => (
      <GridToolbarContainer
        sx={{
          minHeight: '40px',
          padding: '0',
          '& .MuiButton-root, & .MuiInput-root': {
            fontSize: '13px',
          },
          '& .MuiInput-root': {
            padding: '4px 8px',
            height: '32px',
          },
        }}
      >
        <GridToolbarQuickFilter
          debounceMs={500}
          placeholder="Search..."
          size="small"
        />
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="contained"
          onClick={saveUpdates}
          size="small"
          disabled={editedCells.size === 0}
          sx={{
            padding: '5px 10px',
            fontSize: '14px',
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: '5px',
            background: '#209eb2',
            color: '#ffffff',
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: '#11c3e0',
              boxShadow: '0px 6px 8px rgba(0, 0, 0, 0.15)',
            },
            '&:disabled': {
              backgroundColor: '#e0e0e0',
              color: '#9e9e9e',
              boxShadow: 'none',
            },
          }}
        >
          Save Changes {editedCells.size > 0 ? `(${editedCells.size})` : ''}
        </Button>
      </GridToolbarContainer>
    ),
    [saveUpdates, editedCells.size],
  );

  // Add highlight class for edited cells
  const columns = useMemo(() => {
    return baseColumns.map(col => ({
      ...col,
      cellClassName: (params: any) =>
        editedCells.has(`${params.id}-${params.field}`) ? 'cell-highlight' : '',
    }));
  }, [baseColumns, editedCells]);

  // Render
  if (loading) return <div>Loading chart data...</div>;
  if (error) return <div style={{ color: 'red', margin: '1rem' }}>{error}</div>;
  if (!rows.length) return <div>No data available for this chart.</div>;

  return (
    <ThemeProvider theme={theme}>
      <Styles height={height} width={width}>
        <ToastContainer position="bottom-right" theme="dark" />
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={row => row.id}
          editMode="cell"
          processRowUpdate={processRowUpdate}
          slots={{ toolbar: CustomToolbar }}
          rowHeight={35}
          pageSizeOptions={[10, 25, 50, 100]}
          disableColumnMenu
          sx={{
            backgroundColor: '#fff',
            border: 'none',
            fontFamily: '"Segoe UI", sans-serif',
            fontSize: '13px',
            color: '#444',
            '& .MuiDataGrid-columnHeaders': {
              borderBottom: '1px solid #e8e8e8',
              minHeight: '32px !important',
              backgroundColor: '#fff',
            },
            '& .MuiDataGrid-columnHeader': {
              fontWeight: 500,
              '& .MuiDataGrid-columnHeaderTitleContainer': {
                justifyContent: 'flex-start',
                paddingLeft: '8px',
              },
            },
            '& .MuiDataGrid-row': {
              borderBottom: '1px solid #e8e8e8',
              '&:hover': {
                backgroundColor: '#fafafa !important',
              },
            },
            '& .MuiDataGrid-cell': {
              padding: '0 6px',
              borderRight: '1px solid #e8e8e8',
              display: 'flex',
              alignItems: 'center',
            },
            '& .cell-highlight': {
              backgroundColor: '#fdf3d3',
              transition: 'background-color 0.3s',
            },
            '& .editable-header': {
              backgroundColor: '#ffc000 !important',
              fontWeight: 'bold !important',
            },
          }}
        />
      </Styles>
    </ThemeProvider>
  );
};

export default PluginChartEditableTable;
