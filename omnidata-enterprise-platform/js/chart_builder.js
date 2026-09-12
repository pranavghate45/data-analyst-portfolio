/**
 * Custom Chart Builder Module for OmniData Analytics Suite
 */

class ChartBuilderJS {
  static renderCustomChart(chartViz, canvasId, data, xCol, yCol, chartType = 'bar') {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !data || data.length === 0 || !xCol || !yCol) return;

    chartViz.destroyChart(canvasId);
    const ctx = canvas.getContext('2d');

    // Aggregate Y values by X category
    const grouped = {};
    data.forEach(r => {
      const xVal = r[xCol] !== null && r[xCol] !== undefined ? String(r[xCol]) : 'Unknown';
      const yVal = r[yCol];
      if (typeof yVal === 'number' && !isNaN(yVal)) {
        if (!grouped[xVal]) grouped[xVal] = [];
        grouped[xVal].push(yVal);
      }
    });

    const labels = Object.keys(grouped).slice(0, 15);
    const dataPoints = labels.map(k => {
      const arr = grouped[k];
      return arr.length > 0 ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 100) / 100 : 0;
    });

    const colors = ['#6366f1', '#38bdf8', '#a855f7', '#10b981', '#f43f5e', '#fbbf24'];

    const config = {
      type: chartType === 'radar' ? 'radar' : (chartType === 'doughnut' ? 'doughnut' : (chartType === 'line' ? 'line' : 'bar')),
      data: {
        labels,
        datasets: [{
          label: `Average ${yCol} by ${xCol}`,
          data: dataPoints,
          backgroundColor: chartType === 'doughnut' ? colors : 'rgba(99, 102, 241, 0.65)',
          borderColor: '#6366f1',
          borderWidth: 2,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#e2e8f0' } } },
        scales: chartType !== 'doughnut' && chartType !== 'radar' ? {
          x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
          y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } }
        } : {}
      }
    };

    chartViz.chartInstances[canvasId] = new Chart(ctx, config);
  }
}
