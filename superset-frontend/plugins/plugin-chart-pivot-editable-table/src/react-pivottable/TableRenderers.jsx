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

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { t, safeHtmlSpan } from '@superset-ui/core';
import PropTypes from 'prop-types';
import { PivotData, flatKey } from './utilities';
import { Styles } from './Styles';
import { css } from '@emotion/react';
import axios from 'axios';

const parseLabel = value => {
  if (typeof value === 'string') {
    if (value === 'metric') return t('metric');
    return value;
  }
  if (typeof value === 'number') {
    return value;
  }
  return String(value);
};

function displayCell(value, allowRenderHtml) {
  if (allowRenderHtml && typeof value === 'string') {
    return safeHtmlSpan(value);
  }
  return parseLabel(value);
}

function displayHeaderCell(
  needToggle,
  ArrowIcon,
  onArrowClick,
  value,
  namesMapping,
  allowRenderHtml,
) {
  const name = namesMapping[value] || value;
  const parsedLabel = parseLabel(name);
  const labelContent =
    allowRenderHtml && typeof parsedLabel === 'string'
      ? safeHtmlSpan(parsedLabel)
      : parsedLabel;
  return needToggle ? (
    <span className="toggle-wrapper">
      <span
        role="button"
        tabIndex="0"
        className="toggle"
        onClick={onArrowClick}
      >
        {ArrowIcon}
      </span>
      <span className="toggle-val">{labelContent}</span>
    </span>
  ) : (
    labelContent
  );
}

// class EditableCell extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       tempValue: String(props.value || ''),
//       isValid: true,
//     };
//     this.inputRef = null;
//   }

//   componentDidMount() {
//     if (this.inputRef) {
//       this.inputRef.focus();
//       this.inputRef.select();
//     }
//   }

//   componentDidUpdate(prevProps) {
//     if (prevProps.value !== this.props.value) {
//       this.setState({ tempValue: String(this.props.value || '') });
//     }
//   }

//   validateValue = value => {
//     const { validator = v => !isNaN(parseFloat(v)) && isFinite(v) } =
//       this.props;
//     return validator(value);
//   };

//   handleChange = e => {
//     const value = e.target.value;
//     const isValid = this.validateValue(value);
//     this.setState({
//       tempValue: value,
//       isValid,
//     });
//   };

//   handleSave = () => {
//     const { tempValue, isValid } = this.state;
//     const { onSave, onCancel } = this.props;

//     if (isValid && tempValue.trim() !== '') {
//       const numValue = parseFloat(tempValue);
//       onSave(numValue);
//     } else {
//       onCancel();
//     }
//   };

//   handleKeyPress = e => {
//     if (e.key === 'Enter') {
//       e.preventDefault();
//       this.handleSave();
//     } else if (e.key === 'Escape') {
//       e.preventDefault();
//       this.props.onCancel();
//     }
//   };

//   render() {
//     const { tempValue, isValid } = this.state;

//     // return (
//     //   <input
//     //     ref={ref => (this.inputRef = ref)}
//     //     type="text"
//     //     value={tempValue}
//     //     onChange={this.handleChange}
//     //     onKeyDown={this.handleKeyPress}
//     //     onBlur={this.handleSave}
//     //     css={css`
//     //       display: inline-block;
//     //       min-width: 40px;
//     //       max-width: 100%;
//     //       padding: 0 ${this.props.theme.sizeUnit}px;
//     //       margin: 0;
//     //       border-radius: 2px;
//     //       font-size: inherit;
//     //       font-family: inherit;
//     //       text-align: right;
//     //       background-color: ${isValid ? '#fff' : '#ffebee'};
//     //       box-sizing: border-box;
//     //       vertical-align: baseline;
//     //       background: transparent;
//     //       border: none;
//     //       outline: none;
//     //       width: 100%;
//     //       height: 100%;

//     //       &:focus {
//     //         outline: none;
//     //         border: 1px solid
//     //           ${isValid
//     //             ? this.props.theme.colors.success.base
//     //             : this.props.theme.colors.error.base};
//     //         box-shadow: 0 0 0 1px
//     //           ${isValid
//     //             ? this.props.theme.colors.success.base
//     //             : this.props.theme.colors.error.base}33;
//     //       }
//     //     `}
//     //   />
//     // );

//     // Updated one
//     // return (
//     //   <div
//     //     ref={ref => (this.cellRef = ref)}
//     //     contentEditable
//     //     suppressContentEditableWarning={true}
//     //     onInput={this.handleInput}
//     //     onKeyDown={this.handleKeyDown}
//     //     onBlur={this.handleSave}
//     //     css={css`
//     //       min-height: 20px;
//     //       padding: 4px 8px;
//     //       margin: 0;
//     //       border: none;
//     //       font-size: inherit;
//     //       font-family: inherit;
//     //       font-weight: inherit;
//     //       line-height: inherit;
//     //       text-align: right;
//     //       background-color: ${isValid ? '#f8f9fa' : '#ffebee'};
//     //       color: inherit;
//     //       cursor: text;
//     //       outline: none;
//     //       white-space: nowrap;
//     //       overflow: hidden;

//     //       &:focus {
//     //         background-color: ${isValid ? '#fff' : '#ffebee'};
//     //         box-shadow: inset 0 0 0 2px
//     //           ${isValid
//     //             ? this.props.theme.colors.success.base
//     //             : this.props.theme.colors.error.base}44;
//     //       }

//     //       &:empty::before {
//     //         content: 'Enter value...';
//     //         color: #999;
//     //         font-style: italic;
//     //       }
//     //     `}
//     //   >
//     //     {tempValue}
//     //   </div>
//     // );
//   }
// }

// class EditableCell extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       tempValue: String(props.value || ''),
//       isValid: true,
//     };
//     this.cellRef = null;
//   }

//   componentDidMount() {
//     if (this.cellRef) {
//       this.cellRef.focus();
//       const range = document.createRange();
//       range.selectNodeContents(this.cellRef);
//       const selection = window.getSelection();
//       selection.removeAllRanges();
//       selection.addRange(range);
//     }
//   }

//   componentDidUpdate(prevProps) {
//     if (prevProps.value !== this.props.value) {
//       this.setState({ tempValue: String(this.props.value || '') });
//     }
//   }

//   validateValue = value => {
//     const { validator = v => !isNaN(parseFloat(v)) && isFinite(v) } =
//       this.props;
//     return validator(value);
//   };

//   handleInput = e => {
//     const value = e.target.textContent;
//     const isValid = this.validateValue(value);
//     this.setState({
//       tempValue: value,
//       isValid,
//     });
//   };

//   handleSave = () => {
//     const { tempValue, isValid } = this.state;
//     const { onSave, onCancel } = this.props;

//     if (isValid && tempValue.trim() !== '') {
//       const numValue = parseFloat(tempValue);
//       onSave(numValue);
//     } else {
//       onCancel();
//     }
//   };

//   handleKeyDown = e => {
//     if (e.key === 'Enter') {
//       e.preventDefault();
//       this.handleSave();
//     } else if (e.key === 'Escape') {
//       e.preventDefault();
//       this.props.onCancel();
//     }
//   };

//   render() {
//     const { tempValue, isValid } = this.state;
//     const { theme } = this.props;

