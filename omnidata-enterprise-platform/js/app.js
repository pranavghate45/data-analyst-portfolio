/**
 * Main Application Controller for OmniData AI & SQL Platform (Supreme Zenith Edition)
 */

document.addEventListener('DOMContentLoaded', () => {
  let currentDatasetKey = 'ecommerce';
  let rawData = [];
  let cleanedData = [];
  let columnTypes = {};

  const chartViz = new ChartVisualizer();
  const storyteller = new StorytellerJS('storyteller-deck-container');

  // Elements
  const datasetSelector = document.getElementById('dataset-selector');
  const datasetTitle = document.getElementById('dataset-title');
  const datasetDesc = document.getElementById('dataset-desc');
  const csvFileInput = document.getElementById('csv-file-input');

  // Streaming Instance
  let streamSim = null;

  // Tab Switcher
  const navTabs = document.querySelectorAll('.nav-tab');
  const tabContents = document.querySelectorAll('.tab-content');

  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      navTabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      tab.classList.add('active');
      const target = tab.getAttribute('data-tab');
      const targetEl = document.getElementById(`tab-${target}`);
      if (targetEl) targetEl.classList.add('active');

      // Refresh tab views
      if (target === 'genai') renderGenAITab();
      if (target === 'xai') renderXAITab();
      if (target === 'reverse-etl') renderReverseETLTab();
      if (target === 'finops') renderFinOpsTab();
      if (target === 'gdpr') renderGDPRTab();
      if (target === 'drift') renderDriftTab();
      if (target === 'security') renderSecurityTab();
      if (target === 'sql') renderSQLTab();
      if (target === 'rfm') renderRFMTab();
      if (target === 'fraud') renderFraudTab();
      if (target === 'schema') renderSchemaTab();
      if (target === 'pipeline') renderPipelineTab();
      if (target === 'quality') renderQualityTab();
      if (target === 'lineage') renderLineageTab();
      if (target === 'mlflow') renderMLflowTab();
      if (target === 'semantic') renderSemanticTab();
      if (target === 'cicd') renderCICDTab();
      if (target === 'roi') renderROITab();
      if (target === 'health') renderHealthTab();
      if (target === 'cleaning') renderCleaningTab();
      if (target === 'pivot') renderPivotTab();
      if (target === 'nlp') renderNLPTab();
      if (target === 'eda') renderEDATab();
      if (target === 'ml') renderMLTab();
      if (target === 'automl') renderAutoMLTab();
      if (target === 'ai-deep') renderAIDeepTab();
      if (target === 'hypothesis') renderHypothesisTab();
      if (target === 'storyteller') renderStorytellerTab();
      if (target === 'stream') renderStreamTab();
      if (target === 'forecast') renderForecastTab();
      if (target === 'chart-builder') renderChartBuilderTab();
      if (target === 'chatbot') renderChatbotTab();
      if (target === 'insights') renderInsightsTab();
    });
  });

  const roleSelector = document.getElementById('role-selector');
  if (roleSelector) {
    roleSelector.addEventListener('change', (e) => {
      SecurityRBACEngineJS.setRole(e.target.value);
      refreshAllViews();
    });
  }

  function loadDataset(key) {
    currentDatasetKey = key;
    const config = SAMPLE_DATASETS[key];
    if (config) {
      datasetTitle.textContent = config.name;
      datasetDesc.textContent = config.description;
      rawData = config.generate();
      cleanedData = [...rawData];
      columnTypes = DataProcessor.getColumnTypes(rawData);
      refreshAllViews();
    }
  }

  csvFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const parsed = DataProcessor.parseCSV(evt.target.result);
      if (parsed.length > 0) {
        datasetTitle.textContent = `Custom Upload: ${file.name}`;
        datasetDesc.textContent = `User uploaded dataset with ${parsed.length} records.`;
        rawData = parsed;
        cleanedData = [...rawData];
        columnTypes = DataProcessor.getColumnTypes(rawData);
        refreshAllViews();
      } else {
        alert("Could not parse CSV.");
      }
    };
    reader.readAsText(file);
  });

  datasetSelector.addEventListener('change', (e) => {
    if (e.target.value !== 'custom') loadDataset(e.target.value);
  });

  function refreshAllViews() {
    renderOverviewTab();
    renderGenAITab();
    renderXAITab();
    renderReverseETLTab();
    renderFinOpsTab();
    renderGDPRTab();
    renderDriftTab();
    renderSecurityTab();
    renderSQLTab();
    renderRFMTab();
    renderFraudTab();
    renderSchemaTab();
    renderPipelineTab();
    renderQualityTab();
    renderLineageTab();
    renderMLflowTab();
    renderSemanticTab();
    renderCICDTab();
    renderROITab();
    renderHealthTab();
    renderCleaningTab();
    renderPivotTab();
    renderNLPTab();
    renderEDATab();
    renderMLTab();
    renderAutoMLTab();
    renderAIDeepTab();
    renderHypothesisTab();
    renderStorytellerTab();
    renderForecastTab();
    renderChartBuilderTab();
    renderChatbotTab();
    renderInsightsTab();
  }

  // 0a. GenAI TEXT-TO-SQL & NLQ
  function renderGenAITab() {
    const input = document.getElementById('genai-input');
    const sqlBox = document.getElementById('genai-sql-box');
    const tableContainer = document.getElementById('genai-results-table');
    const narrativeBox = document.getElementById('genai-narrative-box');
    if (!input || !sqlBox) return;

    const schemaCols = Object.keys(cleanedData[0] || {});

    document.getElementById('btn-run-genai').onclick = () => {
      const q = input.value.trim();
      const translation = TextToSQLEngineJS.translateToSQL(q || 'Show top 5 customers by spend', schemaCols);
      if (!translation) return;

      sqlBox.innerHTML = `
        <h4>Translated SQL Query (${translation.intentExplanation}):</h4>
        <code>${translation.generatedSQL}</code>
      `;

      const res = SQLEngineJS.executeQuery(translation.generatedSQL, cleanedData);
      if (res.error) {
        tableContainer.innerHTML = `<div class="insight-box priority-high"><p>❌ SQL Error: ${res.error}</p></div>`;
      } else {
        tableContainer.innerHTML = `
          <table class="data-table">
            <thead><tr>${res.headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
            <tbody>
              ${res.rows.map(r => `<tr>${res.headers.map(h => `<td>${r[h] !== null ? r[h] : '<span class="null-val">null</span>'}</td>`).join('')}</tr>`).join('')}
            </tbody>
          </table>
        `;
      }
    };

    // Automated Narrative Insights
    const bullets = TextToSQLEngineJS.generateNarrativeInsights(cleanedData, SAMPLE_DATASETS[currentDatasetKey].name);
    narrativeBox.innerHTML = `<ul>${bullets.map(b => `<li style="margin-bottom: 6px;">${b}</li>`).join('')}</ul>`;

    document.getElementById('btn-run-genai').click();
  }

  // 0b. DATA & CONCEPT DRIFT MONITOR
  function renderDriftTab() {
    const driftRes = DriftMonitorEngineJS.evaluateDrift(rawData, cleanedData);
    const badge = document.getElementById('drift-alert-badge');
    const summaryBox = document.getElementById('drift-summary-box');
    const tableContainer = document.getElementById('drift-table-container');

    if (!driftRes || !summaryBox) return;

    if (driftRes.isRetrainRequired) {
      badge.className = 'badge';
      badge.style.background = 'rgba(244, 63, 94, 0.2)';
      badge.style.borderColor = 'var(--accent-rose)';
      badge.innerHTML = `⚠️ Feature Drift Detected: Retrain Required! (${driftRes.driftedCount} Features Shifted)`;
      summaryBox.className = 'insight-box priority-high';
      summaryBox.innerHTML = `<h4>🚨 Production Alert: Concept Drift Detected</h4><p>PSI Threshold exceeded (> 0.25) on ${driftRes.driftedCount} numerical attributes. Automated retrain trigger scheduled.</p>`;
    } else {
      badge.className = 'badge';
      badge.style.background = 'rgba(16, 185, 129, 0.2)';
      badge.style.borderColor = 'var(--accent-emerald)';
      badge.innerHTML = `🟢 System Baseline Stable (All PSI < 0.10)`;
      summaryBox.className = 'insight-box';
      summaryBox.innerHTML = `<h4>✅ Distribution Stable</h4><p>All feature distributions match initial baseline training data within normal 95% confidence bounds.</p>`;
    }

    tableContainer.innerHTML = `
      <table class="data-table">
        <thead>
          <tr><th>Feature Name</th><th>Baseline Mean</th><th>Live Production Mean</th><th>PSI Score</th><th>KS-Stat</th><th>p-Value</th><th>Status</th></tr>
        </thead>
        <tbody>
          ${driftRes.driftResults.map(r => `
            <tr ${r.psiScore >= 0.25 ? 'style="background: rgba(244,63,94,0.12);"' : ''}>
              <td><strong>${r.feature}</strong></td>
              <td>${r.baselineMean}</td>
              <td>${r.liveMean}</td>
              <td><code>${r.psiScore}</code></td>
              <td>${r.ksStat}</td>
              <td>${r.pValue}</td>
              <td><span class="badge">${r.status}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  // 0c. SECURITY, PII MASKING & RBAC
  function renderSecurityTab() {
    const currentRole = SecurityRBACEngineJS.getRole();
    const roleBadge = document.getElementById('active-rbac-role-badge');
    const roleBanner = document.getElementById('rbac-role-banner');
    const tableContainer = document.getElementById('security-table-container');

    if (!roleBadge || !tableContainer) return;

    roleBadge.textContent = `Active Role: ${currentRole}`;

    roleBanner.innerHTML = `
      <h4>🔐 RBAC Security Enforced: Role = ${currentRole}</h4>
      <p>PII Masking applied to Emails, Phone Numbers, and Cards. Restricted salary/revenue columns redacted based on Role hierarchy.</p>
    `;

    const maskedData = SecurityRBACEngineJS.applyPIIMasking(cleanedData);
    const cols = Object.keys(maskedData[0] || {});

    tableContainer.innerHTML = `
      <table class="data-table">
        <thead><tr>${cols.map(c => `<th>${c}</th>`).join('')}</tr></thead>
        <tbody>
          ${maskedData.slice(0, 10).map(r => `
            <tr>${cols.map(c => `<td>${r[c]}</td>`).join('')}</tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  // 1. OVERVIEW
  function renderOverviewTab() {
    const numRows = cleanedData.length;
    const cols = Object.keys(cleanedData[0] || {});
    document.getElementById('kpi-rows').textContent = numRows.toLocaleString();
    document.getElementById('kpi-cols').textContent = cols.length;

    let missingCount = 0;
    cleanedData.forEach(r => cols.forEach(c => {
      if (r[c] === null || r[c] === undefined || r[c] === "") missingCount++;
    }));
    document.getElementById('kpi-missing').textContent = missingCount;
    document.getElementById('kpi-numeric').textContent = Object.values(columnTypes).filter(t => t === 'numeric').length;

    const tableHeader = document.getElementById('table-header');
    const tableBody = document.getElementById('table-body');

    tableHeader.innerHTML = `<tr>${cols.map(c => `<th>${c} <span class="type-badge ${columnTypes[c]}">${columnTypes[c]}</span></th>`).join('')}</tr>`;
    tableBody.innerHTML = cleanedData.slice(0, 10).map(row => `
      <tr>${cols.map(c => `<td>${row[c] !== null ? row[c] : '<span class="null-val">null</span>'}</td>`).join('')}</tr>
    `).join('');
  }

  // 1b. CUSTOMER 360 & RFM COHORTS
  function renderRFMTab() {
    const rfmRes = RFMEngineJS.analyzeRFM(cleanedData);
    const kpiGrid = document.getElementById('rfm-kpi-grid');
    const segList = document.getElementById('rfm-segment-list');
    const custTable = document.getElementById('rfm-customer-table');
    const cohortContainer = document.getElementById('cohort-heatmap-container');

    if (!rfmRes || !kpiGrid) return;

    kpiGrid.innerHTML = `
      <div class="kpi-card"><div class="kpi-icon icon-purple">👥</div><div><div class="kpi-label">Analyzed Customers</div><div class="kpi-val">${rfmRes.totalCustomers.toLocaleString()}</div></div></div>
      <div class="kpi-card"><div class="kpi-icon icon-green">💵</div><div><div class="kpi-label">Total Monetary Value</div><div class="kpi-val">$${rfmRes.totalRevenue.toLocaleString()}</div></div></div>
      <div class="kpi-card"><div class="kpi-icon icon-blue">💎</div><div><div class="kpi-label">Average Customer LTV</div><div class="kpi-val">$${rfmRes.avgLTV.toLocaleString()}</div></div></div>
      <div class="kpi-card"><div class="kpi-icon icon-rose">🏆</div><div><div class="kpi-label">Champions Count</div><div class="kpi-val">${rfmRes.segmentCounts['🏆 Champions'] || 0}</div></div></div>
    `;

    segList.innerHTML = Object.keys(rfmRes.segmentCounts).map(seg => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: rgba(255,255,255,0.03); border-radius: 6px; margin-bottom: 8px;">
        <span><strong>${seg}</strong></span>
        <span class="badge" style="font-weight: 700;">${rfmRes.segmentCounts[seg]} Customers</span>
      </div>
    `).join('');

    custTable.innerHTML = `
      <table class="data-table">
        <thead>
          <tr><th>Customer ID</th><th>RFM Score</th><th>Segment</th><th>Freq</th><th>Monetary ($)</th><th>Est. LTV ($)</th></tr>
        </thead>
        <tbody>
          ${rfmRes.customers.map(c => `
            <tr>
              <td><strong>${c.id}</strong></td>
              <td><code>${c.rfmScore}</code></td>
              <td>${c.segment}</td>
              <td>${c.frequency}</td>
              <td>$${c.monetary.toFixed(2)}</td>
              <td><span class="highlight">$${c.ltv.toFixed(2)}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    // Cohort Heatmap Rendering
    const matrix = RFMEngineJS.generateCohortRetentionMatrix();
    cohortContainer.innerHTML = `
      <table class="data-table">
        <thead>
          <tr><th>Signup Cohort</th><th>Users</th><th>Month 0</th><th>Month 1</th><th>Month 2</th><th>Month 3</th><th>Month 4</th><th>Month 5</th></tr>
        </thead>
        <tbody>
          ${matrix.map(row => `
            <tr>
              <td><strong>${row.cohort}</strong></td>
              <td>${row.size}</td>
              ${row.retentions.map(pct => {
                if (pct === null) return `<td class="cohort-cell cohort-empty">-</td>`;
                let cls = 'cohort-low';
                if (pct === 100) cls = 'cohort-100';
                else if (pct >= 50) cls = 'cohort-high';
                else if (pct >= 30) cls = 'cohort-med';
                return `<td class="cohort-cell ${cls}">${pct}%</td>`;
              }).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  // 1c. FINANCIAL FRAUD & RISK
  function renderFraudTab() {
    const fraudRes = FraudDetectionEngineJS.detectFraudAnomalies(cleanedData);
    const kpiGrid = document.getElementById('fraud-kpi-grid');
    const tableContainer = document.getElementById('fraud-table-container');

    if (!fraudRes || !kpiGrid) return;

    kpiGrid.innerHTML = `
      <div class="kpi-card"><div class="kpi-icon icon-blue">📋</div><div><div class="kpi-label">Analyzed Transactions</div><div class="kpi-val">${fraudRes.totalAnalyzed}</div></div></div>
      <div class="kpi-card"><div class="kpi-icon icon-rose">⚠️</div><div><div class="kpi-label">Anomaly Risk Rate</div><div class="kpi-val" style="color: var(--accent-rose);">${fraudRes.anomalyRate}%</div></div></div>
      <div class="kpi-card"><div class="kpi-icon icon-purple">🚨</div><div><div class="kpi-label">Critical Anomaly Count</div><div class="kpi-val">${fraudRes.criticalCount}</div></div></div>
      <div class="kpi-card"><div class="kpi-icon icon-green">🛡️</div><div><div class="kpi-label">Normal Transactions</div><div class="kpi-val">${fraudRes.normalCount}</div></div></div>
    `;

    tableContainer.innerHTML = `
      <table class="data-table">
        <thead>
          <tr><th>Row #</th><th>Isolation Score</th><th>Z-Score</th><th>Risk Rating</th><th>Transaction Details</th></tr>
        </thead>
        <tbody>
          ${fraudRes.scoredTransactions.slice(0, 15).map(t => `
            <tr ${t.isHighRisk ? 'style="background: rgba(244, 63, 94, 0.12);"' : ''}>
              <td><strong>#${t.rowIdx}</strong></td>
              <td><code>${t.anomalyScore}</code></td>
              <td>${t.avgZScore}</td>
              <td><strong>${t.riskLevel}</strong></td>
              <td style="font-size: 0.8rem; color: var(--text-muted);">${JSON.stringify(t.transactionData).substring(0, 70)}...</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  // 1d. STAR SCHEMA WAREHOUSE
  function renderSchemaTab() {
    const schema = SchemaModelerJS.getStarSchemaModel(SAMPLE_DATASETS[currentDatasetKey].name);
    const container = document.getElementById('schema-erd-container');
    if (!container) return;

    const factCardHtml = `
      <div class="erd-card" style="border-top: 4px solid ${schema.factTable.color}; grid-column: span 1;">
        <div class="erd-card-header" style="color: ${schema.factTable.color};">📊 ${schema.factTable.tableName} (${schema.factTable.type})</div>
        <div class="erd-attr-list">
          ${schema.factTable.attributes.map(a => `
            <div class="erd-attr-item">
              <span class="${a.type.includes('PK') ? 'erd-pk' : a.type.includes('FK') ? 'erd-fk' : ''}">${a.name}</span>
              <span style="color: var(--text-muted); font-size: 0.75rem;">${a.type}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    const dimsHtml = schema.dimensionTables.map(dim => `
      <div class="erd-card" style="border-top: 4px solid ${dim.color};">
        <div class="erd-card-header" style="color: ${dim.color};">🏛️ ${dim.tableName} (${dim.type})</div>
        <div class="erd-attr-list">
          ${dim.attributes.map(a => `
            <div class="erd-attr-item">
              <span class="${a.type.includes('PK') ? 'erd-pk' : ''}">${a.name}</span>
              <span style="color: var(--text-muted); font-size: 0.75rem;">${a.type}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');

    container.innerHTML = factCardHtml + dimsHtml;
  }

  // 1e. AIRFLOW ETL PIPELINE DAG
  let dagInstance = null;
  function renderPipelineTab() {
    const nodesContainer = document.getElementById('dag-nodes-container');
    const logBox = document.getElementById('pipeline-status-log');
    if (!nodesContainer) return;

    if (!dagInstance) {
      dagInstance = new PipelineDAGJS(
        (tasks, msg) => {
          renderTasksUI(tasks);
          if (logBox) logBox.innerHTML = `<p>⚡ <strong>Airflow Scheduler Log:</strong> ${msg}</p>`;
        },
        (tasks) => {
          renderTasksUI(tasks);
          if (logBox) logBox.innerHTML = `<p>✅ <strong>Pipeline Execution Complete!</strong> All 6 Airflow & dbt ETL tasks succeeded in 5.4s.</p>`;
        }
      );

      document.getElementById('btn-trigger-pipeline').onclick = () => {
        dagInstance.runPipeline();
      };
    }

    renderTasksUI(dagInstance.tasks);
  }

  function renderTasksUI(tasks) {
    const nodesContainer = document.getElementById('dag-nodes-container');
    if (!nodesContainer) return;

    nodesContainer.innerHTML = tasks.map((task, idx) => `
      <div class="dag-node-card dag-${task.status}">
        <div>
          <div style="font-weight: 600; color: var(--text-main);">${task.name}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">${task.log}</div>
        </div>
        <div>
          <span class="badge" style="${task.status === 'success' ? 'background: rgba(16,185,129,0.2); border-color: var(--accent-emerald);' : ''}">${task.status.toUpperCase()}</span>
        </div>
      </div>
    `).join('');
  }

  // 1f. DATA QUALITY & GREAT EXPECTATIONS
  function renderQualityTab() {
    const res = DataQualityEngineJS.validateDataset(cleanedData);
    const kpiGrid = document.getElementById('quality-kpi-grid');
    const tableContainer = document.getElementById('quality-results-table');
    if (!res || !kpiGrid) return;

    kpiGrid.innerHTML = `
      <div class="kpi-card"><div class="kpi-icon icon-blue">📋</div><div><div class="kpi-label">Executed Assertions</div><div class="kpi-val">${res.totalRules}</div></div></div>
      <div class="kpi-card"><div class="kpi-icon icon-green">✅</div><div><div class="kpi-label">Passed Assertions</div><div class="kpi-val">${res.passedCount}</div></div></div>
      <div class="kpi-card"><div class="kpi-icon icon-purple">🛡️</div><div><div class="kpi-label">Quality Score</div><div class="kpi-val" style="color: var(--accent-emerald);">${res.qualityPct}%</div></div></div>
    `;

    tableContainer.innerHTML = `
      <table class="data-table">
        <thead>
          <tr><th>Assertion Contract Rule</th><th>Suite Origin</th><th>Observed Results</th><th>Status</th></tr>
        </thead>
        <tbody>
          ${res.validations.map(v => `
            <tr>
              <td><code>${v.rule}</code></td>
              <td>${v.suite}</td>
              <td>${v.observed}</td>
              <td><span class="badge" style="${v.status === 'PASSED' ? 'background: rgba(16,185,129,0.2); border-color: var(--accent-emerald);' : 'background: rgba(244,63,94,0.2); border-color: var(--accent-rose);'}">${v.status}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  // 1g. DATA GOVERNANCE & LINEAGE
  function renderLineageTab() {
    const lineage = DataLineageEngineJS.getLineageGraph(SAMPLE_DATASETS[currentDatasetKey].name);
    const graphContainer = document.getElementById('lineage-graph-container');
    const catalogTable = document.getElementById('data-catalog-table');
    if (!graphContainer || !lineage) return;

    graphContainer.innerHTML = lineage.nodes.map(node => `
      <div class="erd-card" style="border-top: 4px solid ${node.color}; flex: 1; min-width: 220px;">
        <div class="erd-card-header" style="color: ${node.color};">${node.label}</div>
        <div style="font-size: 0.85rem; color: var(--text-muted);">${node.desc}</div>
        <div style="margin-top: 8px;"><span class="badge">${node.type}</span></div>
      </div>
    `).join('');

    catalogTable.innerHTML = `
      <table class="data-table">
        <thead>
          <tr><th>Metric / Attribute</th><th>Formula / Code</th><th>Data Owner</th><th>Business Description</th></tr>
        </thead>
        <tbody>
          ${lineage.dataDictionary.map(d => `
            <tr>
              <td><strong>${d.column}</strong></td>
              <td><code>${d.formula}</code></td>
              <td><span class="badge">${d.owner}</span></td>
              <td>${d.description}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  // 1h. MLFLOW EXPERIMENT TRACKING
  function renderMLflowTab() {
    const runs = MLflowTrackerJS.getExperimentRuns();
    const container = document.getElementById('mlflow-experiments-table');
    if (!container) return;

    container.innerHTML = `
      <table class="data-table">
        <thead>
          <tr><th>Run ID</th><th>Model Name</th><th>Stage</th><th>DVC Dataset Hash</th><th>Hyperparameters</th><th>R² Score</th><th>RMSE</th></tr>
        </thead>
        <tbody>
          ${runs.map(r => `
            <tr>
              <td><code>${r.runId}</code></td>
              <td><strong>${r.modelName}</strong></td>
              <td>${r.stage}</td>
              <td><code>${r.dvcHash}</code></td>
              <td style="font-size: 0.8rem; color: var(--text-muted);">${JSON.stringify(r.params)}</td>
              <td><span class="highlight">${r.metrics.r2_score}</span></td>
              <td>${r.metrics.rmse}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  // 1i. dbt SEMANTIC METRIC LAYER
  function renderSemanticTab() {
    const metrics = SemanticLayerJS.getMetricsCatalog();
    const container = document.getElementById('semantic-metrics-grid');
    if (!container) return;

    container.innerHTML = metrics.map(m => `
      <div class="glass-card" style="margin-bottom: 0;">
        <div class="card-title" style="justify-content: space-between;">
          <span>📐 ${m.metricName}</span>
          <span class="badge" style="background: rgba(56,189,248,0.2); border-color: var(--accent-cyan);">${m.cubeType}</span>
        </div>
        <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 8px;">${m.definition}</p>
        <div style="background: rgba(0,0,0,0.3); padding: 8px; border-radius: 4px; font-family: monospace; font-size: 0.85rem; color: var(--accent-cyan); margin-bottom: 8px;">${m.formula}</div>
        <div>Calibrated Metric Single Source of Truth: <strong class="highlight">${m.calibratedValue}</strong></div>
      </div>
    `).join('');
  }

  // 1j. CI/CD & dbt TEST SUITE
  function renderCICDTab() {
    const cicd = CICDRunnerJS.getTestSuiteResults();
    const summaryBox = document.getElementById('cicd-summary-box');
    const tableContainer = document.getElementById('cicd-tests-table');
    if (!summaryBox) return;

    summaryBox.innerHTML = `
      <h4>🚀 GitHub Actions Pipeline Status: ${cicd.ciStatus}</h4>
      <p>Target Commit: <code>${cicd.commitHash}</code> on branch [${cicd.branch}] | Build Duration: <strong>${cicd.buildDuration}</strong></p>
    `;

    tableContainer.innerHTML = `
      <table class="data-table">
        <thead>
          <tr><th>Test Case Name</th><th>Test Type</th><th>Duration</th><th>Status</th></tr>
        </thead>
        <tbody>
          ${cicd.testCases.map(t => `
            <tr>
              <td><code>${t.testName}</code></td>
              <td>${t.type}</td>
              <td>${t.duration}</td>
              <td><span class="badge" style="background: rgba(16,185,129,0.2); border-color: var(--accent-emerald);">${t.status}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  // 1k. A/B TESTING & BUSINESS ROI
  function renderROITab() {
    const numericCols = Object.keys(columnTypes).filter(c => columnTypes[c] === 'numeric');
    if (!numericCols || numericCols.length === 0) return;

    const sampleA = cleanedData.slice(0, 100).map(r => r[numericCols[0]]).filter(v => typeof v === 'number');
    const sampleB = sampleA.map(v => v * (1.08 + (Math.random() - 0.5) * 0.05));

    const ab = ROIABTestingJS.evaluateABTest(sampleA, sampleB, numericCols[0]);
    const resultsBox = document.getElementById('ab-results-box');
    const gridContainer = document.getElementById('ab-comparison-grid');

    if (!resultsBox) return;

    resultsBox.innerHTML = `
      <h4>💰 Business Impact & Financial ROI Analysis</h4>
      <p>${ab.financialImpact.executiveInsight}</p>
    `;

    gridContainer.innerHTML = `
      <div class="glass-card" style="margin-bottom: 0;">
        <div class="card-title">🔬 Statistical Significance Metrics</div>
        <p>Control Mean (A): <strong>${ab.variantA.mean}</strong> | Treatment Mean (B): <strong>${ab.variantB.mean}</strong></p>
        <p>Relative Lift: <span class="highlight">+${ab.relativeUpliftPct}%</span></p>
        <p>Z-Score: <code>${ab.zScore}</code> | p-Value: <span class="highlight">${ab.pValue} (${ab.isSignificant ? 'p < 0.05 Significant' : 'Not Significant'})</span></p>
      </div>

      <div class="glass-card" style="margin-bottom: 0;">
        <div class="card-title">📈 Projected Financial ROI Impact</div>
        <p>Estimated Monthly Revenue Lift: <strong class="highlight">+$${ab.financialImpact.monthlyIncreaseUSD.toLocaleString()}</strong></p>
        <p>Estimated Annualized Profit Impact: <strong class="highlight">+$${ab.financialImpact.annualIncreaseUSD.toLocaleString()}</strong></p>
      </div>
    `;
  }

  // 2. IN-MEMORY SQL CONSOLE
  let lastSQLResults = null;
  function renderSQLTab() {
    const input = document.getElementById('sql-query-input');
    const container = document.getElementById('sql-results-container');
    if (!input || !container) return;

    // Preset query chips
    document.querySelectorAll('.chip-btn').forEach(btn => {
      btn.onclick = () => {
        const sql = btn.getAttribute('data-sql');
        if (sql) {
          input.value = sql;
          document.getElementById('btn-run-sql').click();
        }
      };
    });

    document.getElementById('btn-run-sql').onclick = () => {
      const q = input.value.trim();
      const res = SQLEngineJS.executeQuery(q, cleanedData);
      lastSQLResults = res;

      if (res.error) {
        container.innerHTML = `<div class="insight-box priority-high"><p>❌ SQL Error: ${res.error}</p></div>`;
      } else {
        container.innerHTML = `
          <table class="data-table">
            <thead><tr>${res.headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
            <tbody>
              ${res.rows.map(r => `<tr>${res.headers.map(h => `<td>${r[h] !== null ? r[h] : '<span class="null-val">null</span>'}</td>`).join('')}</tr>`).join('')}
            </tbody>
          </table>
        `;
      }
    };

    const exportBtn = document.getElementById('btn-export-sql-csv');
    if (exportBtn) {
      exportBtn.onclick = () => {
        if (!lastSQLResults || lastSQLResults.error || !lastSQLResults.rows || !lastSQLResults.rows.length) {
          alert('No SQL query results to export.');
          return;
        }
        const cols = lastSQLResults.headers;
        let csvContent = "data:text/csv;charset=utf-8," + cols.join(",") + "\n";
        lastSQLResults.rows.forEach(r => csvContent += cols.map(c => `"${r[c] !== null ? r[c] : ''}"`).join(",") + "\n");
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", `sql_results_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
    }

    document.getElementById('btn-run-sql').click();
  }

  // 3. DATA HEALTH SCORE
  function renderHealthTab() {
    const health = DataHealthJS.evaluateDataHealth(cleanedData);
    const container = document.getElementById('health-score-container');
    if (!container || !health) return;

    container.innerHTML = `
      <div class="kpi-grid">
        <div class="kpi-card" style="border-left: 4px solid var(--accent-emerald);">
          <div class="kpi-icon icon-green">🛡️</div>
          <div>
            <div class="kpi-label">Data Quality Score</div>
            <div class="kpi-val" style="color: var(--accent-emerald);">${health.totalScore} / 100</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon icon-purple">🏅</div>
          <div>
            <div class="kpi-label">Rating Grade</div>
            <div class="kpi-val">${health.ratingGrade}</div>
          </div>
        </div>
      </div>

      <div class="ml-result-card" style="margin-top: 1rem;">
        <h4>Quality Breakdown</h4>
        <p>Completeness (40%): <strong>${health.breakdown.completenessScore}/40</strong> | Uniqueness (20%): <strong>${health.breakdown.uniquenessScore}/20</strong></p>
        <p>Outlier Score (20%): <strong>${health.breakdown.outlierScore}/20</strong> | Type Integrity: <strong>${health.breakdown.integrityScore}/20</strong></p>
      </div>
    `;
  }

  // 4. CLEANING & WRANGLING
  let wranglingLog = [];
  function renderCleaningTab() {
    const numericCols = Object.keys(columnTypes).filter(c => columnTypes[c] === 'numeric');
    const catCols = Object.keys(columnTypes).filter(c => columnTypes[c] === 'categorical');
    const cleanColSelect = document.getElementById('clean-col-select');
    const encodeColSelect = document.getElementById('encode-col-select');
    const scaleColSelect = document.getElementById('scale-col-select');

    if (!cleanColSelect) return;

    cleanColSelect.innerHTML = numericCols.map(c => `<option value="${c}">${c}</option>`).join('');
    if (encodeColSelect) encodeColSelect.innerHTML = catCols.map(c => `<option value="${c}">${c}</option>`).join('');
    if (scaleColSelect) scaleColSelect.innerHTML = numericCols.map(c => `<option value="${c}">${c}</option>`).join('');

    updateCleaningStats();

    cleanColSelect.onchange = updateCleaningStats;

    document.getElementById('btn-impute').onclick = () => {
      const col = cleanColSelect.value;
      const method = document.getElementById('impute-method').value;
      cleanedData = DataProcessor.imputeMissing(cleanedData, col, method);
      logWrangling(`Imputed missing values in [${col}] using [${method}].`);
      refreshAllViews();
    };

    document.getElementById('btn-remove-outliers').onclick = () => {
      const col = cleanColSelect.value;
      const method = document.getElementById('outlier-method').value;
      const initialCount = cleanedData.length;
      cleanedData = DataProcessor.removeOutliers(cleanedData, col, method);
      logWrangling(`Removed ${initialCount - cleanedData.length} outlier rows based on [${col}] (${method}).`);
      refreshAllViews();
    };

    const encodeBtn = document.getElementById('btn-one-hot-encode');
    if (encodeBtn) {
      encodeBtn.onclick = () => {
        const col = encodeColSelect.value;
        if (!col) return;
        cleanedData = DataProcessor.oneHotEncode(cleanedData, col);
        columnTypes = DataProcessor.getColumnTypes(cleanedData);
        logWrangling(`One-Hot Encoded categorical attribute [${col}].`);
        refreshAllViews();
      };
    }

    const scaleBtn = document.getElementById('btn-scale-col');
    if (scaleBtn) {
      scaleBtn.onclick = () => {
        const col = scaleColSelect.value;
        const method = document.getElementById('scale-method').value;
        if (!col) return;
        cleanedData = DataProcessor.scaleColumn(cleanedData, col, method);
        logWrangling(`Scaled column [${col}] using [${method}].`);
        refreshAllViews();
      };
    }

    const dupBtn = document.getElementById('btn-remove-duplicates');
    if (dupBtn) {
      dupBtn.onclick = () => {
        const initialCount = cleanedData.length;
        cleanedData = DataProcessor.removeDuplicates(cleanedData);
        logWrangling(`Removed ${initialCount - cleanedData.length} duplicate rows.`);
        refreshAllViews();
      };
    }

    document.getElementById('btn-reset-data').onclick = () => {
      cleanedData = [...rawData];
      columnTypes = DataProcessor.getColumnTypes(rawData);
      wranglingLog = [];
      logWrangling("Reset dataset to original state.");
      refreshAllViews();
    };
  }

  function logWrangling(msg) {
    wranglingLog.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
    const logEl = document.getElementById('wrangling-log');
    if (logEl) {
      logEl.innerHTML = `<strong>Wrangling Audit Log:</strong><ul>${wranglingLog.slice(-5).map(l => `<li>${l}</li>`).join('')}</ul>`;
    }
  }

  // 4b. PIVOT MATRIX
  let lastPivotData = null;
  function renderPivotTab() {
    const catCols = Object.keys(columnTypes).filter(c => columnTypes[c] === 'categorical');
    const numCols = Object.keys(columnTypes).filter(c => columnTypes[c] === 'numeric');
    const allCols = Object.keys(cleanedData[0] || {});

    const rowSel = document.getElementById('pivot-row-select');
    const colSel = document.getElementById('pivot-col-select');
    const valSel = document.getElementById('pivot-val-select');

    if (!rowSel || !valSel) return;

    rowSel.innerHTML = (catCols.length > 0 ? catCols : allCols).map(c => `<option value="${c}">${c}</option>`).join('');
    colSel.innerHTML = `<option value="">-- None (Single Dimension) --</option>` + (catCols.length > 0 ? catCols : allCols).map(c => `<option value="${c}">${c}</option>`).join('');
    valSel.innerHTML = numCols.map(c => `<option value="${c}">${c}</option>`).join('');

    const generatePivot = () => {
      const rowAttr = rowSel.value;
      const colAttr = colSel.value || null;
      const valAttr = valSel.value;
      const aggFunc = document.getElementById('pivot-agg-select').value;

      const pRes = PivotBuilder.generatePivotTable(cleanedData, rowAttr, colAttr, valAttr, aggFunc);
      lastPivotData = pRes;
      const container = document.getElementById('pivot-results-container');
      if (!container || !pRes) return;

      container.innerHTML = `
        <table class="data-table">
          <thead>
            <tr>
              <th>${pRes.rowAttr} \\ ${pRes.colAttr || 'Metrics'}</th>
              ${pRes.colKeys.map(c => `<th>${c}</th>`).join('')}
              <th class="pivot-total">Total (${pRes.aggFunc.toUpperCase()})</th>
            </tr>
          </thead>
          <tbody>
            ${pRes.rowKeys.map(r => `
              <tr>
                <td><strong>${r}</strong></td>
                ${pRes.colKeys.map(c => `<td>${pRes.matrix[r][c]}</td>`).join('')}
                <td class="pivot-total">${pRes.rowTotals[r]}</td>
              </tr>
            `).join('')}
            <tr class="pivot-total">
              <td><strong>Column ${pRes.aggFunc.toUpperCase()}</strong></td>
              ${pRes.colKeys.map(c => `<td><strong>${pRes.colTotals[c]}</strong></td>`).join('')}
              <td class="pivot-grand-total">${pRes.grandTotal}</td>
            </tr>
          </tbody>
        </table>
      `;
    };

    document.getElementById('btn-generate-pivot').onclick = generatePivot;
    generatePivot();

    const exportBtn = document.getElementById('btn-export-pivot-csv');
    if (exportBtn) {
      exportBtn.onclick = () => {
        if (!lastPivotData) return;
        const p = lastPivotData;
        let csv = `${p.rowAttr},` + p.colKeys.join(",") + ",Total\n";
        p.rowKeys.forEach(r => {
          csv += `"${r}",` + p.colKeys.map(c => p.matrix[r][c]).join(",") + `,${p.rowTotals[r]}\n`;
        });
        csv += "Total," + p.colKeys.map(c => p.colTotals[c]).join(",") + `,${p.grandTotal}\n`;
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI("data:text/csv;charset=utf-8," + csv));
        link.setAttribute("download", `pivot_${p.rowAttr}_vs_${p.valAttr}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
    }
  }

  // 4c. TEXT NLP & SENTIMENT
  function renderNLPTab() {
    const allCols = Object.keys(cleanedData[0] || {});
    const textSel = document.getElementById('nlp-text-select');
    if (!textSel) return;

    const stringCols = allCols.filter(c => cleanedData.some(r => typeof r[c] === 'string'));
    textSel.innerHTML = (stringCols.length > 0 ? stringCols : allCols).map(c => `<option value="${c}">${c}</option>`).join('');

    const runNLP = () => {
      const col = textSel.value;
      if (!col) return;

      const nlpRes = NLPEngine.analyzeTextData(cleanedData, col);
      const kpiContainer = document.getElementById('nlp-kpi-grid');
      const cloudContainer = document.getElementById('word-cloud-container');

      if (!nlpRes) {
        kpiContainer.innerHTML = `<div class="insight-box priority-high"><p>No text data found in attribute [${col}].</p></div>`;
        return;
      }

      kpiContainer.innerHTML = `
        <div class="kpi-card"><div class="kpi-icon icon-blue">💬</div><div><div class="kpi-label">Analyzed Text Records</div><div class="kpi-val">${nlpRes.totalTexts}</div></div></div>
        <div class="kpi-card"><div class="kpi-icon icon-green">😊</div><div><div class="kpi-label">Positive Sentiment</div><div class="kpi-val">${nlpRes.sentimentBreakdown.Positive}</div></div></div>
        <div class="kpi-card"><div class="kpi-icon icon-purple">😐</div><div><div class="kpi-label">Neutral Sentiment</div><div class="kpi-val">${nlpRes.sentimentBreakdown.Neutral}</div></div></div>
        <div class="kpi-card"><div class="kpi-icon icon-rose">😟</div><div><div class="kpi-label">Negative Sentiment</div><div class="kpi-val">${nlpRes.sentimentBreakdown.Negative}</div></div></div>
      `;

      chartViz.renderSentimentPie('chart-nlp-sentiment', nlpRes.sentimentBreakdown);
      chartViz.renderNLPBarChart('chart-nlp-keywords', nlpRes.topKeywords);

      cloudContainer.innerHTML = nlpRes.topKeywords.map(k => `
        <div class="word-tag">
          <span>${k.word}</span>
          <span class="tag-count">${k.count}</span>
        </div>
      `).join('');
    };

    document.getElementById('btn-run-nlp').onclick = runNLP;
    runNLP();
  }

  function updateCleaningStats() {
    const col = document.getElementById('clean-col-select').value;
    if (!col) return;
    const stats = DataProcessor.getStats(cleanedData.map(r => r[col]));
    const zOutliers = DataProcessor.detectOutliers(cleanedData, col, 'zscore');

    document.getElementById('clean-stats').innerHTML = `
      <div class="stat-card"><span>Mean:</span> <strong>${stats.mean}</strong></div>
      <div class="stat-card"><span>Std Dev:</span> <strong>${stats.stdDev}</strong></div>
      <div class="stat-card"><span>Skewness:</span> <strong>${stats.skewness}</strong></div>
      <div class="stat-card"><span>Missing:</span> <strong>${stats.missing} (${stats.missingPct}%)</strong></div>
      <div class="stat-card"><span>Z-Outliers:</span> <strong>${zOutliers.outlierCount}</strong></div>
    `;
  }

  // 5. EDA
  function renderEDATab() {
    const numericCols = Object.keys(columnTypes).filter(c => columnTypes[c] === 'numeric');
    const xSelect = document.getElementById('eda-x-select');
    const ySelect = document.getElementById('eda-y-select');
    if (!xSelect || !ySelect) return;

    xSelect.innerHTML = numericCols.map(c => `<option value="${c}">${c}</option>`).join('');
    ySelect.innerHTML = numericCols.map((c, i) => `<option value="${c}" ${i === 1 ? 'selected' : ''}>${c}</option>`).join('');

    document.getElementById('stats-table-body').innerHTML = numericCols.map(c => {
      const s = DataProcessor.getStats(cleanedData.map(r => r[c]));
      return `<tr><td><strong>${c}</strong></td><td>${s.count}</td><td>${s.mean}</td><td>${s.median}</td><td>${s.stdDev}</td><td>${s.min}</td><td>${s.q1}</td><td>${s.q3}</td><td>${s.max}</td><td>${s.skewness}</td></tr>`;
    }).join('');

    const updateEDACharts = () => {
      const xCol = xSelect.value;
      const yCol = ySelect.value;
      const sX = DataProcessor.getStats(cleanedData.map(r => r[xCol]));
      const binWidth = (sX.max - sX.min) / 10 || 1;
      const bins = new Array(10).fill(0);
      const labels = Array.from({ length: 10 }, (_, i) => `${Math.round(sX.min + i*binWidth)}-${Math.round(sX.min + (i+1)*binWidth)}`);

      cleanedData.forEach(r => {
        const v = r[xCol];
        if (typeof v === 'number') {
          let idx = Math.floor((v - sX.min) / binWidth);
          if (idx >= 10) idx = 9;
          if (idx >= 0) bins[idx]++;
        }
      });

      chartViz.renderHistogram('chart-histogram', `Distribution of ${xCol}`, labels, bins);
      const points = cleanedData.map(r => ({ x: r[xCol], y: r[yCol] })).filter(p => typeof p.x === 'number' && typeof p.y === 'number');
      const reg = MLEngine.runLinearRegression(cleanedData, xCol, yCol);
      chartViz.renderScatterPlot('chart-scatter', `${xCol} vs ${yCol}`, points, reg);

      const corrData = DataProcessor.getCorrelationMatrix(cleanedData);
      chartViz.renderHeatmap('canvas-heatmap', corrData.numCols, corrData.matrix);
    };

    xSelect.onchange = updateEDACharts;
    ySelect.onchange = updateEDACharts;
    updateEDACharts();
  }

  // 6. AUTOML
  function renderAutoMLTab() {
    const numericCols = Object.keys(columnTypes).filter(c => columnTypes[c] === 'numeric');
    if (numericCols.length < 2) return;

    document.getElementById('btn-run-automl').onclick = () => {
      const targetCol = SAMPLE_DATASETS[currentDatasetKey].target || numericCols[numericCols.length - 1];
      const featCols = numericCols.filter(c => c !== targetCol);
      const res = AutoMLJS.runAutoMLTournament(cleanedData, featCols, targetCol);

      if (res) {
        document.getElementById('automl-results').innerHTML = `
          <div class="ml-result-card">
            <h4>🥇 Winner Model: ${res.bestModel.name}</h4>
            <p>Target Attribute: <strong>${res.targetCol}</strong> | Best R² Score: <span class="highlight">${res.bestModel.r2}</span> | RMSE: ${res.bestModel.rmse}</p>
          </div>

          <div class="table-wrapper" style="margin-top: 1rem;">
            <table class="data-table">
              <thead><tr><th>Rank</th><th>Model Name</th><th>R² Score</th><th>RMSE</th><th>Status</th></tr></thead>
              <tbody>
                ${res.leaderboard.map((m, idx) => `
                  <tr ${idx === 0 ? 'style="background: rgba(16, 185, 129, 0.15);"' : ''}>
                    <td><strong>#${idx + 1}</strong></td>
                    <td>${m.name}</td>
                    <td><strong>${m.r2}</strong></td>
                    <td>${m.rmse}</td>
                    <td><span class="badge">${m.status}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      }
    };

    document.getElementById('btn-run-automl').click();
  }

  // 7. AI & DEEP LEARNING
  function renderAIDeepTab() {
    const numericCols = Object.keys(columnTypes).filter(c => columnTypes[c] === 'numeric');
    if (numericCols.length < 2) return;

    document.getElementById('btn-train-nn').onclick = () => {
      const targetCol = SAMPLE_DATASETS[currentDatasetKey].target || numericCols[numericCols.length - 1];
      const featCols = numericCols.filter(c => c !== targetCol).slice(0, 3);
      if (featCols.length < 1) return;

      const validRows = cleanedData.filter(r => featCols.every(f => typeof r[f] === 'number') && typeof r[targetCol] === 'number');
      const X = validRows.map(r => featCols.map(f => r[f]));
      const meanT = validRows.reduce((a, b) => a + b[targetCol], 0) / validRows.length;
      const Y = validRows.map(r => r[targetCol] > meanT ? 1 : 0);

      const mlp = new NeuralNetworkJS(featCols.length, 4, 1, 0.05);
      const lossHist = mlp.train(X, Y, 30);

      document.getElementById('nn-summary').innerHTML = `
        <div class="ml-result-card">
          <h4>🧠 Neural Network Architecture: ${featCols.length} Input ➔ 4 Hidden ➔ 1 Output</h4>
          <p>Initial Epoch Loss: <strong>${lossHist[0]}</strong> | Final Epoch Loss: <span class="highlight">${lossHist[lossHist.length - 1]}</span></p>
        </div>
      `;
      chartViz.renderNeuralNetworkGraph('canvas-nn-graph', featCols, 4);
      chartViz.renderLossCurve('chart-nn-loss', lossHist);
    };

    document.getElementById('btn-run-rf').onclick = () => {
      const targetCol = SAMPLE_DATASETS[currentDatasetKey].target || numericCols[numericCols.length - 1];
      const featCols = numericCols.filter(c => c !== targetCol);
      const importances = DecisionTreeJS.calculateFeatureImportance(cleanedData, featCols, targetCol);

      if (importances) {
        document.getElementById('rf-summary').innerHTML = `
          <div class="ml-result-card">
            <h4>🌲 Random Forest Gini Feature Importance Ranking</h4>
            <p>Target Attribute: <strong>${targetCol}</strong></p>
          </div>
        `;
        chartViz.renderFeatureImportanceBar('chart-rf-importance', importances);
      }
    };

    document.getElementById('btn-train-nn').click();
    document.getElementById('btn-run-rf').click();
  }

  // 8. HYPOTHESIS LAB
  function renderHypothesisTab() {
    const catCols = Object.keys(columnTypes).filter(c => columnTypes[c] === 'categorical');
    const numCols = Object.keys(columnTypes).filter(c => columnTypes[c] === 'numeric');

    const catSel = document.getElementById('hypo-cat-select');
    const numSel = document.getElementById('hypo-num-select');
    if (!catSel || !numSel) return;

    catSel.innerHTML = catCols.map(c => `<option value="${c}">${c}</option>`).join('');
    numSel.innerHTML = numCols.map(c => `<option value="${c}">${c}</option>`).join('');

    document.getElementById('btn-run-ttest').onclick = () => {
      const cat = catSel.value;
      const num = numSel.value;
      const res = HypothesisEngineJS.runTTest(cleanedData, cat, num);

      if (res) {
        document.getElementById('hypo-results').innerHTML = `
          <div class="ml-result-card">
            <h4>🧪 Student's t-Test (${res.catCol} vs ${res.numCol})</h4>
            <p>Group [${res.groupAName}] Mean: <strong>${res.meanA}</strong> | Group [${res.groupBName}] Mean: <strong>${res.meanB}</strong></p>
            <p>t-Statistic: <code>${res.tStat}</code> (df=${res.df}) | Significance: <span class="highlight">${res.pValStr}</span></p>
          </div>
        `;
      }
    };

    document.getElementById('btn-run-ttest').click();
  }

  // 9. STORYTELLER
  function renderStorytellerTab() {
    const corrData = DataProcessor.getCorrelationMatrix(cleanedData);
    let topInsights = [];
    corrData.numCols.forEach((c1, i) => {
      for (let j = i + 1; j < corrData.numCols.length; j++) {
        const c2 = corrData.numCols[j];
        const r = corrData.matrix[c1][c2];
        if (Math.abs(r) > 0.25) topInsights.push(`Strong correlation between <strong>${c1}</strong> and <strong>${c2}</strong> (r = ${r}).`);
      }
    });

    storyteller.init(SAMPLE_DATASETS[currentDatasetKey].name, cleanedData.length, Object.keys(cleanedData[0] || {}).length, topInsights.slice(0, 3));
  }

  // 10. LIVE STREAM
  function renderStreamTab() {
    if (!streamSim) {
      streamSim = new StreamSimulator(
        (data) => {
          const labels = data.history.map((_, i) => `Tick ${data.tick - data.history.length + i + 1}`);
          chartViz.renderHistogram('chart-stream', `Live Streaming Data Stream (Tick #${data.tick})`, labels, data.history, data.isAnomaly ? 'rgba(244, 63, 94, 0.8)' : 'rgba(56, 189, 248, 0.7)');
        },
        (alertData) => {
          const alertBox = document.getElementById('stream-alert-box');
          if (alertBox) {
            alertBox.innerHTML = `<div class="insight-box priority-high"><p>${alertData.msg}</p></div>`;
          }
        }
      );

      document.getElementById('btn-start-stream').onclick = () => streamSim.start();
      document.getElementById('btn-stop-stream').onclick = () => streamSim.stop();
    }
  }

  // 11. FORECAST
  function renderForecastTab() {
    const numericCols = Object.keys(columnTypes).filter(c => columnTypes[c] === 'numeric');
    const colSel = document.getElementById('forecast-col-select');
    if (!colSel || numericCols.length === 0) return;

    colSel.innerHTML = numericCols.map(c => `<option value="${c}">${c}</option>`).join('');

    const updateForecast = () => {
      const col = colSel.value;
      const days = parseInt(document.getElementById('forecast-days-select').value, 10) || 30;
      const historyData = cleanedData.slice(0, 40).map(r => r[col]).filter(v => typeof v === 'number');
      chartViz.renderForecastChart('chart-forecast', historyData, days);
    };

    document.getElementById('btn-update-forecast').onclick = updateForecast;
    updateForecast();
  }

  // 12. CHART BUILDER
  function renderChartBuilderTab() {
    const catCols = Object.keys(columnTypes).filter(c => columnTypes[c] === 'categorical');
    const numCols = Object.keys(columnTypes).filter(c => columnTypes[c] === 'numeric');

    const xSel = document.getElementById('builder-x-select');
    const ySel = document.getElementById('builder-y-select');
    if (!xSel || !ySel) return;

    xSel.innerHTML = (catCols.length > 0 ? catCols : numCols).map(c => `<option value="${c}">${c}</option>`).join('');
    ySel.innerHTML = numCols.map(c => `<option value="${c}">${c}</option>`).join('');

    const renderCustom = () => {
      const x = xSel.value;
      const y = ySel.value;
      const type = document.getElementById('builder-type-select').value;
      ChartBuilderJS.renderCustomChart(chartViz, 'chart-custom-builder', cleanedData, x, y, type);
    };

    document.getElementById('btn-render-custom').onclick = renderCustom;
    renderCustom();
  }

  // 13. CHATBOT
  function renderChatbotTab() {
    document.querySelectorAll('.chat-chip').forEach(chip => {
      chip.onclick = () => {
        const prompt = chip.getAttribute('data-prompt');
        if (prompt) {
          document.getElementById('chat-input').value = prompt;
          document.getElementById('btn-send-chat').click();
        }
      };
    });
  }

  document.getElementById('btn-send-chat').onclick = () => {
    const input = document.getElementById('chat-input');
    const query = input.value.trim();
    if (!query) return;

    const chatContainer = document.getElementById('chat-messages');
    chatContainer.innerHTML += `<div style="text-align: right; margin-bottom: 8px;"><span class="badge" style="background: var(--primary);">👤 You: ${query}</span></div>`;

    const response = AIAssistantJS.respondToUserQuery(query, cleanedData, SAMPLE_DATASETS[currentDatasetKey].name);
    chatContainer.innerHTML += `<div class="insight-box" style="margin-bottom: 8px;"><p>🤖 <strong>AI Assistant:</strong> ${response}</p></div>`;

    input.value = '';
    chatContainer.scrollTop = chatContainer.scrollHeight;
  };

  // 14. INSIGHTS
  function renderInsightsTab() {
    const corrData = DataProcessor.getCorrelationMatrix(cleanedData);
    let topCorrelations = [];
    corrData.numCols.forEach((c1, i) => {
      for (let j = i + 1; j < corrData.numCols.length; j++) {
        const c2 = corrData.numCols[j];
        const r = corrData.matrix[c1][c2];
        if (Math.abs(r) > 0.25) topCorrelations.push({ c1, c2, r });
      }
    });

    const insightsContainer = document.getElementById('ai-insights-list');
    if (!insightsContainer) return;

    insightsContainer.innerHTML = `
      <div class="insight-box priority-high">
        <h4>⚡ Supreme Zenith AI Executive Summary</h4>
        <p>Analyzed <strong>${cleanedData.length} records</strong> across <strong>${Object.keys(cleanedData[0] || {}).length} variables</strong>.</p>
      </div>

      <div class="insight-box">
        <h4>🔗 Key Correlation Drivers</h4>
        <ul>
          ${topCorrelations.slice(0, 4).map(item => `<li>Strong relationship between <strong>${item.c1}</strong> and <strong>${item.c2}</strong> (r = ${item.r}).</li>`).join('') || '<li>No high correlations found.</li>'}
        </ul>
      </div>
    `;

    document.getElementById('btn-export-csv').onclick = () => {
      const cols = Object.keys(cleanedData[0]);
      let csvContent = "data:text/csv;charset=utf-8," + cols.join(",") + "\n";
      cleanedData.forEach(r => csvContent += cols.map(c => `"${r[c] !== null ? r[c] : ''}"`).join(",") + "\n");
      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvContent));
      link.setAttribute("download", `cleaned_${currentDatasetKey}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    document.getElementById('btn-export-pdf').onclick = () => window.print();
  }

  // 15. EXPLAINABLE AI (XAI) - SHAP & LIME
  function renderXAITab() {
    const selector = document.getElementById('xai-customer-select');
    const waterfallBox = document.getElementById('xai-waterfall-box');
    const summaryBox = document.getElementById('xai-summary-box');
    if (!selector || !waterfallBox) return;

    const idKey = cleanedData[0]?.Customer_ID ? 'Customer_ID' : Object.keys(cleanedData[0] || {})[0] || 'id';
    selector.innerHTML = cleanedData.slice(0, 15).map((r, i) => `<option value="${i}">Customer #${r[idKey] || i + 1}</option>`).join('');

    const updateXAI = (idx) => {
      const row = cleanedData[idx] || cleanedData[0];
      const shapRes = XAIShapEngineJS.calculateSHAPWaterfall(row);

      summaryBox.className = 'insight-box';
      summaryBox.innerHTML = `
        <h4>🤖 Model Prediction: ${shapRes.predictionLabel} (Score: ${shapRes.finalPredictionScore}%)</h4>
        <p>Base Model Expectation: <strong>${shapRes.baseValue}%</strong> | Individual Impact Shift: <strong>${(shapRes.finalPredictionScore - shapRes.baseValue).toFixed(1)}%</strong></p>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 6px;">
          Top Risk Factor: <strong style="color: var(--accent-rose);">${shapRes.topPositiveDriver.feature} (${shapRes.topPositiveDriver.value})</strong> |
          Top Mitigating Factor: <strong style="color: var(--accent-emerald);">${shapRes.topNegativeDriver.feature} (${shapRes.topNegativeDriver.value})</strong>
        </p>
      `;

      waterfallBox.innerHTML = `
        <div style="font-weight: 700; margin-bottom: 12px;">SHAP Force Waterfall (Base Value = ${shapRes.baseValue}%)</div>
        ${shapRes.contributions.map(c => `
          <div style="display: flex; align-items: center; margin-bottom: 10px; font-size: 0.85rem;">
            <div style="width: 180px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">
              <strong>${c.feature}</strong> = <span style="color: var(--text-muted);">${c.value}</span>
            </div>
            <div style="flex: 1; margin: 0 12px; background: rgba(255,255,255,0.05); border-radius: 4px; height: 22px; position: relative;">
              <div style="position: absolute; top:0; bottom:0; ${c.shapValue >= 0 ? `left: 50%; width: ${Math.min(50, c.shapValue * 2.5)}%; background: var(--accent-rose);` : `right: 50%; width: ${Math.min(50, Math.abs(c.shapValue) * 2.5)}%; background: var(--accent-emerald);`}; border-radius: 3px;"></div>
            </div>
            <div style="width: 70px; text-align: right; font-weight: 700; color: ${c.shapValue >= 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)'};">
              ${c.shapValue >= 0 ? '+' : ''}${c.shapValue}%
            </div>
          </div>
        `).join('')}
      `;
    };

    selector.onchange = (e) => updateXAI(parseInt(e.target.value, 10));
    updateXAI(0);
  }

  // 16. REVERSE ETL & OPERATIONAL ANALYTICS
  function renderReverseETLTab() {
    const destSelect = document.getElementById('retl-destination-select');
    const syncStatusContainer = document.getElementById('retl-sync-status');
    const webhookLogBox = document.getElementById('retl-webhook-log');
    if (!destSelect || !syncStatusContainer) return;

    document.getElementById('btn-run-retl-sync').onclick = () => {
      const dest = destSelect.value;
      const res = ReverseETLEngineJS.triggerReverseETLSync(dest, cleanedData);
      syncStatusContainer.innerHTML = `
        <div class="insight-box" style="border-left-color: var(--accent-emerald);">
          <h4>✅ Reverse ETL Sync Complete to ${res.destination}</h4>
          <p>Synced <strong>${res.pushedRecords} records</strong>. Target Table: <code>${res.targetEntity}</code></p>
          <p style="font-size: 0.8rem; color: var(--text-muted);">Sync Duration: ${res.executionTimeMs} ms | Timestamp: ${res.timestamp}</p>
        </div>
      `;
    };

    document.getElementById('btn-trigger-retl-webhook').onclick = () => {
      const res = ReverseETLEngineJS.simulateActionWebhook(cleanedData[0] || {});
      webhookLogBox.innerHTML = `
        <div class="insight-box priority-high">
          <h4>🚨 Action Webhook Triggered (${res.status})</h4>
          <p>Payload: <code>${JSON.stringify(res.payload)}</code></p>
          <p style="font-size: 0.8rem; margin-top: 6px;">Trigger Condition: Risk Score (${res.payload.riskScore}%) > Threshold 80%</p>
        </div>
      `;
    };
  }

  // 17. FINOPS & DATA FRESHNESS SLA
  function renderFinOpsTab() {
    const costBox = document.getElementById('finops-cost-box');
    const slaBox = document.getElementById('finops-sla-box');
    const advisorTable = document.getElementById('finops-advisor-table');
    if (!costBox || !slaBox) return;

    const summary = FinOpsSLAEngineJS.getFinOpsSummary();

    costBox.innerHTML = `
      <div style="font-size: 2rem; font-weight: 800; color: var(--accent-emerald);">$${summary.totalDollarCostUSD.toFixed(2)} USD</div>
      <div style="color: var(--text-muted); font-size: 0.9rem; margin-top: 4px;">Snowflake Credit Consumption: <strong>${summary.totalSnowflakeCredits.toFixed(3)} Credits</strong></div>
      <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 8px;">Scanned Bytes: ${summary.totalScannedGB.toFixed(2)} GB across ${summary.queryCount} queries</div>
    `;

    const sla = summary.dataFreshnessSLA;
    slaBox.className = sla.isBreached ? 'insight-box priority-high' : 'insight-box';
    slaBox.innerHTML = `
      <h4>${sla.isBreached ? '⚠️ SLA Breached Alert!' : '🟢 Data Freshness SLA Compliant'}</h4>
      <p>Target Latency: <strong>&lt; ${sla.targetMaxDelayMinutes} mins</strong> | Actual Delay: <strong style="color: ${sla.isBreached ? 'var(--accent-rose)' : 'var(--accent-emerald)'};">${sla.actualDelayMinutes} mins</strong></p>
      <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">Pipeline Ingestion Target: ${sla.pipelineName} (Last Sync: ${sla.lastIngestionTimestamp})</p>
    `;

    advisorTable.innerHTML = `
      <table class="data-table">
        <thead>
          <tr><th>Query ID</th><th>Scanned (GB)</th><th>Exec Time (s)</th><th>Est. Cost ($)</th><th>Optimization Recommendation</th></tr>
        </thead>
        <tbody>
          ${summary.slowQueries.map(q => `
            <tr>
              <td><code>${q.queryId}</code></td>
              <td>${q.scannedGB} GB</td>
              <td>${q.executionTimeSec}s</td>
              <td>$${q.costUSD.toFixed(3)}</td>
              <td><span class="badge" style="background: rgba(99,102,241,0.2);">${q.recommendation}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  // 18. GDPR / CCPA COMPLIANCE & PRIVACY ENGINE
  function renderGDPRTab() {
    const custIdInput = document.getElementById('gdpr-customer-id-input');
    const statusBox = document.getElementById('gdpr-erasure-status');
    const auditTable = document.getElementById('gdpr-audit-table');
    if (!custIdInput || !statusBox) return;

    document.getElementById('btn-run-gdpr-erasure').onclick = () => {
      const targetId = custIdInput.value.trim() || 'CUST-001';
      const res = GDPRComplianceEngineJS.cascadeCustomerErasure(cleanedData, targetId);
      cleanedData = res.updatedData;

      statusBox.innerHTML = `
        <div class="insight-box priority-high">
          <h4>🗑️ Cascade Erasure Executed (GDPR Right to be Forgotten)</h4>
          <p>Customer ID <code>${res.erasedCustomerId}</code> successfully anonymized across <strong>${res.tablesAffected.length} tables</strong> (${res.tablesAffected.join(', ')}).</p>
          <p style="font-size: 0.8rem; margin-top: 4px;">Records Cascade Deleted / Anonymized: ${res.recordsAnonymized}</p>
        </div>
      `;
      renderGDPRTab();
    };

    const auditTrail = GDPRComplianceEngineJS.getAuditTrail();
    auditTable.innerHTML = `
      <table class="data-table">
        <thead>
          <tr><th>Audit ID</th><th>Timestamp</th><th>User / Service</th><th>Action</th><th>Resource / Query</th><th>Status</th></tr>
        </thead>
        <tbody>
          ${auditTrail.slice(-10).reverse().map(a => `
            <tr>
              <td><code>${a.auditId}</code></td>
              <td style="font-size: 0.8rem;">${a.timestamp}</td>
              <td><strong>${a.user}</strong></td>
              <td><span class="badge">${a.action}</span></td>
              <td style="font-size: 0.8rem; color: var(--text-muted);">${a.details}</td>
              <td><span class="badge" style="background: rgba(16, 185, 129, 0.2);">${a.status}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  // Initial load
  loadDataset('ecommerce');
});
