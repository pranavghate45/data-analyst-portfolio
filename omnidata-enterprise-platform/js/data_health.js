/**
 * Data Quality Health Score Engine (0-100 Rating Scale)
 */

class DataHealthJS {
  static evaluateDataHealth(data) {
    if (!data || data.length === 0) return null;

    const rows = data.length;
    const cols = Object.keys(data[0] || {});
    const colTypes = DataProcessor.getColumnTypes(data);

    let totalCells = rows * cols.length;
    let nullCount = 0;

    data.forEach(r => cols.forEach(c => {
      if (r[c] === null || r[c] === undefined || r[c] === "") nullCount++;
    }));

    // 1. Completeness Score (40% weight)
    const completenessRatio = (totalCells - nullCount) / totalCells;
    const completenessScore = Math.round(completenessRatio * 40);

    // 2. Uniqueness Score (20% weight)
    const uniqueRows = new Set(data.map(r => JSON.stringify(r))).size;
    const uniquenessScore = Math.round((uniqueRows / rows) * 20);

    // 3. Outlier Score (20% weight)
    const numCols = Object.keys(colTypes).filter(c => colTypes[c] === 'numeric');
    let totalOutliers = 0;
    numCols.forEach(c => {
      const o = DataProcessor.detectOutliers(data, c, 'zscore');
      totalOutliers += o.outlierCount;
    });
    const outlierRatio = totalCells > 0 ? totalOutliers / totalCells : 0;
    const outlierScore = Math.max(0, Math.round(20 - outlierRatio * 200));

    // 4. Type Integrity Score (20% weight)
    const integrityScore = 20;

    const totalHealthScore = completenessScore + uniquenessScore + outlierScore + integrityScore;

    let ratingGrade = "A+ (Excellent)";
    if (totalHealthScore < 70) ratingGrade = "C (Needs Cleaning)";
    else if (totalHealthScore < 85) ratingGrade = "B (Good)";
    else if (totalHealthScore < 95) ratingGrade = "A (Very Good)";

    return {
      totalScore: totalHealthScore,
      ratingGrade,
      breakdown: {
        completenessScore,
        uniquenessScore,
        outlierScore,
        integrityScore
      },
      nullCount,
      nullPct: Math.round((nullCount / totalCells) * 100 * 10) / 10
    };
  }
}