//     return (
//       <div
//         ref={ref => (this.cellRef = ref)}
//         contentEditable
//         suppressContentEditableWarning={true}
//         onInput={this.handleInput}
//         onKeyDown={this.handleKeyDown}
//         onBlur={this.handleSave}
//         css={css`
//           min-height: 20px;
//           padding: 4px 8px;
//           margin: 0;
//           border: none;
//           font-size: inherit;
//           font-family: inherit;
//           font-weight: inherit;
//           line-height: inherit;
//           text-align: right;
//           background-color: ${isValid ? '#f8f9fa' : '#ffebee'};
//           color: inherit;
//           cursor: text;
//           outline: none;
//           white-space: nowrap;
//           overflow: hidden;

//           &:focus {
//             background-color: ${isValid ? '#fff' : '#ffebee'};
//             box-shadow: inset 0 0 0 2px
//               ${isValid ? theme.colors.success.base : theme.colors.error.base}44;
//           }

//           &:empty::before {
//             content: 'Enter value...';
//             color: #999;
//             font-style: italic;
//           }
//         `}
//       >
//         {tempValue}
//       </div>
//     );
//   }
// }

// Latest

// Fixed EditableCell component with proper contentEditable handling
class EditableCell extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tempValue: String(props.value || ''),
      isValid: true,
    };
    this.cellRef = null;
  }

  componentDidMount() {
    if (this.cellRef) {
      this.cellRef.focus();
      // Select all text in contentEditable div
      const range = document.createRange();
      range.selectNodeContents(this.cellRef);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.value !== this.props.value) {
      this.setState({ tempValue: String(this.props.value || '') });
      // Update the contentEditable content
      if (this.cellRef) {
        this.cellRef.textContent = String(this.props.value || '');
      }
    }
  }

  validateValue = value => {
    const { validator = v => !isNaN(parseFloat(v)) && isFinite(v) } =
      this.props;
    return validator(value);
  };

  handleInput = e => {
    const value = e.target.textContent || '';
    const isValid = this.validateValue(value);
    this.setState({
      tempValue: value,
      isValid,
    });
  };

  handleSave = () => {
    const { tempValue, isValid } = this.state;
    const { onSave, onCancel } = this.props;

    if (isValid && tempValue.trim() !== '') {
      const numValue = parseFloat(tempValue);
      onSave(numValue);
    } else {
      onCancel();
    }
  };

  handleKeyDown = e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      this.handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      this.props.onCancel();
    }
    // Allow other keys to work normally for editing
  };

  handleBlur = e => {
    // Small delay to allow for potential click events to complete
    setTimeout(() => {
      this.handleSave();
    }, 100);
  };

  render() {
    const { tempValue, isValid } = this.state;
    const { theme } = this.props;

    // return (
    //   <div
    //     ref={ref => {
    //       this.cellRef = ref;
    //       // Set initial content
    //       if (ref && ref.textContent !== tempValue) {
    //         ref.textContent = tempValue;
    //       }
    //     }}
    //     contentEditable
    //     suppressContentEditableWarning={true}
    //     onInput={this.handleInput}
    //     onKeyDown={this.handleKeyDown}
    //     onBlur={this.handleBlur}
    //     css={css`
    //       min-height: 20px;
    //       min-width: 40px;
    //       padding: 4px 8px;
    //       margin: 0;
    //       border: 1px solid
    //         ${isValid
    //           ? this.props.theme.colors.primary.light3
    //           : this.props.theme.colors.error.light3};
    //       font-size: inherit;
    //       font-family: inherit;
    //       font-weight: inherit;
    //       line-height: inherit;
    //       text-align: right;
    //       background-color: ${isValid ? '#fff' : '#ffebee'};
    //       color: inherit;
    //       cursor: text;
    //       outline: none;
    //       white-space: nowrap;
    //       overflow: hidden;
    //       border-radius: 3px;

    //       &:focus {
    //         background-color: ${isValid ? '#fff' : '#ffebee'};
    //         border-color: ${isValid
    //           ? this.props.theme.colors.success.base
    //           : this.props.theme.colors.error.base};
    //         box-shadow: 0 0 0 2px
    //           ${isValid
    //             ? this.props.theme.colors.success.base
    //             : this.props.theme.colors.error.base}33;
    //       }

    //       &:empty::before {
    //         content: 'Enter value...';
    //         color: #999;
    //         font-style: italic;
    //       }
    //     `}
    //   />
    // );

    // return (
    //   <div
    //     ref={ref => {
    //       this.cellRef = ref;
    //       // Set initial content
    //       if (ref && ref.textContent !== tempValue) {
    //         ref.textContent = tempValue;
    //       }
    //     }}
    //     contentEditable
    //     suppressContentEditableWarning={true}
    //     onInput={this.handleInput}
    //     onKeyDown={this.handleKeyDown}
    //     onBlur={this.handleBlur}
    //     className={`ant-table-cell ${!isValid ? 'ant-form-item-has-error' : ''}`}
    //     css={css`
    //       all: unset;
    //       display: block;
    //       box-sizing: border-box;
    //       padding: inherit;
    //       margin: inherit;
    //       font-size: inherit;
    //       font-family: inherit;
    //       font-weight: inherit;
    //       line-height: inherit;
    //       text-align: inherit;
    //       color: inherit;
    //       background: inherit;
    //       border: inherit;
    //       cursor: text;
    //       min-width: 0;
    //       word-break: break-word;
    //       position: relative;

    //       &:focus {
    //         background-color: ${isValid ? '#f6ffed' : '#fff2f0'} !important;
    //         border-color: ${isValid ? '#52c41a' : '#ff4d4f'} !important;
    //         box-shadow: 0 0 0 2px
    //           ${isValid ? 'rgba(82, 196, 26, 0.2)' : 'rgba(255, 77, 79, 0.2)'};
    //         outline: none;
    //         z-index: 2;
    //       }

    //       &:empty::before {
    //         content: 'Enter value...';
    //         color: rgba(0, 0, 0, 0.25);
    //         font-style: italic;
    //         pointer-events: none;
    //       }

    //       /* Error state styling matching Ant Design */
    //       &.ant-form-item-has-error {
    //         border-color: #ff4d4f;
    //         background-color: #fff2f0;
    //       }
    //     `}
    //   />
    // );

    return (
      <div
        ref={ref => {
          this.cellRef = ref;
          if (ref && ref.textContent !== tempValue) {
            ref.textContent = tempValue;
          }
        }}
        contentEditable
        suppressContentEditableWarning={true}
        onInput={this.handleInput}
        onKeyDown={this.handleKeyDown}
        onBlur={this.handleBlur}
        className={`ant-table-cell ${!isValid ? 'ant-form-item-has-error' : ''}`}
        css={css`
          box-sizing: border-box;
          width: 100%; /* stay within the cell */
          height: 100%;
          padding: 4px 8px; /* similar to table cell padding */
          margin: 0;
          font-size: inherit;
          font-family: inherit;
          font-weight: inherit;
          line-height: inherit;
          text-align: inherit;
          color: inherit;
          background: #fff; /* always white */
          border: none; /* no border by default */
          outline: none;
          cursor: text;
          word-break: break-word;
          overflow: hidden;
          text-overflow: ellipsis;

          &:focus {
            background-color: #fff; /* keep white */
            border: none; /* no border glow */
            box-shadow: none; /* no focus shadow */
            outline: none;
          }

          &:empty::before {
            content: 'Enter value...';
            color: rgba(0, 0, 0, 0.25);
            font-style: italic;
            pointer-events: none;
          }

          /* Error state */
          &.ant-form-item-has-error {
            border: 1px solid #ff4d4f;
            background-color: #fff2f0;
          }
        `}
      />
    );
  }
}

