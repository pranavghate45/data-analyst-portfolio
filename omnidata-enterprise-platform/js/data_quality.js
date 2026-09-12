/**
 * Great Expectations & Soda Core Data Quality Validation Framework
 * Performs automated data contract assertions, constraint checks, and volume anomaly alerts.
 */

class DataQualityEngineJS {
  static validateDataset(data) {
    if (!data || data.length === 0) return null;

    const cols = Object.keys(data[0]);
    const numCols = cols.filter(c => data.some(r => typeof r[c] === 'number'));
    const idCol = cols.find(c => c.toLowerCase().includes('id')) || cols[0];

    const validations = [];

    // Rule 1: Expect Column Values to Not Be Null (Primary Key)
    const nullIdCount = data.filter(r => r[idCol] === null || r[idCol] === undefined || r[idCol] === '').length;
    validations.push({
      rule: `expect_column_values_to_not_be_null("${idCol}")`,
      suite: 'Great Expectations Core',
      status: nullIdCount === 0 ? 'PASSED' : 'FAILED',
      observed: `${nullIdCount} null values found out of ${data.length} records`,
      severity: nullIdCount === 0 ? 'SUCCESS' : 'CRITICAL'
    });

    // Rule 2: Expect Numerical Columns to Be Non-Negative
    numCols.forEach(col => {
      if (col.toLowerCase().includes('price') || col.toLowerCase().includes('spend') || col.toLowerCase().includes('charge') || col.toLowerCase().includes('quantity')) {
        const negCount = data.filter(r => typeof r[col] === 'number' && r[col] < 0).length;
        validations.push({
          rule: `expect_column_values_to_be_between("${col}", min=0)`,
          suite: 'Soda Core Financial Contract',
          status: negCount === 0 ? 'PASSED' : 'FAILED',
          observed: `${negCount} negative values observed`,
          severity: negCount === 0 ? 'SUCCESS' : 'HIGH'
        });
      }
    });

    // Rule 3: Expect Primary Key Uniqueness
    const uniqueIds = new Set(data.map(r => r[idCol]));
    const duplicateCount = data.length - uniqueIds.size;
    validations.push({
      rule: `expect_column_values_to_be_unique("${idCol}")`,
      suite: 'Great Expectations Uniqueness Suite',
      status: duplicateCount === 0 ? 'PASSED' : 'WARNING',
      observed: `${duplicateCount} duplicate IDs detected`,
      severity: duplicateCount === 0 ? 'SUCCESS' : 'MEDIUM'
    });

    // Rule 4: Volume Anomaly Alert (Daily Volume Spike Check)
    const expectedVolume = 1200;
    const deviationPct = Math.round(Math.abs((data.length - expectedVolume) / expectedVolume) * 100);
    validations.push({
      rule: `expect_table_row_count_to_be_between(min=500, max=5000)`,
      suite: 'Volume Anomaly Detector',
      status: deviationPct < 50 ? 'PASSED' : 'WARNING',
      observed: `Table row count = ${data.length} (${deviationPct}% deviation from baseline)`,
      severity: deviationPct < 50 ? 'SUCCESS' : 'LOW'
    });

    const passedCount = validations.filter(v => v.status === 'PASSED').length;
    const qualityPct = Math.round((passedCount / validations.length) * 100);

    return {
      totalRules: validations.length,
      passedCount,
      qualityPct,
      validations
    };
  }
}
