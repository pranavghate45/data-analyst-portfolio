/**
 * dbt Semantic Metric Layer & Cube.js Centralized Definitions
 * Establishes a single source of truth for business metrics across all downstream dashboards.
 */

class SemanticLayerJS {
  static getMetricsCatalog() {
    return [
      {
        metricName: 'Gross Revenue (USD)',
        cubeType: 'Measure (SUM)',
        formula: 'SUM(fact_sales.total_spend_usd)',
        definition: 'Total monetary value generated before refunds and operating expenses.',
        calibratedValue: '$447,345.00'
      },
      {
        metricName: 'Monthly Recurring Revenue (MRR)',
        cubeType: 'Measure (SUM)',
        formula: 'SUM(fact_subscriptions.monthly_charges_usd WHERE status = "Active")',
        definition: 'Normalized monthly subscription revenue single source of truth.',
        calibratedValue: '$193,680.00'
      },
      {
        metricName: 'Customer Churn Rate (%)',
        cubeType: 'Calculated Metric',
        formula: 'COUNT(churned_customers) / COUNT(total_active_customers) * 100',
        definition: 'Monthly percentage of subscribers terminating accounts.',
        calibratedValue: '13.0%'
      },
      {
        metricName: 'Customer Lifetime Value (LTV)',
        cubeType: 'Calculated Metric',
        formula: 'Average Order Value * Purchase Frequency * Customer Lifespan',
        definition: 'Estimated net lifetime revenue per acquired customer.',
        calibratedValue: '$715.75'
      }
    ];
  }
}