// CellEditManager - Optimized state management for cell editing
class CellEditManager {
  constructor(
    rows,
    cols,
    data,
    aggregatorName,
    metrics,
    backendApiUrl,
    editableMetrics,
    datasource,
  ) {
    this.modifications = new Map();
    this.changeListeners = new Set();
    this.rows = rows;
    this.cols = cols;
    this.data = data;
    this.aggregatorName = aggregatorName;
    this.metrics = metrics;
    this.backendApiUrl = backendApiUrl;
    this.editableMetrics = editableMetrics;
    this.datasource = datasource;
  }

  addChangeListener = listener => {
    this.changeListeners.add(listener);
  };

  removeChangeListener = listener => {
    this.changeListeners.delete(listener);
  };

  notifyChange = () => {
    this.changeListeners.forEach(listener => listener());
  };

  getCellKey = (rowKey, colKey) => {
    return `${flatKey(rowKey)}::${flatKey(colKey)}`;
  };

  getValue = (rowKey, colKey, originalValue) => {
    const cellKey = this.getCellKey(rowKey, colKey);
    const modification = this.modifications.get(cellKey);
    return modification ? modification.current : originalValue;
  };

  setValue = (rowKey, colKey, originalValue, newValue) => {
    const getOriginalMetricName = displayLabel => {
      const metric = this.metrics.find(m => {
        if (typeof m === 'string') {
          return m === displayLabel;
        }
        // Assuming AdhocMetric has a 'label' and potentially 'column.column_name'
        return m.label === displayLabel;
      });
      // Return the original datasource column name if available, otherwise the metric string or label
      if (metric && typeof metric !== 'string' && metric.column?.column_name) {
        return metric.column.column_name;
      }
      return typeof metric === 'string' ? metric : metric?.label;
    };

    const cellKey = this.getCellKey(rowKey, colKey);

    let metricName = this.aggregatorName; // Default to aggregator name

    // Check if 'Metric' is part of rowKey or colKey and get the actual metric name
    const metricInRowKey = this.rows.includes('Metric');
    const metricInColKey = this.cols.includes('Metric');

    if (metricInRowKey) {
      const metricIndex = this.rows.indexOf('Metric');
      const metricDisplayLabel = rowKey[metricIndex]; // Assuming next element is the metric display label
      metricName = getOriginalMetricName(metricDisplayLabel) || metricName;
    } else if (metricInColKey) {
      const metricIndex = this.cols.indexOf('Metric');
      const metricDisplayLabel = colKey[metricIndex]; // Assuming next element is the metric display label
      metricName = getOriginalMetricName(metricDisplayLabel) || metricName;
    }

    if (newValue === originalValue) {
      // Remove modification if value equals original
      this.modifications.delete(cellKey);
    } else {
      this.modifications.set(cellKey, {
        original: originalValue,
        current: newValue,
        timestamp: Date.now(),
        rowKey,
        colKey,
        rowDimensions: this.rows,
        columnDimensions: this.cols,
        metric: metricName,
      });
    }

    this.notifyChange();
  };

  isModified = (rowKey, colKey) => {
    const cellKey = this.getCellKey(rowKey, colKey);
    return this.modifications.has(cellKey);
  };

  getModifications = () => {
    const payloadData = [];
    const processedDimensions = new Map();

    this.modifications.forEach(mod => {
      const dimensions = {};
      mod.rowKey.forEach((key, index) => {
        if (this.rows[index] && this.rows[index] !== 'Metric') {
          dimensions[this.rows[index]] = key;
        }
      });
      mod.colKey.forEach((key, index) => {
        if (this.cols[index] && this.cols[index] !== 'Metric') {
          dimensions[this.cols[index]] = key;
        }
      });

      const measures = { [mod.metric]: mod.current };

      // Create a unique key for the dimensions to check for existing entries
      const dimensionsKey = JSON.stringify(dimensions);

      if (processedDimensions.has(dimensionsKey)) {
        // If dimensions already exist, merge measures
        const existingEntry = processedDimensions.get(dimensionsKey);
        existingEntry.measures = { ...existingEntry.measures, ...measures };
      } else {
        // Otherwise, add a new entry
        const newEntry = { dimensions, measures };
        payloadData.push(newEntry);
        processedDimensions.set(dimensionsKey, newEntry);
      }
    });

    return {
      data: payloadData,
      datasource: this.datasource,
    };
  };

  clearModifications = () => {
    this.modifications.clear();
    this.notifyChange();
  };

  getModificationCount = () => {
    return this.modifications.size;
  };

  sendModifications = async () => {
    if (!this.backendApiUrl) {
      console.warn(
        'Backend API URL is not configured. Modifications will not be sent.',
      );
      return;
    }

    if (this.modifications.size === 0) {
      console.log('No modifications to send.');
      return;
    }

    const payload = this.getModifications();
    console.log('Sending modifications to backend:', payload);

    try {
      const response = await axios.post(this.backendApiUrl, payload);
      console.log('Modifications sent successfully:', response.data);
      // Optionally clear modifications after successful send
      // this.clearModifications();
    } catch (error) {
      console.error('Error sending modifications:', error);
      // Handle error, e.g., show a notification to the user
    }
  };
}

