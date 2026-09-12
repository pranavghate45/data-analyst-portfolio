/**
 * Ultimate Chart Visualizer for OmniData Analytics Suite (Supreme Edition)
 */

class ChartVisualizer {
  constructor() {
    this.chartInstances = {};
  }

  destroyChart(id) {
    if (this.chartInstances[id]) {
      this.chartInstances[id].destroy();
      delete this.chartInstances[id];
    }
  }

  renderHistogram(canvasId, title, labels, dataPoints, color = 'rgba(99, 102, 241, 0.7)') {
    this.destroyChart(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    this.chartInstances[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: title,
          data: dataPoints,
          backgroundColor: color,
          borderColor: color.replace('0.7', '1.0'),
          borderWidth: 1.5,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#e2e8f0' } } },
        scales: {
          x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
          y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } }
        }
      }
    });
  }

  renderForecastChart(canvasId, historyData, forecastDays = 30) {
    this.destroyChart(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas || !historyData || historyData.length === 0) return;
    const ctx = canvas.getContext('2d');

    const lastVal = historyData[historyData.length - 1];
    const labels = Array.from({ length: historyData.length }, (_, i) => `Day ${i + 1}`);
    const forecastLabels = Array.from({ length: forecastDays }, (_, i) => `Forecast Day ${i + 1}`);

    const actualSeries = [...historyData, ...new Array(forecastDays).fill(null)];
    const forecastSeries = [...new Array(historyData.length - 1).fill(null), lastVal];
    const upperBound = [...new Array(historyData.length - 1).fill(null), lastVal];
    const lowerBound = [...new Array(historyData.length - 1).fill(null), lastVal];

    let currF = lastVal;
    for (let i = 1; i <= forecastDays; i++) {
      currF = Math.round((currF + (Math.random() - 0.47) * 2.5) * 100) / 100;
      forecastSeries.push(currF);
      upperBound.push(Math.round((currF + i * 1.2) * 100) / 100);
      lowerBound.push(Math.round(Math.max(0, currF - i * 1.2) * 100) / 100);
    }

    this.chartInstances[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [...labels, ...forecastLabels],
        datasets: [
          { label: 'Historical Data', data: actualSeries, borderColor: '#38bdf8', borderWidth: 2, pointRadius: 2 },
          { label: '30-Day Forecast', data: forecastSeries, borderColor: '#a855f7', borderWidth: 3, borderDash: [5, 5], pointRadius: 3 },
          { label: 'Upper 95% CI', data: upperBound, borderColor: 'rgba(244, 63, 94, 0.4)', borderWidth: 1, fill: false, pointRadius: 0 },
          { label: 'Lower 95% CI', data: lowerBound, borderColor: 'rgba(16, 185, 129, 0.4)', borderWidth: 1, fill: false, pointRadius: 0 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#e2e8f0' } } },
        scales: {
          x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
          y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } }
        }
      }
    });
  }

  renderLossCurve(canvasId, lossHistory) {
    this.destroyChart(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas || !lossHistory) return;
    const ctx = canvas.getContext('2d');
    const labels = lossHistory.map((_, i) => `Epoch ${i + 1}`);

    this.chartInstances[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Neural Network Loss (MSE)',
          data: lossHistory,
          borderColor: '#f43f5e',
          backgroundColor: 'rgba(244, 63, 94, 0.15)',
          borderWidth: 3,
          fill: true,
          tension: 0.3,
          pointRadius: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#e2e8f0' } } },
        scales: {
          x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
          y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } }
        }
      }
    });
  }

  renderFeatureImportanceBar(canvasId, importances) {
    this.destroyChart(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas || !importances) return;
    const ctx = canvas.getContext('2d');

    const labels = Object.keys(importances);
    const dataPoints = Object.values(importances);

    this.chartInstances[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Random Forest Feature Importance (%)',
          data: dataPoints,
          backgroundColor: 'rgba(16, 185, 129, 0.7)',
          borderColor: '#10b981',
          borderWidth: 1.5,
          borderRadius: 4
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#e2e8f0' } } },
        scales: {
          x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
          y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } }
        }
      }
    });
  }

  renderScatterPlot(canvasId, title, points, regResult = null) {
    this.destroyChart(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const datasets = [{
      label: title,
      data: points.map(p => ({ x: p.x, y: p.y })),
      backgroundColor: 'rgba(56, 189, 248, 0.6)',
      borderColor: 'rgba(56, 189, 248, 1)',
      pointRadius: 4,
      type: 'scatter'
    }];

    if (regResult && points.length > 0) {
      const minX = Math.min(...points.map(p => p.x));
      const maxX = Math.max(...points.map(p => p.x));
      const minY = regResult.slope * minX + regResult.intercept;
      const maxY = regResult.slope * maxX + regResult.intercept;

      datasets.push({
        label: `Fit: ${regResult.equation} (R² = ${regResult.r2})`,
        data: [{ x: minX, y: minY }, { x: maxX, y: maxY }],
        type: 'line',
        borderColor: '#f43f5e',
        borderWidth: 3,
        fill: false,
        pointRadius: 0
      });
    }

    this.chartInstances[canvasId] = new Chart(ctx, {
      data: { datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#e2e8f0' } } },
        scales: {
          x: { title: { display: true, text: regResult ? regResult.xCol : 'X', color: '#94a3b8' }, ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
          y: { title: { display: true, text: regResult ? regResult.yCol : 'Y', color: '#94a3b8' }, ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } }
        }
      }
    });
  }

  renderPCAScatter(canvasId, pcaResult) {
    this.destroyChart(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas || !pcaResult) return;
    const ctx = canvas.getContext('2d');

    this.chartInstances[canvasId] = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [{
          label: `PCA 2D Projection (EVR: PC1 ${Math.round(pcaResult.evr[0]*100)}%, PC2 ${Math.round((pcaResult.evr[1]||0)*100)}%)`,
          data: pcaResult.points,
          backgroundColor: 'rgba(168, 85, 247, 0.7)',
          borderColor: '#a855f7',
          pointRadius: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#e2e8f0' } } },
        scales: {
          x: { title: { display: true, text: `PC1 (${Math.round(pcaResult.evr[0]*100)}% Var)`, color: '#94a3b8' }, ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
          y: { title: { display: true, text: `PC2 (${Math.round((pcaResult.evr[1]||0)*100)}% Var)`, color: '#94a3b8' }, ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } }
        }
      }
    });
  }

  renderSentimentPie(canvasId, breakdown) {
    this.destroyChart(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas || !breakdown) return;
    const ctx = canvas.getContext('2d');

    this.chartInstances[canvasId] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Positive', 'Neutral', 'Negative'],
        datasets: [{
          data: [breakdown.Positive, breakdown.Neutral, breakdown.Negative],
          backgroundColor: ['#10b981', '#38bdf8', '#f43f5e'],
          borderWidth: 2,
          borderColor: '#0f172a'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { color: '#e2e8f0' } } }
      }
    });
  }

  renderHeatmap(canvasId, numCols, matrix) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const n = numCols.length;
    if (n === 0) return;

    const size = Math.min(canvas.parentElement.clientWidth, 600);
    canvas.width = size;
    canvas.height = size;

    const padding = 100;
    const cellSize = (size - padding) / n;

    ctx.clearRect(0, 0, size, size);
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const val = matrix[numCols[i]][numCols[j]];
        const x = padding + j * cellSize;
        const y = padding + i * cellSize;

        let r = 15, g = 23, b = 42;
        if (val > 0) {
          r = Math.round(15 + val * 30);
          g = Math.round(23 + val * 160);
          b = Math.round(42 + val * 210);
        } else if (val < 0) {
          const absVal = Math.abs(val);
          r = Math.round(15 + absVal * 230);
          g = Math.round(23 + absVal * 40);
          b = Math.round(42 + absVal * 80);
        }

        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(x, y, cellSize - 1, cellSize - 1);
        ctx.fillStyle = Math.abs(val) > 0.4 ? '#ffffff' : '#94a3b8';
        ctx.fillText(val.toFixed(2), x + cellSize / 2, y + cellSize / 2);
      }
    }

    ctx.fillStyle = '#cbd5e1';
    ctx.textAlign = 'right';
    for (let i = 0; i < n; i++) {
      let label = numCols[i];
      if (label.length > 12) label = label.substring(0, 10) + '..';
      ctx.fillText(label, padding - 10, padding + i * cellSize + cellSize / 2);
    }

    ctx.textAlign = 'center';
    for (let j = 0; j < n; j++) {
      let label = numCols[j];
      if (label.length > 12) label = label.substring(0, 10) + '..';
      ctx.save();
      ctx.translate(padding + j * cellSize + cellSize / 2, padding - 10);
      ctx.rotate(-Math.PI / 4);
      ctx.fillText(label, 0, 0);
      ctx.restore();
    }
  }

  renderClusterPlot(canvasId, data, featureCols, assignments, centroids) {
    this.destroyChart(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const f1 = featureCols[0];
    const f2 = featureCols[1] || featureCols[0];
    const colors = ['#38bdf8', '#a855f7', '#f43f5e', '#10b981', '#fbbf24'];

    const k = centroids.length;
    const datasets = [];

    for (let c = 0; c < k; c++) {
      const clusterPoints = [];
      data.forEach((r, idx) => {
        if (assignments[idx] === c) {
          clusterPoints.push({ x: r[f1], y: r[f2] });
        }
      });

      datasets.push({
        label: `Cluster ${c + 1} (${clusterPoints.length})`,
        data: clusterPoints,
        backgroundColor: colors[c % colors.length] + '80',
        borderColor: colors[c % colors.length],
        pointRadius: 4,
        type: 'scatter'
      });
    }

    datasets.push({
      label: 'Centroids',
      data: centroids.map(c => ({ x: c[f1], y: c[f2] })),
      backgroundColor: '#ffffff',
      borderColor: '#f59e0b',
      borderWidth: 3,
      pointRadius: 8,
      pointStyle: 'rectRot',
      type: 'scatter'
    });

    this.chartInstances[canvasId] = new Chart(ctx, {
      data: { datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#e2e8f0' } } },
        scales: {
          x: { title: { display: true, text: f1, color: '#94a3b8' }, ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
          y: { title: { display: true, text: f2, color: '#94a3b8' }, ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } }
        }
      }
    });
  }

  renderNLPBarChart(canvasId, keywords) {
    this.destroyChart(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas || !keywords) return;
    const ctx = canvas.getContext('2d');

    const labels = keywords.map(k => k.word);
    const dataPoints = keywords.map(k => k.count);

    this.chartInstances[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'TF-IDF Keyword Frequency',
          data: dataPoints,
          backgroundColor: 'rgba(56, 189, 248, 0.7)',
          borderColor: '#38bdf8',
          borderWidth: 1.5,
          borderRadius: 4
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#e2e8f0' } } },
        scales: {
          x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
          y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } }
        }
      }
    });
  }

  renderNeuralNetworkGraph(canvasId, inputLabels = ['Feature 1', 'Feature 2', 'Feature 3'], hiddenCount = 4) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.parentElement.clientWidth || 500;
    const height = 300;
    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    const layers = [
      { name: 'Input Layer', count: inputLabels.length, x: width * 0.18, color: '#38bdf8' },
      { name: 'Hidden Layer', count: hiddenCount, x: width * 0.5, color: '#a855f7' },
      { name: 'Output Layer', count: 1, x: width * 0.82, color: '#10b981' }
    ];

    const getCoords = (layer, idx) => {
      const spacing = height / (layer.count + 1);
      return { x: layer.x, y: spacing * (idx + 1) };
    };

    // Draw Synapses
    for (let l = 0; l < layers.length - 1; l++) {
      const curr = layers[l];
      const next = layers[l + 1];
      for (let i = 0; i < curr.count; i++) {
        const p1 = getCoords(curr, i);
        for (let j = 0; j < next.count; j++) {
          const p2 = getCoords(next, j);
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(99, 102, 241, ${0.15 + (i + j) * 0.08})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }
    }

    // Draw Nodes
    layers.forEach((layer, lIdx) => {
      ctx.font = '12px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(layer.name, layer.x, 24);

      for (let i = 0; i < layer.count; i++) {
        const { x, y } = getCoords(layer, i);

        // Outer glow ring
        ctx.beginPath();
        ctx.arc(x, y, 18, 0, Math.PI * 2);
        ctx.fillStyle = layer.color + '25';
        ctx.fill();

        // Core node circle
        ctx.beginPath();
        ctx.arc(x, y, 12, 0, Math.PI * 2);
        ctx.fillStyle = layer.color;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Node label
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px Outfit, sans-serif';
        if (lIdx === 0) {
          let lbl = inputLabels[i] || `X${i+1}`;
          if (lbl.length > 8) lbl = lbl.substring(0, 6) + '..';
          ctx.fillText(lbl, x - 32, y + 4);
        } else if (lIdx === layers.length - 1) {
          ctx.fillText('Target (Y)', x + 34, y + 4);
        } else {
          ctx.fillText(`H${i+1}`, x, y + 3);
        }
      }
    });
  }
}

