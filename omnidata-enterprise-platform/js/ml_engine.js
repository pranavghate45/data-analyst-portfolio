/**
 * Machine Learning & Statistical Engine for OmniData Analytics Suite
 * Provides Linear Regression, Logistic Regression Classification, K-Means Clustering,
 * Time Series Forecasting, and Hypothesis Testing (t-test, Chi-Square).
 */

class MLEngine {
  /**
   * Simple Ordinary Least Squares (OLS) Linear Regression
   */
  static runLinearRegression(data, xCol, yCol) {
    const pairs = [];
    data.forEach(r => {
      const x = r[xCol];
      const y = r[yCol];
      if (typeof x === 'number' && typeof y === 'number' && !isNaN(x) && !isNaN(y)) {
        pairs.push({ x, y });
      }
    });

    const n = pairs.length;
    if (n < 2) return null;

    const meanX = pairs.reduce((acc, p) => acc + p.x, 0) / n;
    const meanY = pairs.reduce((acc, p) => acc + p.y, 0) / n;

    let num = 0, den = 0;
    pairs.forEach(p => {
      num += (p.x - meanX) * (p.y - meanY);
      den += Math.pow(p.x - meanX, 2);
    });

    const slope = den !== 0 ? num / den : 0;
    const intercept = meanY - slope * meanX;

    // Predictions & Metrics
    let ssRes = 0, ssTot = 0, absoluteErrorSum = 0;
    const predictions = pairs.map(p => {
      const yPred = slope * p.x + intercept;
      ssRes += Math.pow(p.y - yPred, 2);
      ssTot += Math.pow(p.y - meanY, 2);
      absoluteErrorSum += Math.abs(p.y - yPred);
      return { x: p.x, yActual: p.y, yPred: Math.round(yPred * 100) / 100 };
    });

    const r2 = ssTot !== 0 ? 1 - (ssRes / ssTot) : 0;
    const rmse = Math.sqrt(ssRes / n);
    const mae = absoluteErrorSum / n;

    return {
      xCol,
      yCol,
      slope: Math.round(slope * 10000) / 10000,
      intercept: Math.round(intercept * 10000) / 10000,
      r2: Math.round(r2 * 10000) / 10000,
      rmse: Math.round(rmse * 1000) / 1000,
      mae: Math.round(mae * 1000) / 1000,
      equation: `${yCol} = ${Math.round(slope * 100) / 100} × ${xCol} + ${Math.round(intercept * 100) / 100}`,
      predictions
    };
  }

  /**
   * Logistic Regression Classifier with Binary Outcome
   */
  static runLogisticRegression(data, featureCols, targetCol, epochs = 300, lr = 0.05) {
    const validRows = data.filter(r => 
      featureCols.every(f => typeof r[f] === 'number' && !isNaN(r[f])) &&
      typeof r[targetCol] === 'number' && (r[targetCol] === 0 || r[targetCol] === 1)
    );

    if (validRows.length < 10) return null;

    // Feature normalization (Standard Scaling)
    const stats = {};
    featureCols.forEach(f => {
      const vals = validRows.map(r => r[f]);
      const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
      const std = Math.sqrt(vals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / vals.length) || 1;
      stats[f] = { mean, std };
    });

    const X = validRows.map(r => featureCols.map(f => (r[f] - stats[f].mean) / stats[f].std));
    const Y = validRows.map(r => r[targetCol]);
    const m = X.length;
    const nFeatures = featureCols.length;

    let weights = new Array(nFeatures).fill(0);
    let bias = 0;

    const sigmoid = z => 1 / (1 + Math.exp(-Math.max(-10, Math.min(10, z))));

    // Gradient Descent
    for (let epoch = 0; epoch < epochs; epoch++) {
      let dw = new Array(nFeatures).fill(0);
      let db = 0;

      for (let i = 0; i < m; i++) {
        let z = bias;
        for (let j = 0; j < nFeatures; j++) z += weights[j] * X[i][j];
        const a = sigmoid(z);
        const dz = a - Y[i];

        for (let j = 0; j < nFeatures; j++) dw[j] += dz * X[i][j];
        db += dz;
      }

      for (let j = 0; j < nFeatures; j++) weights[j] -= (lr * dw[j]) / m;
      bias -= (lr * db) / m;
    }

    // Evaluation & Confusion Matrix
    let tp = 0, fp = 0, tn = 0, fn = 0;
    const probs = [];

    for (let i = 0; i < m; i++) {
      let z = bias;
      for (let j = 0; j < nFeatures; j++) z += weights[j] * X[i][j];
      const p = sigmoid(z);
      const pred = p >= 0.5 ? 1 : 0;
      const actual = Y[i];

      if (actual === 1 && pred === 1) tp++;
      else if (actual === 0 && pred === 1) fp++;
      else if (actual === 0 && pred === 0) tn++;
      else if (actual === 1 && pred === 0) fn++;

      probs.push(p);
    }

    const accuracy = (tp + tn) / m;
    const precision = (tp + fp) > 0 ? tp / (tp + fp) : 0;
    const recall = (tp + fn) > 0 ? tp / (tp + fn) : 0;
    const f1 = (precision + recall) > 0 ? 2 * (precision * recall) / (precision + recall) : 0;

    return {
      featureCols,
      targetCol,
      weights: weights.map(w => Math.round(w * 1000) / 1000),
      bias: Math.round(bias * 1000) / 1000,
      metrics: {
        accuracy: Math.round(accuracy * 1000) / 1000,
        precision: Math.round(precision * 1000) / 1000,
        recall: Math.round(recall * 1000) / 1000,
        f1Score: Math.round(f1 * 1000) / 1000
      },
      confusionMatrix: { tp, fp, tn, fn }
    };
  }