export const TableRenderer = React.memo(props => {
  const {
    data,
    aggregatorName,
    metrics,
    rows: initialRows,
    cols: initialCols,
    tableOptions,
    subtotalOptions,
    namesMapping,
    onContextMenu,
    onCellEdit,
    allowRenderHtml,
    theme,
    backendApiUrl,
    editableMetrics,
    datasource,
    metricsLayout,
  } = props;

  const [collapsedRows, setCollapsedRows] = useState({});
  const [collapsedCols, setCollapsedCols] = useState({});
  const [editingCell, setEditingCell] = useState(null); // { rowKey, colKey }
  const [forceUpdate, setForceUpdate] = useState(0); // For triggering re-renders when cell values change

  const cellEditManager = useMemo(
    () =>
      new CellEditManager(
        initialRows,
        initialCols,
        data,
        aggregatorName,
        metrics,
        backendApiUrl,
        editableMetrics,
        datasource,
      ),
    [
      initialRows,
      initialCols,
      data,
      aggregatorName,
      metrics,
      backendApiUrl,
      editableMetrics,
      datasource,
      metricsLayout,
    ],
  );

  useEffect(() => {
    cellEditManager.addChangeListener(() => setForceUpdate(prev => prev + 1));
    return () =>
      cellEditManager.removeChangeListener(() =>
        setForceUpdate(prev => prev + 1),
      );
  }, [cellEditManager]);

  const handleCellModification = useCallback(() => {
    // Trigger re-render when cell modifications change
    setForceUpdate(prev => prev + 1);
  }, []);

  // Expose methods for external access to modifications
  const getCellModifications = useCallback(() => {
    return cellEditManager.getModifications();
  }, [cellEditManager]);

  const clearCellModifications = useCallback(() => {
    cellEditManager.clearModifications();
  }, [cellEditManager]);

  const getModificationCount = useCallback(() => {
    return cellEditManager.getModificationCount();
  }, [cellEditManager]);

  const getBasePivotSettings = useCallback(() => {
    const colAttrs = initialCols;
    const rowAttrs = initialRows;

    const mergedTableOptions = {
      rowTotals: true,
      colTotals: true,
      ...tableOptions,
    };
    const rowTotals = mergedTableOptions.rowTotals || colAttrs.length === 0;
    const colTotals = mergedTableOptions.colTotals || rowAttrs.length === 0;

    const mergedNamesMapping = namesMapping || {};
    const mergedSubtotalOptions = {
      arrowCollapsed: '\u25B2',
      arrowExpanded: '\u25BC',
      ...subtotalOptions,
    };

    const colSubtotalDisplay = {
      displayOnTop: false,
      enabled: mergedTableOptions.colSubTotals,
      hideOnExpand: false,
      ...mergedSubtotalOptions.colSubtotalDisplay,
    };

    const rowSubtotalDisplay = {
      displayOnTop: false,
      enabled: mergedTableOptions.rowSubTotals,
      hideOnExpand: false,
      ...mergedSubtotalOptions.rowSubtotalDisplay,
    };

    const pivotData = new PivotData(props, {
      rowEnabled: rowSubtotalDisplay.enabled,
      colEnabled: colSubtotalDisplay.enabled,
      rowPartialOnTop: rowSubtotalDisplay.displayOnTop,
      colPartialOnTop: colSubtotalDisplay.displayOnTop,
    });
    const rowKeys = pivotData.getRowKeys();
    const colKeys = pivotData.getColKeys();

    const cellCallbacks = {};
    const rowTotalCallbacks = {};
    const colTotalCallbacks = {};
    let grandTotalCallback = null;

    if (mergedTableOptions.clickCallback) {
      rowKeys.forEach(rowKey => {
        const flatRowKey = flatKey(rowKey);
        if (!(flatRowKey in cellCallbacks)) {
          cellCallbacks[flatRowKey] = {};
        }
        colKeys.forEach(colKey => {
          cellCallbacks[flatRowKey][flatKey(colKey)] = clickHandler(
            pivotData,
            rowKey,
            colKey,
          );
        });
      });

      if (rowTotals) {
        rowKeys.forEach(rowKey => {
          rowTotalCallbacks[flatKey(rowKey)] = clickHandler(
            pivotData,
            rowKey,
            [],
          );
        });
      }
      if (colTotals) {
        colKeys.forEach(colKey => {
          colTotalCallbacks[flatKey(colKey)] = clickHandler(
            pivotData,
            [],
            colKey,
          );
        });
      }
      if (rowTotals && colTotals) {
        grandTotalCallback = clickHandler(pivotData, [], []);
      }
    }

    return {
      pivotData,
      colAttrs,
      rowAttrs,
      colKeys,
      rowKeys,
      rowTotals,
      colTotals,
      arrowCollapsed: mergedSubtotalOptions.arrowCollapsed,
      arrowExpanded: mergedSubtotalOptions.arrowExpanded,
      colSubtotalDisplay,
      rowSubtotalDisplay,
      cellCallbacks,
      rowTotalCallbacks,
      colTotalCallbacks,
      grandTotalCallback,
      namesMapping: mergedNamesMapping,
      allowRenderHtml: props.allowRenderHtml,
    };
  }, [
    aggregatorName,
    initialCols,
    initialRows,
    data,
    namesMapping,
    subtotalOptions,
    tableOptions,
    props.allowRenderHtml,
    props.onContextMenu,
    props.tableOptions.clickColumnHeaderCallback,
    props.tableOptions.clickRowHeaderCallback,
    props.tableOptions.clickCallback,
  ]);

  const clickHandler = useCallback(
    (pivotData, rowValues, colValues) => {
      const colAttrs = initialCols;
      const rowAttrs = initialRows;
      const value = pivotData.getAggregator(rowValues, colValues).value();
      const filters = {};
      const colLimit = Math.min(colAttrs.length, colValues.length);
      for (let i = 0; i < colLimit; i += 1) {
        const attr = colAttrs[i];
        if (colValues[i] !== null) {
          filters[attr] = colValues[i];
        }
      }
      const rowLimit = Math.min(rowAttrs.length, rowValues.length);
      for (let i = 0; i < rowLimit; i += 1) {
        const attr = rowAttrs[i];
        if (rowValues[i] !== null) {
          filters[attr] = rowValues[i];
        }
      }
      return e => tableOptions.clickCallback(e, value, filters, pivotData);
    },
    [tableOptions, initialCols, initialRows],
  );

  const clickHeaderHandler = useCallback(
    (
      pivotData,
      values,
      attrs,
      attrIdx,
      callback,
      isSubtotal = false,
      isGrandTotal = false,
    ) => {
      const filters = {};
      for (let i = 0; i <= attrIdx; i += 1) {
        const attr = attrs[i];
        filters[attr] = values[i];
      }
      return e =>
        callback(
          e,
          values[attrIdx],
          filters,
          pivotData,
          isSubtotal,
          isGrandTotal,
        );
    },
    [],
  );

  // Cell editing handlers
  const handleCellClick = useCallback(
    (rowKey, colKey, originalValue) => e => {
      if (tableOptions.clickCallback) {
        return;
      }
      e.stopPropagation();
      const isSameCell =
        editingCell &&
        flatKey(editingCell.rowKey) === flatKey(rowKey) &&
        flatKey(editingCell.colKey) === flatKey(colKey);

      if (!isSameCell) {
        setEditingCell({ rowKey, colKey, originalValue });
      }
    },
    [editingCell, tableOptions.clickCallback],
  );

  const handleCellSave = useCallback(
    (rowKey, colKey, originalValue, newValue) => {
      cellEditManager.setValue(rowKey, colKey, originalValue, newValue);
      setEditingCell(null);

      // Send modifications to backend immediately after a cell is saved
      cellEditManager.sendModifications();

      if (onCellEdit) {
        const modifications = cellEditManager.getModifications();
        const currentCellModification = modifications.data.find(
          // Assuming modifications.data is an array of data objects now
          dataItem => {
            // This part needs more robust logic to identify the exact modified cell within the new payload structure
            // For now, we'll simplify and just pass the full payload to onCellEdit if it exists
            // Or, ideally, onCellEdit would expect the full payload as well.
            // Given the new payload structure, passing a single `currentCellModification` isn't straightforward.
            // I will update this to pass the entire payload, as the `onCellEdit` signature would need to change otherwise.
            return false; // Temporarily return false as we're changing the onCellEdit usage
          },
        );
        // Pass the entire modifications payload to onCellEdit
        onCellEdit(modifications);
      }
    },
    [cellEditManager, onCellEdit],
  );

  const handleCellCancel = useCallback(() => {
    setEditingCell(null);
  }, []);

  const isEditingCell = useCallback(
    (rowKey, colKey) => {
      return (
        editingCell &&
        flatKey(editingCell.rowKey) === flatKey(rowKey) &&
        flatKey(editingCell.colKey) === flatKey(colKey)
      );
    },
    [editingCell],
  );

  const collapseAttr = useCallback(
    (rowOrCol, attrIdx, allKeys) => e => {
      e.stopPropagation();
      const keyLen = attrIdx + 1;
      const collapsed = allKeys.filter(k => k.length === keyLen).map(flatKey);

      const updates = {};
      collapsed.forEach(k => {
        updates[k] = true;
      });

      if (rowOrCol) {
        setCollapsedRows(state => ({ ...state, ...updates }));
      } else {
        setCollapsedCols(state => ({ ...state, ...updates }));
      }
    },
    [],
  );

  const expandAttr = useCallback(
    (rowOrCol, attrIdx, allKeys) => e => {
      e.stopPropagation();
      const updates = {};
      allKeys.forEach(k => {
        for (let i = 0; i <= attrIdx; i += 1) {
          updates[flatKey(k.slice(0, i + 1))] = false;
        }
      });

      if (rowOrCol) {
        setCollapsedRows(state => ({ ...state, ...updates }));
      } else {
        setCollapsedCols(state => ({ ...state, ...updates }));
      }
    },
    [],
  );

  const toggleRowKey = useCallback(
    flatRowKey => e => {
      e.stopPropagation();
      setCollapsedRows(state => ({
        ...state,
        [flatRowKey]: !state[flatRowKey],
      }));
    },
    [],
  );

  const toggleColKey = useCallback(
    flatColKey => e => {
      e.stopPropagation();
      setCollapsedCols(state => ({
        ...state,
        [flatColKey]: !state[flatColKey],
      }));
    },
    [],
  );

  const calcAttrSpans = useCallback((attrArr, numAttrs) => {
    const spans = [];
    const li = Array(numAttrs).fill(0);
    let lv = Array(numAttrs).fill(null);
    for (let i = 0; i < attrArr.length; i += 1) {
      const cv = attrArr[i];
      const ent = [];
      let depth = 0;
      const limit = Math.min(lv.length, cv.length);
      while (depth < limit && lv[depth] === cv[depth]) {
        ent.push(-1);
        spans[li[depth]][depth] += 1;
        depth += 1;
      }
      while (depth < cv.length) {
        li[depth] = i;
        ent.push(1);
        depth += 1;
      }
      spans.push(ent);
      lv = cv;
    }
    return spans;
  }, []);

  const cachedBasePivotSettings = useMemo(
    () => getBasePivotSettings(),
    [getBasePivotSettings],
  );

  const isDashboardEditMode = useCallback(() => {
    return document.contains(document.querySelector('.dashboard--editing'));
  }, []);

  const renderColHeaderRow = useCallback(
    (attrName, attrIdx, pivotSettings) => {
      const {
        rowAttrs,
        colAttrs,
        colKeys,
        visibleColKeys,
        colAttrSpans,
        rowTotals,
        arrowExpanded,
        arrowCollapsed,
        colSubtotalDisplay,
        maxColVisible,
        pivotData,
        namesMapping,
        allowRenderHtml,
      } = pivotSettings;
      const mergedTableOptions = tableOptions;
      const {
        highlightHeaderCellsOnHover,
        omittedHighlightHeaderGroups = [],
        highlightedHeaderCells,
        dateFormatters,
      } = mergedTableOptions;

      const spaceCell =
        attrIdx === 0 && rowAttrs.length !== 0 ? (
          <th
            key="padding"
            colSpan={rowAttrs.length}
            rowSpan={colAttrs.length}
            aria-hidden="true"
          />
        ) : null;

      const needToggle =
        colSubtotalDisplay.enabled && attrIdx !== colAttrs.length - 1;
      let arrowClickHandle = null;
      let subArrow = null;
      if (needToggle) {
        arrowClickHandle =
          attrIdx + 1 < maxColVisible
            ? collapseAttr(false, attrIdx, colKeys)
            : expandAttr(false, attrIdx, colKeys);
        subArrow = attrIdx + 1 < maxColVisible ? arrowExpanded : arrowCollapsed;
      }
      const attrNameCell = (
        <th key="label" className="pvtAxisLabel">
          {displayHeaderCell(
            needToggle,
            subArrow,
            arrowClickHandle,
            attrName,
            namesMapping,
            allowRenderHtml,
          )}
        </th>
      );

      const attrValueCells = [];
      const rowIncrSpan = rowAttrs.length !== 0 ? 1 : 0;
      let i = 0;
      while (i < visibleColKeys.length) {
        let handleContextMenu;
        const colKey = visibleColKeys[i];
        const colSpan = attrIdx < colKey.length ? colAttrSpans[i][attrIdx] : 1;
        let colLabelClass = 'pvtColLabel';
        if (attrIdx < colKey.length) {
          if (!omittedHighlightHeaderGroups.includes(colAttrs[attrIdx])) {
            if (highlightHeaderCellsOnHover) {
              colLabelClass += ' hoverable';
            }
            handleContextMenu = e =>
              onContextMenu(e, colKey, undefined, {
                [attrName]: colKey[attrIdx],
              });
          }
          if (
            highlightedHeaderCells &&
            Array.isArray(highlightedHeaderCells[colAttrs[attrIdx]]) &&
            highlightedHeaderCells[colAttrs[attrIdx]].includes(colKey[attrIdx])
          ) {
            colLabelClass += ' active';
          }

          const rowSpan =
            1 + (attrIdx === colAttrs.length - 1 ? rowIncrSpan : 0);
          const flatColKey = flatKey(colKey.slice(0, attrIdx + 1));
          const onArrowClick = needToggle ? toggleColKey(flatColKey) : null;

          const headerCellFormattedValue =
            dateFormatters &&
            dateFormatters[attrName] &&
            typeof dateFormatters[attrName] === 'function'
              ? dateFormatters[attrName](colKey[attrIdx])
              : colKey[attrIdx];
          attrValueCells.push(
            <th
              className={colLabelClass}
              key={`colKey-${flatColKey}`}
              colSpan={colSpan}
              rowSpan={rowSpan}
              role="columnheader button"
              onClick={clickHeaderHandler(
                pivotData,
                colKey,
                initialCols,
                attrIdx,
                mergedTableOptions.clickColumnHeaderCallback,
              )}
              onContextMenu={handleContextMenu}
            >
              {displayHeaderCell(
                needToggle,
                collapsedCols[flatColKey] ? arrowCollapsed : arrowExpanded,
                onArrowClick,
                headerCellFormattedValue,
                namesMapping,
                allowRenderHtml,
              )}
            </th>,
          );
        } else if (attrIdx === colKey.length) {
          const rowSpan = colAttrs.length - colKey.length + rowIncrSpan;
          attrValueCells.push(
            <th
              className={`${colLabelClass} pvtSubtotalLabel`}
              key={`colKeyBuffer-${flatKey(colKey)}`}
              colSpan={colSpan}
              rowSpan={rowSpan}
              role="columnheader button"
              onClick={clickHeaderHandler(
                pivotData,
                colKey,
                initialCols,
                attrIdx,
                mergedTableOptions.clickColumnHeaderCallback,
                true,
              )}
            >
              {t('Subtotal')}
            </th>,
          );
        }
        i += colSpan;
      }

      const totalCell =
        attrIdx === 0 && rowTotals ? (
          <th
            key="total"
            className="pvtTotalLabel"
            rowSpan={colAttrs.length + Math.min(rowAttrs.length, 1)}
            role="columnheader button"
            onClick={clickHeaderHandler(
              pivotData,
              [],
              initialCols,
              attrIdx,
              mergedTableOptions.clickColumnHeaderCallback,
              false,
              true,
            )}
          >
            {t('Total (%(aggregatorName)s)', {
              aggregatorName: t(aggregatorName),
            })}
          </th>
        ) : null;

      const cells = [spaceCell, attrNameCell, ...attrValueCells, totalCell];
      return <tr key={`colAttr-${attrIdx}`}>{cells}</tr>;
    },
    [
      collapsedCols,
      collapseAttr,
      expandAttr,
      toggleColKey,
      tableOptions,
      onContextMenu,
      clickHeaderHandler,
    ],
  );

  const renderRowHeaderRow = useCallback(
    pivotSettings => {
      const {
        rowAttrs,
        colAttrs,
        rowKeys,
        arrowCollapsed,
        arrowExpanded,
        rowSubtotalDisplay,
        maxRowVisible,
        pivotData,
        namesMapping,
        allowRenderHtml,
      } = pivotSettings;
      const mergedTableOptions = tableOptions;
      return (
        <tr key="rowHdr">
          {rowAttrs.map((r, i) => {
            const needLabelToggle =
              rowSubtotalDisplay.enabled && i !== rowAttrs.length - 1;
            let arrowClickHandle = null;
            let subArrow = null;
            if (needLabelToggle) {
              arrowClickHandle =
                i + 1 < maxRowVisible
                  ? collapseAttr(true, i, rowKeys)
                  : expandAttr(true, i, rowKeys);
              subArrow = i + 1 < maxRowVisible ? arrowExpanded : arrowCollapsed;
            }
            return (
              <th className="pvtAxisLabel" key={`rowAttr-${i}`}>
                {displayHeaderCell(
                  needLabelToggle,
                  subArrow,
                  arrowClickHandle,
                  r,
                  namesMapping,
                  allowRenderHtml,
                )}
              </th>
            );
          })}
          <th
            className="pvtTotalLabel"
            key="padding"
            role="columnheader button"
            onClick={clickHeaderHandler(
              pivotData,
              [],
              initialRows,
              0,
              mergedTableOptions.clickRowHeaderCallback,
              false,
              true,
            )}
          >
            {colAttrs.length === 0
              ? t('Total (%(aggregatorName)s)', {
                  aggregatorName: t(aggregatorName),
                })
              : null}
          </th>
        </tr>
      );
    },
    [
      collapsedRows,
      collapseAttr,
      expandAttr,
      toggleRowKey,
      tableOptions,
      onContextMenu,
      clickHeaderHandler,
    ],
  );

  const renderTableRow = useCallback(
    (rowKey, rowIdx, pivotSettings) => {
      const {
        rowAttrs,
        colAttrs,
        rowAttrSpans,
        visibleColKeys,
        pivotData,
        rowTotals,
        rowSubtotalDisplay,
        arrowExpanded,
        arrowCollapsed,
        cellCallbacks,
        rowTotalCallbacks,
        namesMapping,
        allowRenderHtml,
      } = pivotSettings;

      const mergedTableOptions = tableOptions;
      const {
        highlightHeaderCellsOnHover,
        omittedHighlightHeaderGroups = [],
        highlightedHeaderCells,
        cellColorFormatters,
        dateFormatters,
      } = mergedTableOptions;
      const flatRowKey = flatKey(rowKey);

      const colIncrSpan = colAttrs.length !== 0 ? 1 : 0;
      const attrValueCells = rowKey.map((r, i) => {
        let handleContextMenu;
        let valueCellClassName = 'pvtRowLabel';
        if (!omittedHighlightHeaderGroups.includes(rowAttrs[i])) {
          if (highlightHeaderCellsOnHover) {
            valueCellClassName += ' hoverable';
          }
          handleContextMenu = e =>
            onContextMenu(e, undefined, rowKey, {
              [rowAttrs[i]]: r,
            });
        }
        if (
          highlightedHeaderCells &&
          Array.isArray(highlightedHeaderCells[rowAttrs[i]]) &&
          highlightedHeaderCells[rowAttrs[i]].includes(r)
        ) {
          valueCellClassName += ' active';
        }
        const rowSpan = rowAttrSpans[rowIdx][i];
        if (rowSpan > 0) {
          const flatRowKey = flatKey(rowKey.slice(0, i + 1));
          const colSpan = 1 + (i === rowAttrs.length - 1 ? colIncrSpan : 0);
          const needRowToggle =
            rowSubtotalDisplay.enabled && i !== rowAttrs.length - 1;
          const onArrowClick = needRowToggle ? toggleRowKey(flatRowKey) : null;

          const headerCellFormattedValue =
            dateFormatters && dateFormatters[rowAttrs[i]]
              ? dateFormatters[rowAttrs[i]](r)
              : r;
          return (
            <th
              key={`rowKeyLabel-${i}`}
              className={valueCellClassName}
              rowSpan={rowSpan}
              colSpan={colSpan}
              role="columnheader button"
              onClick={clickHeaderHandler(
                pivotData,
                rowKey,
                initialRows,
                i,
                mergedTableOptions.clickRowHeaderCallback,
              )}
              onContextMenu={handleContextMenu}
            >
              {displayHeaderCell(
                needRowToggle,
                collapsedRows[flatRowKey] ? arrowCollapsed : arrowExpanded,
                onArrowClick,
                headerCellFormattedValue,
                namesMapping,
                allowRenderHtml,
              )}
            </th>
          );
        }
        return null;
      });

      const attrValuePaddingCell =
        rowKey.length < rowAttrs.length ? (
          <th
            className="pvtRowLabel pvtSubtotalLabel"
            key="rowKeyBuffer"
            colSpan={rowAttrs.length - rowKey.length + colIncrSpan}
            rowSpan={1}
            role="columnheader button"
            onClick={clickHeaderHandler(
              pivotData,
              rowKey,
              initialRows,
              rowKey.length,
              mergedTableOptions.clickRowHeaderCallback,
              true,
            )}
          >
            {t('Subtotal')}
          </th>
        ) : null;

      const rowClickHandlers = cellCallbacks[flatRowKey] || {};
      const valueCells = visibleColKeys.map(colKey => {
        const flatColKey = flatKey(colKey);
        const agg = pivotData.getAggregator(rowKey, colKey);
        const originalValue = agg.value();

        const displayValue = cellEditManager.getValue(
          rowKey,
          colKey,
          originalValue,
        );
        const isModified = cellEditManager.isModified(rowKey, colKey);
        const isEditing = isEditingCell(rowKey, colKey);

        // Determine the actual metric name for this cell
        let currentMetricName = aggregatorName; // Default to aggregator name

        // Check if 'Metric' is part of rowAttrs or colAttrs
        const metricInRowAttrs = initialRows.includes('Metric');
        const metricInColAttrs = initialCols.includes('Metric');

        if (metricInRowAttrs) {
          const metricIndex = initialRows.indexOf('Metric');
          const metricDisplayLabel = rowKey[metricIndex];
          const metricObj = metrics.find(m =>
            typeof m === 'string'
              ? m === metricDisplayLabel
              : m.label === metricDisplayLabel,
          );
          if (metricObj) {
            currentMetricName =
              typeof metricObj === 'string'
                ? metricObj
                : metricObj.column?.column_name || metricObj.label;
          }
        } else if (metricInColAttrs) {
          const metricIndex = initialCols.indexOf('Metric');
          const metricDisplayLabel = colKey[metricIndex];
          const metricObj = metrics.find(m =>
            typeof m === 'string'
              ? m === metricDisplayLabel
              : m.label === metricDisplayLabel,
          );
          if (metricObj) {
            currentMetricName =
              typeof metricObj === 'string'
                ? metricObj
                : metricObj.column?.column_name || metricObj.label;
          }
        } else if (metricsLayout === null && metrics && metrics.length > 0) {
          // Single metric mode, and 'Metric' is not a dimension
          const firstMetric = metrics[0];
          currentMetricName =
            typeof firstMetric === 'string'
              ? firstMetric
              : firstMetric.column?.column_name || firstMetric.label;
        }

        const isEditableMetric =
          Array.isArray(editableMetrics) &&
          editableMetrics.includes(currentMetricName);

        const keys = [...rowKey, ...colKey];
        let backgroundColor;
        if (cellColorFormatters) {
          Object.values(cellColorFormatters).forEach(cellColorFormatter => {
            if (Array.isArray(cellColorFormatter)) {
              keys.forEach(key => {
                if (backgroundColor) {
                  return;
                }
                cellColorFormatter
                  .filter(formatter => formatter.column === key)
                  .forEach(formatter => {
                    const formatterResult =
                      formatter.getColorFromValue(originalValue);
                    if (formatterResult) {
                      backgroundColor = formatterResult;
                    }
                  });
              });
            }
          });
        }

        const cellStyle = {
          ...(agg.isSubtotal ? { fontWeight: 'bold' } : { backgroundColor }),
          ...(isModified
            ? {
                backgroundColor: theme.colors.warning.light4,
                borderLeft: `3px solid ${theme.colors.warning.base}`,
                position: 'relative',
              }
            : {}),
        };

        const cellClassName = `pvtVal ${isModified ? 'modified-cell' : ''}`;

        return (
          <td
            role="gridcell"
            className={cellClassName}
            key={`pvtVal-${flatColKey}`}
            onClick={
              isEditableMetric && !agg.isSubtotal && !agg.isGrandTotal
                ? handleCellClick(rowKey, colKey, originalValue)
                : rowClickHandlers[flatColKey]
            }
            onContextMenu={e => onContextMenu(e, colKey, rowKey)}
            style={cellStyle}
          >
            {isEditing &&
            isEditableMetric &&
            !agg.isSubtotal &&
            !agg.isGrandTotal ? (
              <EditableCell
                value={displayValue}
                onSave={newValue =>
                  handleCellSave(rowKey, colKey, originalValue, newValue)
                }
                onCancel={handleCellCancel}
                theme={theme}
              />
            ) : (
              <span
                title={
                  isModified
                    ? `Modified from ${originalValue} to ${displayValue}`
                    : ''
                }
              >
                {displayCell(agg.format(displayValue), allowRenderHtml)}
              </span>
            )}
          </td>
        );
      });

      let totalCell = null;
      if (rowTotals) {
        const agg = pivotData.getAggregator(rowKey, []);
        const originalValue = agg.value();
        const displayValue = cellEditManager.getValue(
          rowKey,
          [],
          originalValue,
        );
        const isModified = cellEditManager.isModified(rowKey, []);
        const isEditing = isEditingCell(rowKey, []);

        // Determine the metric for total cells (if applicable).
        // For total cells, the metric might not be directly in colKey/rowKey.
        // If 'Metric' is in initialRows/initialCols, the total cell represents the aggregation of all metrics.
        // In such cases, we assume total cells are not individually editable,
        // or we would need a more complex logic to identify which specific metric
        // within the total is being edited, which is beyond current scope.
        const isTotalEditableMetric = false; // Total cells are not considered individually editable for now.

        const cellStyle = {
          padding: `${theme.sizeUnit}px`,
          ...(isModified
            ? {
                backgroundColor: theme.colors.warning.light4,
                borderLeft: `3px solid ${theme.colors.warning.base}`,
              }
            : {}),
        };

        totalCell = (
          <td
            role="gridcell"
            key="total"
            className={`pvtTotal ${isModified ? 'modified-cell' : ''}`}
            onClick={
              isTotalEditableMetric && !agg.isSubtotal && !agg.isGrandTotal
                ? handleCellClick(rowKey, [], originalValue)
                : rowTotalCallbacks[flatRowKey]
            }
            onContextMenu={e => onContextMenu(e, undefined, rowKey)}
            style={cellStyle}
          >
            {isEditing &&
            isTotalEditableMetric &&
            !agg.isSubtotal &&
            !agg.isGrandTotal ? (
              <EditableCell
                value={displayValue}
                onSave={newValue =>
                  handleCellSave(rowKey, [], originalValue, newValue)
                }
                onCancel={handleCellCancel}
                theme={theme}
              />
            ) : (
              <span
                title={
                  isModified
                    ? `Modified from ${originalValue} to ${displayValue}`
                    : ''
                }
              >
                {displayCell(agg.format(displayValue), allowRenderHtml)}
              </span>
            )}
          </td>
        );
      }

      const rowCells = [
        ...attrValueCells,
        attrValuePaddingCell,
        ...valueCells,
        totalCell,
      ];

      return <tr key={`keyRow-${flatRowKey}`}>{rowCells}</tr>;
    },
    [
      cellEditManager,
      editingCell,
      handleCellClick,
      handleCellSave,
      handleCellCancel,
      isEditingCell,
      tableOptions,
      onContextMenu,
      initialCols,
      initialRows,
      theme,
      aggregatorName,
      editableMetrics,
      metrics,
      metricsLayout,
    ],
  );

  const renderTotalsRow = useCallback(
    pivotSettings => {
      const {
        rowAttrs,
        colAttrs,
        visibleColKeys,
        rowTotals,
        pivotData,
        colTotalCallbacks,
        grandTotalCallback,
      } = pivotSettings;

      const totalLabelCell = (
        <th
          key="label"
          className="pvtTotalLabel pvtRowTotalLabel"
          colSpan={rowAttrs.length + Math.min(colAttrs.length, 1)}
          role="columnheader button"
          onClick={clickHeaderHandler(
            pivotData,
            [],
            initialRows,
            0,
            tableOptions.clickRowHeaderCallback,
            false,
            true,
          )}
        >
          {t('Total (%(aggregatorName)s)', {
            aggregatorName: t(aggregatorName),
          })}
        </th>
      );

      const totalValueCells = visibleColKeys.map(colKey => {
        const flatColKey = flatKey(colKey);
        const agg = pivotData.getAggregator([], colKey);
        const originalValue = agg.value();
        const displayValue = cellEditManager.getValue(
          [],
          colKey,
          originalValue,
        );
        const isModified = cellEditManager.isModified([], colKey);
        const isEditing = isEditingCell([], colKey);

        // Determine the metric for total cells (if applicable).
        let currentMetricName = aggregatorName;
        const metricInColAttrs = initialCols.includes('Metric');

        if (metricInColAttrs) {
          const metricIndex = initialCols.indexOf('Metric');
          const metricDisplayLabel = colKey[metricIndex];
          const metricObj = metrics.find(m =>
            typeof m === 'string'
              ? m === metricDisplayLabel
              : m.label === metricDisplayLabel,
          );
          if (metricObj) {
            currentMetricName =
              typeof metricObj === 'string'
                ? metricObj
                : metricObj.column?.column_name || metricObj.label;
          }
        } else if (metricsLayout === null && metrics && metrics.length > 0) {
          // Single metric mode, and 'Metric' is not a dimension
          const firstMetric = metrics[0];
          currentMetricName =
            typeof firstMetric === 'string'
              ? firstMetric
              : firstMetric.column?.column_name || firstMetric.label;
        }

        const isEditableMetric =
          Array.isArray(editableMetrics) &&
          editableMetrics.includes(currentMetricName);

        const cellStyle = {
          padding: `${theme.sizeUnit}px`,
          ...(isModified
            ? {
                backgroundColor: theme.colors.warning.light4,
                borderLeft: `3px solid ${theme.colors.warning.base}`,
              }
            : {}),
        };

        return (
          <td
            role="gridcell"
            className={`pvtTotal pvtRowTotal ${isModified ? 'modified-cell' : ''}`}
            key={`total-${flatColKey}`}
            onClick={
              isEditableMetric && !agg.isSubtotal && !agg.isGrandTotal
                ? handleCellClick([], colKey, originalValue)
                : colTotalCallbacks[flatColKey]
            }
            onContextMenu={e => onContextMenu(e, colKey, undefined)}
            style={cellStyle}
          >
            {isEditing &&
            isEditableMetric &&
            !agg.isSubtotal &&
            !agg.isGrandTotal ? (
              <EditableCell
                value={displayValue}
                onSave={newValue =>
                  handleCellSave([], colKey, originalValue, newValue)
                }
                onCancel={handleCellCancel}
                theme={theme}
              />
            ) : (
              <span
                title={
                  isModified
                    ? `Modified from ${originalValue} to ${displayValue}`
                    : ''
                }
              >
                {displayCell(agg.format(displayValue), allowRenderHtml)}
              </span>
            )}
          </td>
        );
      });

      let grandTotalCell = null;
      if (rowTotals) {
        const agg = pivotData.getAggregator([], []);
        const originalValue = agg.value();
        const displayValue = cellEditManager.getValue([], [], originalValue);
        const isModified = cellEditManager.isModified([], []);
        const isEditing = isEditingCell([], []);
        const isGrandTotalEditableMetric = false;

        const cellStyle = {
          padding: `${theme.sizeUnit}px`,
          ...(isModified
            ? {
                backgroundColor: theme.colors.warning.light4,
                borderLeft: `3px solid ${theme.colors.warning.base}`,
              }
            : {}),
        };

        grandTotalCell = (
          <td
            role="gridcell"
            key="total"
            className={`pvtGrandTotal pvtRowTotal ${isModified ? 'modified-cell' : ''}`}
            onClick={
              isGrandTotalEditableMetric && !agg.isSubtotal && !agg.isGrandTotal
                ? handleCellClick([], [], originalValue)
                : grandTotalCallback
            }
            onContextMenu={e => onContextMenu(e, undefined, undefined)}
            style={cellStyle}
          >
            {isEditing &&
            isGrandTotalEditableMetric &&
            !agg.isSubtotal &&
            !agg.isGrandTotal ? (
              <EditableCell
                value={displayValue}
                onSave={newValue =>
                  handleCellSave([], [], originalValue, newValue)
                }
                onCancel={handleCellCancel}
                theme={theme}
              />
            ) : (
              <span
                title={
                  isModified
                    ? `Modified from ${originalValue} to ${displayValue}`
                    : ''
                }
              >
                {displayCell(agg.format(displayValue), allowRenderHtml)}
              </span>
            )}
          </td>
        );
      }

      const totalCells = [totalLabelCell, ...totalValueCells, grandTotalCell];

      return (
        <tr key="total" className="pvtRowTotals">
          {totalCells}
        </tr>
      );
    },
    [
      cellEditManager,
      editingCell,
      handleCellClick,
      handleCellSave,
      handleCellCancel,
      isEditingCell,
      tableOptions,
      onContextMenu,
      initialCols,
      initialRows,
      theme,
      aggregatorName,
      editableMetrics,
      metrics,
      metricsLayout,
    ],
  );

  const visibleKeys = useCallback(
    (keys, collapsed, numAttrs, subtotalDisplay) => {
      return keys.filter(
        key =>
          !key.some((k, j) => collapsed[flatKey(key.slice(0, j))]) &&
          (key.length === numAttrs ||
            flatKey(key) in collapsed ||
            !subtotalDisplay.hideOnExpand),
      );
    },
    [],
  );

  const {
    colAttrs,
    rowAttrs,
    rowKeys,
    colKeys,
    colTotals,
    rowSubtotalDisplay,
    colSubtotalDisplay,
  } = cachedBasePivotSettings;

  const visibleRowKeys = visibleKeys(
    rowKeys,
    collapsedRows,
    rowAttrs.length,
    rowSubtotalDisplay,
  );
  const visibleColKeys = visibleKeys(
    colKeys,
    collapsedCols,
    colAttrs.length,
    colSubtotalDisplay,
  );

  const pivotSettings = {
    visibleRowKeys,
    maxRowVisible: Math.max(...visibleRowKeys.map(k => k.length)),
    visibleColKeys,
    maxColVisible: Math.max(...visibleColKeys.map(k => k.length)),
    rowAttrSpans: calcAttrSpans(visibleRowKeys, rowAttrs.length),
    colAttrSpans: calcAttrSpans(visibleColKeys, colAttrs.length),
    allowRenderHtml,
    ...cachedBasePivotSettings,
  };

  const modifiedCellsStyle = css`
    .modified-cell {
      position: relative;
    }
    .modified-cell::after {
      content: '●';
      position: absolute;
      top: 2px;
      right: 4px;
      color: #ffc107;
      font-size: 8px;
    }
  `;

  return (
    <Styles isDashboardEditMode={isDashboardEditMode()}>
      <div css={modifiedCellsStyle}>
        <table className="pvtTable" role="grid">
          <thead>
            {colAttrs.map((c, j) => renderColHeaderRow(c, j, pivotSettings))}
            {rowAttrs.length !== 0 && renderRowHeaderRow(pivotSettings)}
          </thead>
          <tbody>
            {visibleRowKeys.map((r, i) => renderTableRow(r, i, pivotSettings))}
            {colTotals && renderTotalsRow(pivotSettings)}
          </tbody>
        </table>
      </div>
    </Styles>
  );
});

TableRenderer.propTypes = {
  ...PivotData.propTypes,
  tableOptions: PropTypes.object,
  onContextMenu: PropTypes.func,
  onCellEdit: PropTypes.func,
};

TableRenderer.defaultProps = {
  ...PivotData.defaultProps,
  tableOptions: {},
  onCellEdit: null,
};
