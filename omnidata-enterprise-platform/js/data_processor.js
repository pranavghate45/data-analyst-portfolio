/**
 * Data Processor Engine for OmniData Analytics Suite
 * Performs Data Cleaning, Wrangling, Feature Scaling, Outlier Detection, Statistics & Correlations.
 */

class DataProcessor {
  /**
   * Parse CSV string into array of objects
   */
  static parseCSV(csvText) {
    const lines = csvText.trim().split(/\r\n|\n/);
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      // Handle simple CSV splitting (considering basic quotes)
      const values = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
      const row = {};

      headers.forEach((h, idx) => {
        let val = values[idx] ? values[idx].trim().replace(/^"|"$/g, '') : "";
        if (val === "" || val === "null" || val === "NaN" || val === "undefined") {
          row[h] = null;
        } else if (!isNaN(val) && val !== "") {
          row[h] = val.includes('.') ? parseFloat(val) : parseInt(val, 10);
        } else {
          row[h] = val;
        }
      });
      rows.push(row);
    }
    return rows;
  }

  /**
   * Get column type (numeric, categorical, datetime, ID)
   */
  static getColumnTypes(data) {
    if (!data || data.length === 0) return {};
    const sample = data[0];
    const types = {};

    Object.keys(sample).forEach(col => {
      const validVals = data.map(r => r[col]).filter(v => v !== null && v !== undefined);
      if (validVals.length === 0) {
        types[col] = 'unknown';
        return;
      }

      const numCount = validVals.filter(v => typeof v === 'number').length;
      const isNumeric = numCount / validVals.length > 0.8;

      if (isNumeric) {
        types[col] = 'numeric';
      } else {
        // Check date
        const dateMatch = validVals.filter(v => typeof v === 'string' && !isNaN(Date.parse(v))).length;
        if (dateMatch / validVals.length > 0.8) {
          types[col] = 'datetime';
        } else {
          types[col] = 'categorical';
        }
      }
    });

    return types;
  }

  /**
   * Calculate descriptive statistics for a numerical array
   */
  static getStats(values) {
    const valid = values.filter(v => typeof v === 'number' && !isNaN(v));
    if (valid.length === 0) return null;

    const n = valid.length;
    const missing = values.length - n;
    const sum = valid.reduce((a, b) => a + b, 0);
    const mean = sum / n;

    const sorted = [...valid].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[n - 1];

    const mid = Math.floor(n / 2);
    const median = n % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

    const q1 = sorted[Math.floor(n * 0.25)];
    const q3 = sorted[Math.floor(n * 0.75)];
    const iqr = q3 - q1;

    const variance = valid.reduce((acc, x) => acc + Math.pow(x - mean, 2), 0) / (n > 1 ? n - 1 : 1);
    const stdDev = Math.sqrt(variance);

    // Skewness & Kurtosis
    let m3 = 0, m4 = 0;
    valid.forEach(x => {
      const diff = x - mean;
      m3 += Math.pow(diff, 3);
      m4 += Math.pow(diff, 4);
    });
    const skewness = stdDev > 0 ? (m3 / n) / Math.pow(stdDev, 3) : 0;
    const kurtosis = stdDev > 0 ? (m4 / n) / Math.pow(stdDev, 4) - 3 : 0;

    return {
      count: n,
      missing: missing,
      missingPct: Math.round((missing / values.length) * 100 * 10) / 10,
      mean: Math.round(mean * 100) / 100,
      median: Math.round(median * 100) / 100,
      stdDev: Math.round(stdDev * 100) / 100,
      min: Math.round(min * 100) / 100,
      max: Math.round(max * 100) / 100,
      q1: Math.round(q1 * 100) / 100,
      q3: Math.round(q3 * 100) / 100,
      iqr: Math.round(iqr * 100) / 100,
      skewness: Math.round(skewness * 1000) / 1000,
      kurtosis: Math.round(kurtosis * 1000) / 1000
    };
  }

  /**
   * Impute missing values (Mean, Median, Mode, Constant)
   */
  static imputeMissing(data, column, method = 'mean', fillValue = 0) {
    const copy = JSON.parse(JSON.stringify(data));
    const valid = copy.map(r => r[column]).filter(v => v !== null && v !== undefined && !isNaN(v));

    let replacement = fillValue;
    if (valid.length > 0) {
      if (method === 'mean') {
        replacement = valid.reduce((a, b) => a + b, 0) / valid.length;
      } else if (method === 'median') {
        const sorted = [...valid].sort((a, b) => a - b);
        replacement = sorted[Math.floor(sorted.length / 2)];
      } else if (method === 'mode') {
        const counts = {};
        valid.forEach(v => counts[v] = (counts[v] || 0) + 1);
        replacement = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
      }
    }

    copy.forEach(row => {
      if (row[column] === null || row[column] === undefined || isNaN(row[column])) {
        row[column] = typeof replacement === 'number' ? Math.round(replacement * 100) / 100 : replacement;
      }
    });

    return copy;
  }

  /**
   * Detect Outliers using Z-Score (threshold default 3.0) or IQR (1.5 * IQR)
   */
  static detectOutliers(data, column, method = 'zscore', threshold = 3.0) {
    const stats = this.getStats(data.map(r => r[column]));
    if (!stats) return { outlierIndices: [], bounds: {} };

    const outlierIndices = [];
    let lowerBound, upperBound;

    if (method === 'zscore') {
      lowerBound = stats.mean - threshold * stats.stdDev;
      upperBound = stats.mean + threshold * stats.stdDev;
    } else {
      // IQR
      lowerBound = stats.q1 - 1.5 * stats.iqr;
      upperBound = stats.q3 + 1.5 * stats.iqr;
    }

    data.forEach((row, idx) => {
      const val = row[column];
      if (typeof val === 'number' && (val < lowerBound || val > upperBound)) {
        outlierIndices.push(idx);
      }
    });

    return {
      outlierIndices,
      outlierCount: outlierIndices.length,
      bounds: { lower: Math.round(lowerBound * 100) / 100, upper: Math.round(upperBound * 100) / 100 }
    };
  }

  /**
   * Filter outliers out of data
   */
  static removeOutliers(data, column, method = 'zscore', threshold = 3.0) {
    const { outlierIndices } = this.detectOutliers(data, column, method, threshold);
    const outlierSet = new Set(outlierIndices);
    return data.filter((_, idx) => !outlierSet.has(idx));
  }

  /**
   * Calculate Pearson Correlation Matrix between all numeric columns
   */
  static getCorrelationMatrix(data) {
    const types = this.getColumnTypes(data);
    const numCols = Object.keys(types).filter(c => types[c] === 'numeric');

    const matrix = {};
    numCols.forEach(c1 => {
      matrix[c1] = {};
      numCols.forEach(c2 => {
        matrix[c1][c2] = this.pearsonCorrelation(data.map(r => r[c1]), data.map(r => r[c2]));
      });
    });

    return { numCols, matrix };
  }

  /**
   * Pearson correlation between two numeric arrays
   */
  static pearsonCorrelation(xVals, yVals) {
    const pairs = [];
    for (let i = 0; i < xVals.length; i++) {
      const x = xVals[i];
      const y = yVals[i];
      if (typeof x === 'number' && typeof y === 'number' && !isNaN(x) && !isNaN(y)) {
        pairs.push([x, y]);
      }
    }

    const n = pairs.length;
    if (n < 2) return 0;

    const meanX = pairs.reduce((acc, p) => acc + p[0], 0) / n;
    const meanY = pairs.reduce((acc, p) => acc + p[1], 0) / n;

    let num = 0, denX = 0, denY = 0;
    pairs.forEach(([x, y]) => {
      const diffX = x - meanX;
      const diffY = y - meanY;
      num += diffX * diffY;
      denX += diffX * diffX;
      denY += diffY * diffY;
    });

    const den = Math.sqrt(denX * denY);
    return den !== 0 ? Math.round((num / den) * 1000) / 1000 : 0;
  }

  /**
   * Perform One-Hot Encoding on a categorical column
   */
  static oneHotEncode(data, column) {
    const copy = JSON.parse(JSON.stringify(data));
    const categories = [...new Set(copy.map(r => r[column]).filter(v => v !== null && v !== undefined))];

    copy.forEach(row => {
      const val = row[column];
      categories.forEach(cat => {
        const colName = `${column}_${String(cat).replace(/\s+/g, '_')}`;
        row[colName] = (val === cat) ? 1 : 0;
      });
    });

    return copy;
  }

  /**
   * Scale a numeric column using Min-Max Scaling (0-1) or Z-score standardization
   */
  static scaleColumn(data, column, method = 'minmax') {
    const copy = JSON.parse(JSON.stringify(data));
    const stats = this.getStats(copy.map(r => r[column]));
    if (!stats) return copy;

    copy.forEach(row => {
      const val = row[column];
      if (typeof val === 'number') {
        if (method === 'minmax') {
          const range = stats.max - stats.min;
          row[column] = range !== 0 ? Math.round(((val - stats.min) / range) * 1000) / 1000 : 0;
        } else if (method === 'zscore') {
          row[column] = stats.stdDev !== 0 ? Math.round(((val - stats.mean) / stats.stdDev) * 1000) / 1000 : 0;
        }
      }
    });

    return copy;
  }

  /**
   * Drop selected column from data
   */
  static dropColumn(data, column) {
    return data.map(row => {
      const copy = { ...row };
      delete copy[column];
      return copy;
    });
  }

  /**
   * Remove exact duplicate rows
   */
  static removeDuplicates(data) {
    const seen = new Set();
    return data.filter(row => {
      const serialized = JSON.stringify(row);
      if (seen.has(serialized)) return false;
      seen.add(serialized);
      return true;
    });
  }
}

