/**
 * OpenLineage Data Governance & Metadata Lineage Engine
 * Generates interactive visual end-to-end lineage graph from raw source to dbt transformation to warehouse to ML model to business dashboards.
 */

class DataLineageEngineJS {
  static getLineageGraph(datasetName = 'E-Commerce') {
    return {
      nodes: [
        { id: 'src_kafka', label: '📥 Kafka Raw Stream / API', layer: 'Source Layer', type: 'Ingestion', color: '#38bdf8', desc: 'Raw event stream ingestion via Airbyte' },
        { id: 'stg_raw', label: '🧹 stg_raw_transactions', layer: 'Staging Layer', type: 'dbt Model', color: '#a855f7', desc: 'dbt staging table with data quality assertions' },
        { id: 'dim_cust', label: '🏛️ dim_customers (SCD Type 2)', layer: 'Warehouse Layer', type: 'Snowflake Table', color: '#6366f1', desc: 'Customer dimension table with historical versioning' },
        { id: 'fct_sales', label: '📊 fact_sales_transactions', layer: 'Warehouse Layer', type: 'Snowflake Table', color: '#6366f1', desc: 'Core partitioned transactional fact table' },
        { id: 'ml_rfm', label: '🧠 RFM & Churn ML Model', layer: 'Analytics Layer', type: 'MLflow Registry', color: '#10b981', desc: 'Random Forest Churn Score & RFM Quintiles' },
        { id: 'dash_exec', label: '📈 Executive KPI Dashboard', layer: 'BI & Reporting', type: 'Streamlit / Power BI', color: '#fbbf24', desc: 'Real-time Executive summary & LTV reports' }
      ],
      edges: [
        { from: 'src_kafka', to: 'stg_raw' },
        { from: 'stg_raw', to: 'dim_cust' },
        { from: 'stg_raw', to: 'fct_sales' },
        { from: 'dim_cust', to: 'ml_rfm' },
        { from: 'fct_sales', to: 'ml_rfm' },
        { from: 'ml_rfm', to: 'dash_exec' }
      ],
      dataDictionary: [
        { column: 'Total_Spend_USD', formula: 'SUM(price_usd * quantity * (1 - discount_pct))', owner: 'Finance Analytics', description: 'Net revenue after customer discounts.' },
        { column: 'RFM_Segment', formula: 'NTILE(5) OVER (ORDER BY Recency, Frequency, Monetary)', owner: 'Growth Marketing', description: 'Quintile customer loyalty classification.' },
        { column: 'Churn_Probability', formula: 'RandomForestClassifier.predict_proba(features)', owner: 'Data Science Team', description: 'ML predicted churn risk score between 0 and 1.' }
      ]
    };
  }
}
