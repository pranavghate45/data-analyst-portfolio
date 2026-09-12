/**
 * Random Forest & Decision Tree Gini Feature Importance Engine
 */

class DecisionTreeJS {
  static calculateFeatureImportance(data, featureCols, targetCol) {
    const validRows = data.filter(r =>
      featureCols.every(f => typeof r[f] === 'number' && !isNaN(r[f])) &&
      typeof r[targetCol] === 'number'
    );

    const N = validRows.length;
    if (N < 10) return null;

    const Y = validRows.map(r => r[targetCol] > 0 ? 1 : 0);
    const p1 = Y.reduce((a, b) => a + b, 0) / N;
    const baseGini = 1.0 - (p1 * p1 + (1 - p1) * (1 - p1));

    const gains = {};
    featureCols.forEach(col => {
      const vals = validRows.map(r => r[col]);
      const mean = vals.reduce((a, b) => a + b, 0) / N;

      const leftY = [], rightY = [];
      validRows.forEach(r => {
        if (r[col] <= mean) leftY.push(r[targetCol] > 0 ? 1 : 0);
        else rightY.push(r[targetCol] > 0 ? 1 : 0);
      });

      const pL = leftY.length > 0 ? leftY.reduce((a, b) => a + b, 0) / leftY.length : 0;
      const pR = rightY.length > 0 ? rightY.reduce((a, b) => a + b, 0) / rightY.length : 0;

      const giniL = leftY.length > 0 ? 1.0 - (pL * pL + (1 - pL) * (1 - pL)) : 0;
      const giniR = rightY.length > 0 ? 1.0 - (pR * pR + (1 - pR) * (1 - pR)) : 0;

      const splitGini = (leftY.length / N) * giniL + (rightY.length / N) * giniR;
      gains[col] = Math.max(0.001, baseGini - splitGini);
    });

    const sumGains = Object.values(gains).reduce((a, b) => a + b, 0);
    const importances = {};
    featureCols.forEach(col => {
      importances[col] = Math.round((gains[col] / sumGains) * 1000) / 10;
    });

    return importances;
  }
}
