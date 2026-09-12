"""
Sample Data Generator for OmniData Analytics Suite (World Edition)
Generates 8 realistic multi-attribute enterprise datasets for Data Analysis, EDA, ML, PCA, NLP, and Time Series.
Zero external dependencies (uses standard library csv, random, math, datetime).
"""

import os
import csv
import random
import math
from datetime import datetime, timedelta

def generate_datasets():
    os.makedirs('data', exist_ok=True)
    random.seed(42)

    # 1. E-Commerce Sales (1500 rows)
    n_ecommerce = 1500
    start_date = datetime(2025, 1, 1, 10, 0, 0)
    genders = ['Male', 'Female', 'Non-Binary']
    categories = ['Electronics', 'Fashion', 'Home & Kitchen', 'Beauty', 'Sports']
    payments = ['Credit Card', 'UPI/NetBanking', 'PayPal', 'Debit Card', 'COD']
    discounts = [0, 5, 10, 15, 20, 25]

    with open('data/ecommerce_sales.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow([
            'Transaction_ID', 'Date', 'Customer_ID', 'Age', 'Gender',
            'Category', 'Price_USD', 'Quantity', 'Total_Spend_USD',
            'Discount_Pct', 'Payment_Method', 'Rating', 'Is_Repeat_Customer'
        ])
        for i in range(n_ecommerce):
            txn_id = f"TXN-{10000 + i}"
            dt = (start_date + timedelta(hours=i)).strftime('%Y-%m-%d %H:%M:%S')
            cust_id = f"CUST-{random.randint(1000, 9999)}"
            age = "" if random.random() < 0.02 else random.randint(18, 70)
            gender = random.choices(genders, weights=[0.48, 0.48, 0.04])[0]
            cat = random.choices(categories, weights=[0.3, 0.25, 0.2, 0.15, 0.1])[0]
            price = round(random.expovariate(1/85.0) + 15.0, 2)
            qty = random.randint(1, 5)
            total = round(price * qty, 2)
            disc = random.choices(discounts, weights=[0.3, 0.2, 0.2, 0.15, 0.1, 0.05])[0]
            pay = random.choices(payments, weights=[0.35, 0.3, 0.15, 0.1, 0.1])[0]
            rating = "" if random.random() < 0.03 else round(min(5.0, max(1.0, random.gauss(4.2, 0.7))), 1)
            repeat = random.choices([0, 1], weights=[0.4, 0.6])[0]
            writer.writerow([txn_id, dt, cust_id, age, gender, cat, price, qty, total, disc, pay, rating, repeat])
    print("✓ Saved data/ecommerce_sales.csv (1,500 rows)")

    # 2. SaaS User Churn (1200 rows)
    n_saas = 1200
    plans = ['Basic', 'Pro', 'Enterprise']
    contracts = ['Month-to-Month', 'One Year', 'Two Year']

    with open('data/saas_churn.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow([
            'User_ID', 'Tenure_Months', 'Monthly_Charges_USD', 'Total_Charges_USD',
            'Support_Tickets', 'Daily_Active_Hours', 'Plan_Type', 'Contract_Type', 'Churn'
        ])
        for i in range(n_saas):
            uid = f"USR-{20000 + i}"
            tenure = random.randint(1, 48)
            m_charge = round(random.uniform(29.99, 299.99), 2)
            t_charge = round(tenure * m_charge * random.uniform(0.92, 1.04), 2)
            tickets = round(random.expovariate(1/2.5))
            active_hrs = round(random.gammavariate(2.0, 1.2), 1)
            plan = random.choices(plans, weights=[0.5, 0.35, 0.15])[0]
            contract = random.choices(contracts, weights=[0.6, 0.25, 0.15])[0]
            logit = -2.0 + 0.35 * tickets - 0.05 * tenure + (0.8 if contract == 'Month-to-Month' else 0.0) - 0.2 * active_hrs
            prob = 1.0 / (1.0 + math.exp(-logit))
            churn = 1 if random.random() < prob else 0
            writer.writerow([uid, tenure, m_charge, t_charge, tickets, active_hrs, plan, contract, churn])
    print("✓ Saved data/saas_churn.csv (1,200 rows)")

    # 3. Global Financial Market (1000 rows time series)
    n_fin = 1000
    fin_date = datetime(2023, 1, 1)
    close_price = 150.0

    with open('data/financial_market.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['Date', 'Close_Price_USD', 'Daily_Volume', 'Market_Sentiment_Score', 'RSI_14', 'Daily_Return_Pct'])
        curr_date = fin_date
        for i in range(n_fin):
            while curr_date.weekday() >= 5:
                curr_date += timedelta(days=1)
            ret = random.gauss(0.0005, 0.018)
            prev_price = close_price
            close_price = round(close_price * math.exp(ret), 2)
            ret_pct = 0.0 if i == 0 else round(((close_price - prev_price) / prev_price) * 100, 2)
            vol = random.randint(500000, 5000000)
            sentiment = round(min(1.0, max(0.0, random.gauss(0.5, 0.25))), 2)
            rsi = round(random.uniform(20.0, 80.0), 1)
            writer.writerow([curr_date.strftime('%Y-%m-%d'), close_price, vol, sentiment, rsi, ret_pct])
            curr_date += timedelta(days=1)
    print("✓ Saved data/financial_market.csv (1,000 rows)")

    # 4. Healthcare Patients (1000 rows)
    n_health = 1000
    with open('data/healthcare_patients.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow([
            'Patient_ID', 'Age', 'BMI', 'Systolic_BP', 'Cholesterol',
            'Glucose', 'Exercise_Hours_Week', 'Smoker', 'High_Cardiac_Risk'
        ])
        for i in range(n_health):
            pid = f"PAT-{30000 + i}"
            age = random.randint(20, 85)
            bmi = round(min(45.0, max(16.0, random.gauss(26.5, 4.5))), 1)
            bp = random.randint(95, 175)
            chol = random.randint(150, 310)
            glu = random.randint(70, 220)
            ex = random.randint(0, 12)
            smoker = 'Yes' if random.random() < 0.25 else 'No'
            logit = -4.0 + 0.04 * age + 0.08 * bmi + 0.025 * (bp - 120) + (1.2 if smoker == 'Yes' else 0.0) - 0.15 * ex
            risk_prob = 1.0 / (1.0 + math.exp(-logit))
            high_risk = 1 if random.random() < risk_prob else 0
            writer.writerow([pid, age, bmi, bp, chol, glu, ex, smoker, high_risk])
    print("✓ Saved data/healthcare_patients.csv (1,000 rows)")

    # 5. HR Employee Attrition & Analytics (1200 rows) [NEW]
    n_hr = 1200
    departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations']
    job_roles = ['Developer', 'Manager', 'Analyst', 'Specialist', 'Executive', 'Director']
    education_levels = ['Bachelors', 'Masters', 'PhD', 'High School']

    with open('data/hr_attrition.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow([
            'Employee_ID', 'Age', 'Department', 'Job_Role', 'Education_Level',
            'Monthly_Salary_USD', 'Years_At_Company', 'Work_Life_Balance_Score',
            'Job_Satisfaction_1to5', 'Performance_Rating_1to5', 'OverTime', 'Attrition'
        ])
        for i in range(n_hr):
            emp_id = f"EMP-{40000 + i}"
            age = random.randint(22, 62)
            dept = random.choices(departments, weights=[0.35, 0.25, 0.15, 0.1, 0.1, 0.05])[0]
            role = random.choice(job_roles)
            edu = random.choice(education_levels)
            yrs = random.randint(1, min(25, max(1, age - 20)))
            salary = round(3500 + yrs * 800 + random.gauss(3000, 1500), 2)
            wlb = random.randint(1, 4)
            satisfaction = random.randint(1, 5)
            perf = random.randint(2, 5)
            overtime = 'Yes' if random.random() < 0.3 else 'No'
            
            logit = -1.8 - 0.08 * yrs - 0.3 * satisfaction + (1.1 if overtime == 'Yes' else 0.0) - 0.2 * wlb
            attrition = 1 if random.random() < (1.0 / (1.0 + math.exp(-logit))) else 0
            writer.writerow([emp_id, age, dept, role, edu, salary, yrs, wlb, satisfaction, perf, overtime, attrition])
    print("✓ Saved data/hr_attrition.csv (1,200 rows)")

    # 6. Digital Marketing Campaigns & A/B Testing (1000 rows) [NEW]
    n_mkt = 1000
    channels = ['Google Ads', 'Meta Ads', 'LinkedIn', 'Email Marketing', 'SEO Organic']
    variants = ['Variant A (Control)', 'Variant B (New Copy)', 'Variant C (Video Ad)']

    with open('data/marketing_campaigns.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow([
            'Campaign_ID', 'Channel', 'Variant', 'Impressions', 'Clicks',
            'CTR_Pct', 'Conversions', 'Conversion_Rate_Pct', 'Ad_Spend_USD', 'Revenue_Generated_USD', 'ROAS'
        ])
        for i in range(n_mkt):
            cmp_id = f"CMP-{50000 + i}"
            chan = random.choice(channels)
            var = random.choice(variants)
            imp = random.randint(10000, 250000)
            ctr = round(random.uniform(1.2, 6.8), 2)
            clicks = int(imp * (ctr / 100))
            cvr = round(random.uniform(2.0, 12.5) * (1.25 if var == 'Variant B (New Copy)' else 1.0), 2)
            conv = int(clicks * (cvr / 100))
            spend = round(random.uniform(300, 8000), 2)
            aov = round(random.uniform(45, 220), 2)
            rev = round(conv * aov, 2)
            roas = round(rev / spend, 2) if spend > 0 else 0.0
            writer.writerow([cmp_id, chan, var, imp, clicks, ctr, conv, cvr, spend, rev, roas])
    print("✓ Saved data/marketing_campaigns.csv (1,000 rows)")

    # 7. Supply Chain & Delivery Logistics (1200 rows) [NEW]
    n_sc = 1200
    regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America']
    carriers = ['DHL Express', 'FedEx', 'UPS Global', 'Regional Post']
    warehouses = ['WH-East', 'WH-West', 'WH-Central', 'WH-South']

    with open('data/supply_chain.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow([
            'Shipment_ID', 'Region', 'Carrier', 'Warehouse', 'Package_Weight_KG',
            'Shipping_Cost_USD', 'Estimated_Days', 'Actual_Days', 'Delay_Days', 'On_Time_Delivery'
        ])
        for i in range(n_sc):
            shp_id = f"SHP-{60000 + i}"
            reg = random.choice(regions)
            carr = random.choice(carriers)
            wh = random.choice(warehouses)
            wt = round(random.uniform(0.5, 45.0), 1)
            cost = round(wt * random.uniform(3.5, 8.2) + 12.0, 2)
            est_days = random.randint(2, 10)
            delay = round(random.expovariate(1/1.2)) if random.random() < 0.35 else 0
            act_days = est_days + delay
            on_time = 1 if delay == 0 else 0
            writer.writerow([shp_id, reg, carr, wh, wt, cost, est_days, act_days, delay, on_time])
    print("✓ Saved data/supply_chain.csv (1,200 rows)")

    # 8. Customer Support NLP Reviews & Sentiment (1000 rows) [NEW]
    n_nlp = 1000
    review_templates = [
        ("The product quality is absolutely outstanding! Extremely satisfied with fast delivery and great support.", "Positive"),
        ("Terrible experience. The package arrived damaged and customer service was unresponsive and rude.", "Negative"),
        ("Decent overall. Works as advertised, nothing extraordinary but gets the job done fine.", "Neutral"),
        ("Loved the seamless interface and intuitive dashboard! Highly recommended to everyone.", "Positive"),
        ("Extremely disappointed. Software crashes repeatedly and features are missing or broken.", "Negative"),
        ("Average product. Price is a bit high for what it offers, but build quality is okay.", "Neutral"),
        ("Fantastic customer service! Solved my issue within 5 minutes with total professionalism.", "Positive"),
        ("Worst purchase ever. Complete waste of money and horrible return policy.", "Negative"),
        ("Good value for money. Easy setup and responsive customer assistance.", "Positive")
    ]

    with open('data/customer_reviews.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['Review_ID', 'Customer_Name', 'Product_Category', 'Review_Text', 'Rating_1to5', 'Sentiment'])
        for i in range(n_nlp):
            rev_id = f"REV-{70000 + i}"
            cust = f"User_{random.randint(100, 999)}"
            cat = random.choice(categories)
            text, sentiment = random.choice(review_templates)
            rating = 5 if sentiment == "Positive" else (1 if sentiment == "Negative" else 3)
            writer.writerow([rev_id, cust, cat, text, rating, sentiment])
    print("✓ Saved data/customer_reviews.csv (1,000 rows)")

if __name__ == '__main__':
    generate_datasets()