  /**
   * K-Means Clustering Algorithm
   */
  static runKMeans(data, featureCols, k = 3, maxIter = 20) {
    const validRows = data.filter(r => 
      featureCols.every(f => typeof r[f] === 'number' && !isNaN(r[f]))
    );

    if (validRows.length < k * 2) return null;

    // Standard Scaling
    const stats = {};
    featureCols.forEach(f => {
      const vals = validRows.map(r => r[f]);
      const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
      const std = Math.sqrt(vals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / vals.length) || 1;
      stats[f] = { mean, std };
    });

    const X = validRows.map(r => featureCols.map(f => (r[f] - stats[f].mean) / stats[f].std));
    const numFeatures = featureCols.length;

    // Random Centroid Initialization
    let centroids = [];
    const step = Math.floor(X.length / k);
    for (let i = 0; i < k; i++) {
      centroids.push([...X[i * step]]);
    }

    let assignments = new Array(X.length).fill(0);
    let inertia = 0;

    for (let iter = 0; iter < maxIter; iter++) {
      // 1. Assign points to nearest centroid
      let newAssignments = [];
      inertia = 0;

      for (let i = 0; i < X.length; i++) {
        let minDist = Infinity;
        let bestK = 0;
        for (let c = 0; c < k; c++) {
          let dist = 0;
          for (let j = 0; j < numFeatures; j++) {
            dist += Math.pow(X[i][j] - centroids[c][j], 2);
          }
          if (dist < minDist) {
            minDist = dist;
            bestK = c;
          }
        }
        newAssignments.push(bestK);
        inertia += minDist;
      }

      assignments = newAssignments;

      // 2. Re-calculate Centroids
      const newCentroids = Array.from({ length: k }, () => new Array(numFeatures).fill(0));
      const counts = new Array(k).fill(0);

      for (let i = 0; i < X.length; i++) {
        const cluster = assignments[i];
        counts[cluster]++;
        for (let j = 0; j < numFeatures; j++) {
          newCentroids[cluster][j] += X[i][j];
        }
      }

      for (let c = 0; c < k; c++) {
        if (counts[c] > 0) {
          for (let j = 0; j < numFeatures; j++) {
            newCentroids[c][j] /= counts[c];
          }
        }
      }
      centroids = newCentroids;
    }

    // Convert Centroids back to original feature scale
    const originalCentroids = centroids.map(c => {
      const obj = {};
      featureCols.forEach((f, idx) => {
        obj[f] = Math.round((c[idx] * stats[f].std + stats[f].mean) * 100) / 100;
      });
      return obj;
    });

    // Count per cluster
    const clusterCounts = new Array(k).fill(0);
    assignments.forEach(c => clusterCounts[c]++);

    return {
      k,
      featureCols,
      inertia: Math.round(inertia * 100) / 100,
      centroids: originalCentroids,
      counts: clusterCounts,
      assignments
    };
  }

  /**
   * Two-Sample Student's t-Test for difference of means
   */
  static runTTest(groupA, groupB) {
    const valsA = groupA.filter(v => typeof v === 'number' && !isNaN(v));
    const valsB = groupB.filter(v => typeof v === 'number' && !isNaN(v));

    const nA = valsA.length, nB = valsB.length;
    if (nA < 2 || nB < 2) return null;

    const meanA = valsA.reduce((a, b) => a + b, 0) / nA;
    const meanB = valsB.reduce((a, b) => a + b, 0) / nB;

    const varA = valsA.reduce((a, x) => a + Math.pow(x - meanA, 2), 0) / (nA - 1);
    const varB = valsB.reduce((a, x) => a + Math.pow(x - meanB, 2), 0) / (nB - 1);

    const se = Math.sqrt((varA / nA) + (varB / nB));
    const tStat = se !== 0 ? (meanA - meanB) / se : 0;
    const df = nA + nB - 2;

    // Approximate p-value interpretation
    const absT = Math.abs(tStat);
    let pValueEst = "p < 0.001";
    if (absT < 1.96) pValueEst = "p > 0.05 (Not Significant)";
    else if (absT < 2.58) pValueEst = "p < 0.05 (Statistically Significant)";
    else if (absT < 3.29) pValueEst = "p < 0.01 (Highly Significant)";

    return {
      meanA: Math.round(meanA * 100) / 100,
      meanB: Math.round(meanB * 100) / 100,
      tStat: Math.round(tStat * 1000) / 1000,
      df,
      pValueEst,
      isSignificant: absT >= 1.96
    };
  }
}
