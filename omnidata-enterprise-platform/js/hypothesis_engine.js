/**
 * Interactive Statistical Hypothesis Testing Engine
 */

class HypothesisEngineJS {
  static runTTest(data, catCol, numCol) {
    const categories = [...new Set(data.map(r => r[catCol]).filter(v => v !== null && v !== undefined))];
    if (categories.length < 2) return null;

    const groupA = data.filter(r => r[catCol] === categories[0]).map(r => r[numCol]).filter(v => typeof v === 'number');
    const groupB = data.filter(r => r[catCol] === categories[1]).map(r => r[numCol]).filter(v => typeof v === 'number');

    const n1 = groupA.length, n2 = groupB.length;
    if (n1 < 2 || n2 < 2) return null;

    const m1 = groupA.reduce((a, b) => a + b, 0) / n1;
    const m2 = groupB.reduce((a, b) => a + b, 0) / n2;

    const var1 = groupA.reduce((acc, x) => acc + Math.pow(x - m1, 2), 0) / (n1 - 1);
    const var2 = groupB.reduce((acc, x) => acc + Math.pow(x - m2, 2), 0) / (n2 - 1);

    const se = Math.sqrt((var1 / n1) + (var2 / n2));
    const tStat = se > 0 ? (m1 - m2) / se : 0;
    const absT = Math.abs(tStat);

    let pValStr = "p > 0.05 (Not Significant)";
    if (absT > 3.29) pValStr = "p < 0.001 (Highly Significant)";
    else if (absT > 1.96) pValStr = "p < 0.05 (Statistically Significant)";

    return {
      catCol,
      numCol,
      groupAName: String(categories[0]),
      groupBName: String(categories[1]),
      meanA: Math.round(m1 * 100) / 100,
      meanB: Math.round(m2 * 100) / 100,
      tStat: Math.round(tStat * 1000) / 1000,
      df: n1 + n2 - 2,
      pValStr,
      isSignificant: absT > 1.96
    };
  }
}
