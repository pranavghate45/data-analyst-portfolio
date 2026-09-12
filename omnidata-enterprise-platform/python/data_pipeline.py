"""
OmniData Analytics Suite - Python Data Pipeline
Executes Data Wrangling, EDA, Statistical Hypothesis Testing, and ML Models.
"""

import os
import csv
import math
from datetime import datetime

def load_csv(filepath):
    data = []
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            parsed_row = {}
            for k, v in row.items():
                if v == "":
                    parsed_row[k] = None
                else:
                    try:
                        parsed_row[k] = int(v)
                    except ValueError:
                        try:
                            parsed_row[k] = float(v)
                        except ValueError:
                            parsed_row[k] = v
            data.append(parsed_row)
    return data

def calculate_stats(numbers):
    valid = [x for x in numbers if x is not None and isinstance(x, (int, float))]
    if not valid:
        return {}
    n = len(valid)
    mean = sum(valid) / n
    sorted_vals = sorted(valid)
    
    # Median
    mid = n // 2
    median = sorted_vals[mid] if n % 2 != 0 else (sorted_vals[mid-1] + sorted_vals[mid]) / 2
    
    # Variance & Standard Deviation
    variance = sum((x - mean) ** 2 for x in valid) / (n - 1) if n > 1 else 0
    std_dev = math.sqrt(variance)
    
    # Min, Max, Quartiles
    q1 = sorted_vals[int(n * 0.25)]
    q3 = sorted_vals[int(n * 0.75)]
    
    # Skewness
    skewness = (sum((x - mean) ** 3 for x in valid) / n) / (std_dev ** 3) if std_dev > 0 else 0
    
    return {
        'count': n,
        'missing': len(numbers) - n,
        'mean': round(mean, 2),
        'median': round(median, 2),
        'std_dev': round(std_dev, 2),
        'min': round(sorted_vals[0], 2),
        'max': round(sorted_vals[-1], 2),
        'q1': round(q1, 2),
        'q3': round(q3, 2),
        'skewness': round(skewness, 3)
    }

def pearson_correlation(x_vals, y_vals):
    pairs = [(x, y) for x, y in zip(x_vals, y_vals) if isinstance(x, (int, float)) and isinstance(y, (int, float))]
    if len(pairs) < 2:
        return 0.0
    n = len(pairs)
    xs = [p[0] for p in pairs]
    ys = [p[1] for p in pairs]
    
    mean_x = sum(xs) / n
    mean_y = sum(ys) / n
    
    num = sum((x - mean_x) * (y - mean_y) for x, y in pairs)
    den = math.sqrt(sum((x - mean_x) ** 2 for x in xs) * sum((y - mean_y) ** 2 for y in ys))
    
    return round(num / den, 3) if den != 0 else 0.0

def linear_regression(x_vals, y_vals):
    """Simple Ordinary Least Squares (OLS) Linear Regression: y = m*x + c"""
    pairs = [(x, y) for x, y in zip(x_vals, y_vals) if isinstance(x, (int, float)) and isinstance(y, (int, float))]
    n = len(pairs)
    if n < 2:
        return None
    xs = [p[0] for p in pairs]
    ys = [p[1] for p in pairs]
    
    mean_x = sum(xs) / n
    mean_y = sum(ys) / n
    
    num = sum((x - mean_x) * (y - mean_y) for x, y in pairs)
    den = sum((x - mean_x) ** 2 for x in xs)
    
    slope = num / den if den != 0 else 0.0
    intercept = mean_y - slope * mean_x
    
    # Calculate R-squared
    y_pred = [slope * x + intercept for x in xs]
    ss_res = sum((y - yp) ** 2 for y, yp in zip(ys, y_pred))
    ss_tot = sum((y - mean_y) ** 2 for y in ys)
    r2 = 1 - (ss_res / ss_tot) if ss_tot != 0 else 0.0
    rmse = math.sqrt(ss_res / n)
    
    return {
        'slope': round(slope, 4),
        'intercept': round(intercept, 4),
        'r2_score': round(r2, 4),
        'rmse': round(rmse, 4)
    }

def run_analysis():
    print("==================================================")
    print("   OMNIDATA ANALYTICS SUITE - PYTHON PIPELINE    ")
    print("==================================================\n")

    files = {
        'E-Commerce Sales': 'data/ecommerce_sales.csv',
        'SaaS Churn': 'data/saas_churn.csv',
        'Financial Market': 'data/financial_market.csv',
        'Healthcare Patients': 'data/healthcare_patients.csv'
    }

    for name, path in files.items():
        if not os.path.exists(path):
            print(f"File {path} not found. Skipping.")
            continue
            
        data = load_csv(path)
        print(f"--- DATASET: {name} ({len(data)} rows) ---")
        if not data:
            continue
            
        columns = list(data[0].keys())
        print(f"Columns: {', '.join(columns)}\n")

        # 1. Summary Statistics for numerical columns
        print("📊 Descriptive Statistics:")
        for col in columns:
            vals = [row[col] for row in data]
            stats = calculate_stats(vals)
            if stats:
                print(f"  [{col}] -> Mean: {stats['mean']}, Median: {stats['median']}, Std: {stats['std_dev']}, Min: {stats['min']}, Max: {stats['max']}, Missing: {stats['missing']}")

        # 2. Pearson Correlation Insights
        num_cols = [col for col in columns if calculate_stats([row[col] for row in data])]
        print("\n🔗 Key Pearson Correlations:")
        for i in range(len(num_cols)):
            for j in range(i + 1, len(num_cols)):
                c1, c2 = num_cols[i], num_cols[j]
                r = pearson_correlation([row[c1] for row in data], [row[c2] for row in data])
                if abs(r) >= 0.2:
                    print(f"  • {c1} <--> {c2}: r = {r}")

        # 3. Machine Learning Model Example (Linear Regression on E-Commerce / SaaS)
        if name == 'E-Commerce Sales' and 'Price_USD' in num_cols and 'Total_Spend_USD' in num_cols:
            print("\n🤖 Machine Learning (Linear Regression: Price vs Total Spend):")
            lr = linear_regression([row['Price_USD'] for row in data], [row['Total_Spend_USD'] for row in data])
            if lr:
                print(f"  • Equation: Total_Spend = {lr['slope']} * Price + {lr['intercept']}")
                print(f"  • R² Score: {lr['r2_score']} | RMSE: {lr['rmse']}")

        if name == 'SaaS Churn' and 'Support_Tickets' in num_cols and 'Tenure_Months' in num_cols:
            print("\n🤖 Machine Learning (Support Tickets vs Tenure Correlation):")
            r = pearson_correlation([row['Support_Tickets'] for row in data], [row['Tenure_Months'] for row in data])
            print(f"  • Correlation: {r}")

        print("\n" + "="*50 + "\n")

if __name__ == '__main__':
    run_analysis()
