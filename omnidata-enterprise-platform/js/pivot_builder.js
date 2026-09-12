/**
 * Pivot Table & Aggregation Engine for OmniData Analytics Suite
 */

class PivotBuilder {
  static generatePivotTable(data, rowAttr, colAttr, valAttr, aggFunc = 'mean') {
    if (!data || data.length === 0 || !rowAttr || !valAttr) return null;

    const rowKeys = [...new Set(data.map(r => r[rowAttr]).filter(v => v !== null && v !== undefined))].sort();
    const colKeys = colAttr ? [...new Set(data.map(r => r[colAttr]).filter(v => v !== null && v !== undefined))].sort() : ['Value'];

    const matrix = {};
    rowKeys.forEach(r => {
      matrix[r] = {};
      colKeys.forEach(c => matrix[r][c] = []);
    });

    data.forEach(row => {
      const rVal = row[rowAttr];
      const cVal = colAttr ? row[colAttr] : 'Value';
      const num = row[valAttr];

      if (rVal !== null && rVal !== undefined && matrix[rVal] && matrix[rVal][cVal]) {
        if (typeof num === 'number' && !isNaN(num)) {
          matrix[rVal][cVal].push(num);
        }
      }
    });

    // Aggregate matrix & totals
    const resultMatrix = {};
    const rowTotals = {};
    const colTotals = {};
    colKeys.forEach(c => colTotals[c] = []);

    let grandTotalArr = [];

    rowKeys.forEach(r => {
      resultMatrix[r] = {};
      let rowAllValues = [];
      colKeys.forEach(c => {
        const arr = matrix[r][c];
        rowAllValues.push(...arr);
        colTotals[c].push(...arr);
        grandTotalArr.push(...arr);

        if (arr.length === 0) {
          resultMatrix[r][c] = 0;
        } else if (aggFunc === 'sum') {
          resultMatrix[r][c] = Math.round(arr.reduce((a, b) => a + b, 0) * 100) / 100;
        } else if (aggFunc === 'count') {
          resultMatrix[r][c] = arr.length;
        } else if (aggFunc === 'min') {
          resultMatrix[r][c] = Math.round(Math.min(...arr) * 100) / 100;
        } else if (aggFunc === 'max') {
          resultMatrix[r][c] = Math.round(Math.max(...arr) * 100) / 100;
        } else {
          // Mean
          resultMatrix[r][c] = Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 100) / 100;
        }
      });

      // Calculate row total
      rowTotals[r] = PivotBuilder._calcAgg(rowAllValues, aggFunc);
    });

    const finalColTotals = {};
    colKeys.forEach(c => {
      finalColTotals[c] = PivotBuilder._calcAgg(colTotals[c], aggFunc);
    });

    const grandTotal = PivotBuilder._calcAgg(grandTotalArr, aggFunc);

    return {
      rowKeys,
      colKeys,
      matrix: resultMatrix,
      rowTotals,
      colTotals: finalColTotals,
      grandTotal,
      aggFunc,
      rowAttr,
      colAttr,
      valAttr
    };
  }

  static _calcAgg(arr, aggFunc) {
    if (!arr || arr.length === 0) return 0;
    if (aggFunc === 'sum') return Math.round(arr.reduce((a, b) => a + b, 0) * 100) / 100;
    if (aggFunc === 'count') return arr.length;
    if (aggFunc === 'min') return Math.round(Math.min(...arr) * 100) / 100;
    if (aggFunc === 'max') return Math.round(Math.max(...arr) * 100) / 100;
    return Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 100) / 100;
  }
}
