/**
 * Data Warehouse Star Schema & Snowflake Schema Modeler
 * Displays Fact Tables, Dimension Tables, Foreign Key relationships, and ERD structures.
 */

class SchemaModelerJS {
  static getStarSchemaModel(datasetName = 'E-Commerce Analytics') {
    return {
      name: `${datasetName} Star Schema Data Warehouse`,
      factTable: {
        tableName: 'fact_sales_transactions',
        type: 'Fact Table',
        color: '#6366f1',
        attributes: [
          { name: 'transaction_id', type: 'VARCHAR(64) [PK]' },
          { name: 'customer_key', type: 'INT [FK -> dim_customers]' },
          { name: 'product_key', type: 'INT [FK -> dim_products]' },
          { name: 'date_key', type: 'INT [FK -> dim_date]' },
          { name: 'price_usd', type: 'DECIMAL(10,2) [Metric]' },
          { name: 'quantity', type: 'INT [Metric]' },
          { name: 'total_spend_usd', type: 'DECIMAL(10,2) [Metric]' },
          { name: 'discount_pct', type: 'DECIMAL(5,2) [Metric]' }
        ]
      },
      dimensionTables: [
        {
          tableName: 'dim_customers',
          type: 'Dimension (SCD Type 2)',
          color: '#38bdf8',
          attributes: [
            { name: 'customer_key', type: 'INT [PK]' },
            { name: 'customer_id', type: 'VARCHAR(32)' },
            { name: 'age', type: 'INT' },
            { name: 'gender', type: 'VARCHAR(16)' },
            { name: 'rfm_segment', type: 'VARCHAR(32)' },
            { name: 'ltv_usd', type: 'DECIMAL(10,2)' }
          ]
        },
        {
          tableName: 'dim_products',
          type: 'Dimension',
          color: '#a855f7',
          attributes: [
            { name: 'product_key', type: 'INT [PK]' },
            { name: 'category', type: 'VARCHAR(64)' },
            { name: 'sub_category', type: 'VARCHAR(64)' },
            { name: 'unit_price', type: 'DECIMAL(10,2)' }
          ]
        },
        {
          tableName: 'dim_date',
          type: 'Dimension',
          color: '#10b981',
          attributes: [
            { name: 'date_key', type: 'INT [PK]' },
            { name: 'full_date', type: 'DATE' },
            { name: 'day_of_week', type: 'VARCHAR(16)' },
            { name: 'month_name', type: 'VARCHAR(16)' },
            { name: 'quarter', type: 'INT' },
            { name: 'year', type: 'INT' }
          ]
        }
      ]
    };
  }
}
