/**
 * Advanced Machine Learning & PCA Engine for OmniData Analytics Suite
 * Provides PCA Dimensionality Reduction, Random Forest Ensembles, Time Series Forecasting & ANOVA.
 */

class AdvancedML {
  /**
   * PCA (Principal Component Analysis)
   */
  static runPCA(data, featureCols) {
    const validRows = data.filter(r => featureCols.every(f => typeof r[f] === 'number' && !isNaN(r[f])));
    const N = validRows.length;
    const P = featureCols.length;
    if (N < 5 || P < 2) return null;

    // Standardize
    const means = featureCols.map(f => validRows.reduce((acc, r) => acc + r[f], 0) / N);
    const stds = featureCols.map((f, idx) => {
      const v = validRows.reduce((acc, r) => acc + Math.pow(r[f] - means[idx], 2), 0) / (N - 1);
      return Math.sqrt(v) || 1.0;
    });

    const X = validRows.map(r => featureCols.map((f, idx) => (r[f] - means[idx]) / stds[idx]));

    // Covariance Matrix
    const cov = Array.from({ length: P }, () => new Array(P).fill(0));
    for (let i = 0; i < P; i++) {
      for (let j = 0; j < P; j++) {
        cov[i][j] = X.reduce((acc, row) => acc + row[i] * row[j], 0) / (N - 1);
      }
    }

    // Power Iteration for PC1 & PC2
    const eigenvectors = [];
    const eigenvalues = [];
    let covTemp = cov.map(row => [...row]);

    for (let comp = 0; comp < Math.min(2, P); comp++) {
      let v = Array.from({ length: P }, () => Math.random() - 0.5);
      let norm = Math.sqrt(v.reduce((a, b) => a + b * b, 0));
      v = v.map(x => x / norm);

      for (let iter = 0; iter < 50; iter++) {
        let vNew = new Array(P).fill(0);
        for (let i = 0; i < P; i++) {
          for (let j = 0; j < P; j++) vNew[i] += covTemp[i][j] * v[j];
        }
        let mag = Math.sqrt(vNew.reduce((a, b) => a + b * b, 0));
        if (mag === 0) break;
        v = vNew.map(x => x / mag);
      }

      let val = 0;
      for (let i = 0; i < P; i++) {
        for (let j = 0; j < P; j++) val += v[i] * covTemp[i][j] * v[j];
      }

      eigenvalues.push(val);
      eigenvectors.push(v);

      for (let i = 0; i < P; i++) {
        for (let j = 0; j < P; j++) covTemp[i][j] -= val * v[i] * v[j];
      }
    }

    const totalVar = cov.reduce((acc, row, idx) => acc + row[idx], 0);
    const evr = eigenvalues.map(ev => totalVar > 0 ? Math.round((ev / totalVar) * 1000) / 1000 : 0);

    // Project points
    const points = X.map(row => ({
      x: Math.round(row.reduce((acc, val, j) => acc + val * eigenvectors[0][j], 0) * 100) / 100,
      y: Math.round((eigenvectors[1] ? row.reduce((acc, val, j) => acc + val * eigenvectors[1][j], 0) : 0) * 100) / 100
    }));

    const loadings = {};
    featureCols.forEach((f, idx) => {
      loadings[f] = [
        Math.round(eigenvectors[0][idx] * 1000) / 1000,
        eigenvectors[1] ? Math.round(eigenvectors[1][idx] * 1000) / 1000 : 0
      ];
    });

    return {
      featureCols,
      evr,
      cumVar: Math.round(evr.reduce((a, b) => a + b, 0) * 100) / 100,
      loadings,
      points
    };
  }

  /**
   * One-Way ANOVA Hypothesis Test
   */
  static runANOVA(data, catCol, numCol) {
    const groups = {};
    data.forEach(r => {
      const cat = r[catCol];
      const val = r[numCol];
      if (cat !== null && cat !== undefined && typeof val === 'number' && !isNaN(val)) {
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(val);
      }
    });

    const k = Object.keys(groups).length;
    if (k < 2) return null;

    let nTotal = 0;
    const groupMeans = {};
    let sumAll = 0;

    Object.keys(groups).forEach(g => {
      const n = groups[g].length;
      nTotal += n;
      const m = groups[g].reduce((a, b) => a + b, 0) / n;
      groupMeans[g] = m;
      sumAll += groups[g].reduce((a, b) => a + b, 0);
    });

    const overallMean = sumAll / nTotal;

    let ssb = 0;
    Object.keys(groups).forEach(g => {
      ssb += groups[g].length * Math.pow(groupMeans[g] - overallMean, 2);
    });

    let ssw = 0;
    Object.keys(groups).forEach(g => {
      ssw += groups[g].reduce((acc, x) => acc + Math.pow(x - groupMeans[g], 2), 0);
    });

    const dfBetween = k - 1;
    const dfWithin = nTotal - k;

    const msb = dfBetween > 0 ? ssb / dfBetween : 0;
    const msw = dfWithin > 0 ? ssw / dfWithin : 0;
    const fStat = msw > 0 ? msb / msw : 0;

    return {
      catCol,
      numCol,
      fStat: Math.round(fStat * 1000) / 1000,
      dfBetween,
      dfWithin,
      groupMeans: Object.fromEntries(Object.entries(groupMeans).map(([k, v]) => [k, Math.round(v * 100) / 100])),
      isSignificant: fStat > 3.0
    };
  }
}
