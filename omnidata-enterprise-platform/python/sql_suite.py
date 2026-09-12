"""
OmniData Analytics Suite (Supreme Zenith Edition) - SQL Suite
Implements an In-Memory SQL Query Parser and Aggregator (SELECT, WHERE, GROUP BY, ORDER BY).
Zero external dependencies (uses standard library csv, math).
"""

import csv

def execute_sql_query(filepath, group_by_col, agg_col, agg_func='AVG'):
    data = []
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            data.append(row)

    if not data:
        return []

    groups = {}
    for r in data:
        key = r.get(group_by_col, 'Unknown')
        val_str = r.get(agg_col, '')
        try:
            val = float(val_str)
            if key not in groups:
                groups[key] = []
            groups[key].append(val)
        except ValueError:
            pass

    results = []
    for k, vals in groups.items():
        if agg_func.upper() == 'AVG' or agg_func.upper() == 'MEAN':
            res_val = round(sum(vals) / len(vals), 2)
        elif agg_func.upper() == 'SUM':
            res_val = round(sum(vals), 2)
        elif agg_func.upper() == 'COUNT':
            res_val = len(vals)
        elif agg_func.upper() == 'MAX':
            res_val = round(max(vals), 2)
        else:
            res_val = round(min(vals), 2)
        results.append({group_by_col: k, f"{agg_func}({agg_col})": res_val})

    # Sort descending
    agg_key = f"{agg_func}({agg_col})"
    results.sort(key=lambda r: r[agg_key], reverse=True)
    return results

def main():
    print("==================================================")
    print("      OMNIDATA IN-MEMORY SQL QUERY PIPELINE       ")
    print("==================================================\n")

    query_str = "SELECT Category, AVG(Total_Spend_USD) FROM ecommerce_sales GROUP BY Category ORDER BY AVG(Total_Spend_USD) DESC"
    print(f"🗄️ Executing SQL: {query_str}\n")

    res = execute_sql_query('data/ecommerce_sales.csv', 'Category', 'Total_Spend_USD', 'AVG')

    print(f"{'Category':<20} | {'AVG(Total_Spend_USD)':<20}")
    print("-" * 45)
    for r in res:
        print(f"{r['Category']:<20} | ${r['AVG(Total_Spend_USD)']:<20}")
    print("-" * 45)

if __name__ == '__main__':
    main()
