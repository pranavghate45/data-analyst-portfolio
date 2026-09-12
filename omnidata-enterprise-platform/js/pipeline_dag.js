/**
 * Enterprise Airflow & dbt ETL Pipeline Simulator
 * Simulates a multi-stage data engineering DAG:
 * 1. Data Ingestion (Kafka/Airbyte) -> 2. dbt Staging & Transformation -> 3. Star Schema Data Warehouse Load -> 4. ML Model Training & Scoring -> 5. Dashboard Refresh
 */

class PipelineDAGJS {
  constructor(onStepUpdate, onComplete) {
    this.onStepUpdate = onStepUpdate;
    this.onComplete = onComplete;
    this.isRunning = false;
    this.tasks = [
      { id: 'task_ingest', name: '📥 Ingest Raw Data (API / Kafka Stream)', status: 'pending', duration: 800, log: 'Connecting to Kafka topic raw_events...' },
      { id: 'task_clean', name: '🧹 Deduplication & Type Casting (PySpark)', status: 'pending', duration: 1000, log: 'Casting schema types and removing duplicate records...' },
      { id: 'task_dbt', name: '⚙️ dbt Model Transformations (stg_sales, fct_orders)', status: 'pending', duration: 1200, log: 'Building dbt materializations: dim_customers, fact_orders...' },
      { id: 'task_warehouse', name: '🏛️ Load to Snowflake / BigQuery Warehouse', status: 'pending', duration: 900, log: 'Inserting 1,500 partitioned rows into Snowflake DWH...' },
      { id: 'task_rfm_ml', name: '🧠 Train ML Churn Model & Calculate RFM Scores', status: 'pending', duration: 1100, log: 'Fitting Scikit-Learn Random Forest & RFM Quintiles...' },
      { id: 'task_dashboard', name: '📊 Update Executive KPI Dashboards', status: 'pending', duration: 600, log: 'Invalidating cache and pushing metrics to frontend...' }
    ];
  }

  async runPipeline() {
    if (this.isRunning) return;
    this.isRunning = true;

    // Reset task statuses
    this.tasks.forEach(t => t.status = 'pending');
    if (this.onStepUpdate) this.onStepUpdate(this.tasks, 'Pipeline execution started...');

    for (let i = 0; i < this.tasks.length; i++) {
      const task = this.tasks[i];
      task.status = 'running';
      if (this.onStepUpdate) this.onStepUpdate(this.tasks, `Running task: ${task.name}`);

      await new Promise(resolve => setTimeout(resolve, task.duration));

      task.status = 'success';
      if (this.onStepUpdate) this.onStepUpdate(this.tasks, `Completed task: ${task.name}`);
    }

    this.isRunning = false;
    if (this.onComplete) this.onComplete(this.tasks);
  }
}
