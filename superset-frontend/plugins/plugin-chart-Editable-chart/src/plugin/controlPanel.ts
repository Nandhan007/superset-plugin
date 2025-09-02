// /**
//  * Licensed to the Apache Software Foundation (ASF) under one
//  * or more contributor license agreements.  See the NOTICE file
//  * distributed with this work for additional information
//  * regarding copyright ownership.  The ASF licenses this file
//  * to you under the Apache License, Version 2.0 (the
//  * "License"); you may not use this file except in compliance
//  * with the License.  You may obtain a copy of the License at
//  *
//  *   http://www.apache.org/licenses/LICENSE-2.0
//  *
//  * Unless required by applicable law or agreed to in writing,
//  * software distributed under the License is distributed on an
//  * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
//  * KIND, either express or implied.  See the License for the
//  * specific language governing permissions and limitations
//  * under the License.
//  */

import { t, validateNonEmpty } from '@superset-ui/core';
import {
  ControlPanelConfig,
  // ControlPanelsContainerProps,
  sharedControls,
  // isAdhocColumn,
  // isPhysicalColumn,
  // ensureIsArray,
} from '@superset-ui/chart-controls';

const config: ControlPanelConfig = {
  controlPanelSections: [
    {
      label: t('Query'),
      expanded: true,
      controlSetRows: [
        ['dataset'],
        [
          {
            name: 'groupby',
            config: {
              ...sharedControls.groupby,
              label: t('Dimensions'),
              description: t('Columns to use for grouping'),
            },
          },
        ],
        [
          {
            name: 'metrics',
            config: {
              ...sharedControls.metrics,
              label: t('Metrices'),
              validators: [validateNonEmpty],
            },
          },
        ],
        [
          {
            name: 'time_grain_sqla',
            config: {
              ...sharedControls.time_grain_sqla,
              label: t('Time Grain'),
              description: t(
                'Time granularity for temporal columns in Group By or filters',
              ),
            },
          },
        ],
        ['adhoc_filters'],
        ['row_limit'],
      ],
    },
    {
      label: t('Editable Table Options'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'editable_columns',
            config: {
              type: 'SelectControl',
              multi: true,
              label: t('Editable Columns'),
              description: t('Columns that can be edited in the table'),
              default: [],
              rerender: ['metrics'], // Ensures live update when metrics change
              mapStateToProps: (state: any) => {
                const selectedMetrics = state.controls?.metrics?.value || [];
                const currentEditableColumns =
                  state.controls?.editable_columns?.value || [];

                // Generate options from current metrics
                const options = selectedMetrics.map((metric: any) => {
                  if (typeof metric === 'string')
                    return { value: metric, label: metric };
                  if (metric.label)
                    return { value: metric.label, label: metric.label };
                  if (
                    metric.expressionType === 'SIMPLE' &&
                    metric.column?.column_name
                  ) {
                    return {
                      value: metric.column.column_name,
                      label: metric.column.column_name,
                    };
                  }
                  return {
                    value: JSON.stringify(metric),
                    label: metric.label || JSON.stringify(metric),
                  };
                });

                // Filter current selections to only include valid/existing options
                const validSelections = currentEditableColumns.filter(
                  (selected: string) =>
                    options.some(
                      (opt: { value: string }) => opt.value === selected,
                    ),
                );

                return {
                  options,
                  value: validSelections, // Preserve valid user selections
                };
              },
            },
          },

          {
            name: 'update_url',
            config: {
              type: 'TextControl',
              label: t('Update Url'),
              description: t('Enter columns, one per line'),
              default: '',
              renderTrigger: true,
            },
          },
        ],
      ],
    },
  ],
};

export default config;

// import { t, validateNonEmpty } from '@superset-ui/core';
// import {
//   ControlPanelConfig,
//   sharedControls,
// } from '@superset-ui/chart-controls';

// const config: ControlPanelConfig = {
//   controlPanelSections: [
//     {
//       label: t('Query'),
//       expanded: true,
//       controlSetRows: [
//         ['dataset'],
//         [
//           {
//             name: 'groupby',
//             config: {
//               ...sharedControls.groupby,
//               label: t('Dimensions'),
//               description: t('Columns to use for grouping'),
//             },
//           },
//         ],
//         [
//           {
//             name: 'metrics',
//             config: {
//               ...sharedControls.metrics,
//               label: t('Metrices'),
//               validators: [validateNonEmpty],
//             },
//           },
//         ],
//         [
//           {
//             name: 'time_grain_sqla',
//             config: {
//               ...sharedControls.time_grain_sqla,
//               label: t('Time Grain'),
//               description: t(
//                 'Time granularity for temporal columns in Group By or filters',
//               ),
//             },
//           },
//         ],
//         ['adhoc_filters'],
//         ['row_limit'],
//       ],
//     },
//     {
//       label: t('Editable Table Options'),
//       expanded: true,
//       controlSetRows: [
//         [
//           {
//             name: 'editable_columns',
//             config: {
//               type: 'SelectControl',
//               multi: true,
//               label: t('Editable Columns'),
//               description: t('Columns that can be edited in the table'),
//               default: [],
//               renderTrigger: true,
//               mapStateToProps: (state: any) => {
//                 const selectedMetrics = state.controls?.metrics?.value || [];
//                 const currentEditableColumns =
//                   state.controls?.editable_columns?.value || [];

//                 // Generate options with stable values and dynamic labels
//                 const options = selectedMetrics.map((metric: any) => {
//                   let value: string;
//                   let label: string = '';

//                   if (typeof metric === 'string') {
//                     value = metric;
//                     label = metric;
//                   } else {
//                     label = metric.label || '';
//                     if (metric.expressionType === 'SIMPLE') {
//                       const columnName = metric.column?.column_name || '';
//                       const aggregate = metric.aggregate || '';
//                       value = `SIMPLE:${aggregate}:${columnName}`;
//                       if (!label) {
//                         label = `${aggregate}(${columnName})`;
//                       }
//                     } else if (metric.expressionType === 'SQL') {
//                       const sql = metric.sqlExpression || '';
//                       value = `SQL:${sql}`;
//                       if (!label) {
//                         label = sql;
//                       }
//                     } else {
//                       value = JSON.stringify(metric);
//                       if (!label) {
//                         label = value;
//                       }
//                     }
//                   }

//                   return { value, label };
//                 });

//                 // Filter current selections to only include valid/existing options
//                 const validSelections = currentEditableColumns.filter(
//                   (selected: string) =>
//                     options.some(
//                       (opt: { value: string }) => opt.value === selected,
//                     ),
//                 );

//                 return {
//                   options,
//                   value: validSelections, // Preserve valid user selections
//                 };
//               },
//             },
//           },

//           {
//             name: 'update_url',
//             config: {
//               type: 'TextControl',
//               label: t('Update Url'),
//               description: t('Enter the Update Url'),
//               default: '',
//               renderTrigger: true,
//             },
//           },
//         ],
//       ],
//     },
//   ],
// };

// export default config;
