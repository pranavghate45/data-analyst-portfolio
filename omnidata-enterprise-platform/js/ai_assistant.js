/**
 * Interactive In-App AI Analyst Assistant Chatbot
 */

class AIAssistantJS {
  static respondToUserQuery(query, data, datasetName) {
    const q = query.toLowerCase();
    const rows = data.length;
    const cols = Object.keys(data[0] || {});
    const numCols = Object.keys(DataProcessor.getColumnTypes(data)).filter(c => DataProcessor.getColumnTypes(data)[c] === 'numeric');

    if (q.includes('rows') || q.includes('count') || q.includes('records')) {
      return `The active dataset <strong>${datasetName}</strong> currently contains <strong>${rows.toLocaleString()} records</strong> across ${cols.length} variables.`;
    }

    if (q.includes('correlation') || q.includes('relate') || q.includes('driver')) {
      const corr = DataProcessor.getCorrelationMatrix(data);
      let topCorr = null, maxR = 0;
      corr.numCols.forEach((c1, i) => {
        for (let j = i + 1; j < corr.numCols.length; j++) {
          const c2 = corr.numCols[j];
          const r = Math.abs(corr.matrix[c1][c2]);
          if (r > maxR && c1 !== c2) {
            maxR = r;
            topCorr = { c1, c2, rawR: corr.matrix[c1][c2] };
          }
        }
      });
      if (topCorr) {
        return `The strongest linear correlation detected in <strong>${datasetName}</strong> is between <strong>${topCorr.c1}</strong> and <strong>${topCorr.c2}</strong> with a Pearson coefficient of <code>r = ${topCorr.rawR}</code>.`;
      }
      return `No strong correlations were detected in this dataset.`;
    }

    if (q.includes('average') || q.includes('mean') || q.includes('spend') || q.includes('price')) {
      const targetCol = numCols[0];
      const stats = DataProcessor.getStats(data.map(r => r[targetCol]));
      return `For the primary numeric attribute <strong>${targetCol}</strong>, the calculated mean is <strong>${stats.mean}</strong>, with a median of ${stats.median} and std dev of ${stats.stdDev}.`;
    }

    if (q.includes('missing') || q.includes('clean') || q.includes('null')) {
      let missing = 0;
      data.forEach(r => cols.forEach(c => {
        if (r[c] === null || r[c] === undefined || r[c] === "") missing++;
      }));
      return `Found <strong>${missing} missing values</strong> across ${rows} records. You can use the 🧹 Cleaning tab to apply mean/median imputation.`;
    }

    // Default response
    return `Analysis of <strong>${datasetName}</strong> (${rows} rows): Primary variables include <code>${numCols.slice(0, 3).join(', ')}</code>. Try asking about "average", "correlation", "missing values", or "model accuracy".`;
  }
}
