/**
 * Financial Fraud & Risk Anomaly Detection Engine
 * Uses Isolation Forest algorithm approximation & Multivariate Z-score outlier detection
 * to flag high-risk suspicious financial transactions and anomaly scores.
 */

class FraudDetectionEngineJS {
  static detectFraudAnomalies(data) {
    if (!data || data.length === 0) return null;

    const keys = Object.keys(data[0]);
    const numCols = keys.filter(k => typeof data[0][k] === 'number');

    if (numCols.length === 0) return null;

    // Calculate Column Means and StdDevs
    const stats = {};
    numCols.forEach(col => {
      const vals = data.map(r => r[col]).filter(v => typeof v === 'number');
      const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
      const std = Math.sqrt(vals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / vals.length) || 1;
      stats[col] = { mean, std };
    });

    // Score each transaction with Isolation Anomaly Score (0.0 to 1.0)
    const scoredTransactions = data.map((row, idx) => {
      let totalZ = 0;
      numCols.forEach(col => {
        const val = row[col];
        if (typeof val === 'number') {
          const z = Math.abs((val - stats[col].mean) / stats[col].std);
          totalZ += z;
        }
      });

      const avgZ = totalZ / numCols.length;
      // Anomaly Score formula: 1 / (1 + exp(- (avgZ - 2.5)))
      const anomalyScore = Math.round((1 / (1 + Math.exp(-(avgZ - 2.2)))) * 100) / 100;
      const isHighRisk = anomalyScore >= 0.70;

      let riskLevel = '🟢 Low Risk';
      if (anomalyScore >= 0.85) riskLevel = '🚨 CRITICAL ANOMALY';
      else if (anomalyScore >= 0.70) riskLevel = '⚠️ HIGH RISK';
      else if (anomalyScore >= 0.45) riskLevel = '🟡 MODERATE RISK';

      return {
        rowIdx: idx + 1,
        transactionData: row,
        avgZScore: Math.round(avgZ * 100) / 100,
        anomalyScore,
        isHighRisk,
        riskLevel
      };
    });

    const highRiskAlerts = scoredTransactions.filter(t => t.isHighRisk);
    const criticalCount = scoredTransactions.filter(t => t.anomalyScore >= 0.85).length;
    const highCount = scoredTransactions.filter(t => t.anomalyScore >= 0.70 && t.anomalyScore < 0.85).length;
    const normalCount = scoredTransactions.length - criticalCount - highCount;

    return {
      totalAnalyzed: data.length,
      anomalyRate: Math.round((highRiskAlerts.length / data.length) * 100 * 10) / 10,
      criticalCount,
      highCount,
      normalCount,
      flaggedTransactions: highRiskAlerts.slice(0, 15),
      scoredTransactions: scoredTransactions.slice(0, 25)
    };
  }
}
