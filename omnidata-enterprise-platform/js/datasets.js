/**
 * Multi-domain Enterprise Datasets Provider (World Edition)
 */
const SAMPLE_DATASETS = {
  ecommerce: {
    name: "🛒 E-Commerce Customer & Sales Analytics",
    description: "Multi-channel retail sales records with customer demographics, discount rates, pricing, ratings, and purchase totals.",
    target: "Total_Spend_USD",
    filepath: "data/ecommerce_sales.csv",
    generate: () => {
      const rows = [];
      const cats = ['Electronics', 'Fashion', 'Home & Kitchen', 'Beauty', 'Sports'];
      const pays = ['Credit Card', 'UPI/NetBanking', 'PayPal', 'Debit Card', 'COD'];
      const genders = ['Male', 'Female', 'Non-Binary'];
      for (let i = 0; i < 400; i++) {
        const price = Math.round((Math.exp(Math.random() * 2.5) * 15 + 15) * 100) / 100;
        const qty = Math.floor(Math.random() * 5) + 1;
        rows.push({
          Transaction_ID: `TXN-${10000 + i}`,
          Date: new Date(2025, 0, 1, 10 + Math.floor(i/10), i % 60).toISOString().replace('T', ' ').substring(0, 19),
          Customer_ID: `CUST-${Math.floor(Math.random() * 9000) + 1000}`,
          Age: Math.random() < 0.03 ? null : Math.floor(Math.random() * 52) + 18,
          Gender: genders[Math.floor(Math.random() * genders.length)],
          Category: cats[Math.floor(Math.random() * cats.length)],
          Price_USD: price,
          Quantity: qty,
          Total_Spend_USD: Math.round(price * qty * 100) / 100,
          Discount_Pct: [0, 5, 10, 15, 20][Math.floor(Math.random() * 5)],
          Payment_Method: pays[Math.floor(Math.random() * pays.length)],
          Rating: Math.random() < 0.04 ? null : Math.round((Math.min(5.0, Math.max(1.0, 4.2 + (Math.random() - 0.5) * 1.5))) * 10) / 10,
          Is_Repeat_Customer: Math.random() > 0.4 ? 1 : 0
        });
      }
      return rows;
    }
  },

  saas_churn: {
    name: "⚡ SaaS Retention & Churn Scoring",
    description: "Subscription metrics including customer tenure, monthly spend, support ticket frequency, daily app activity, and churn outcome.",
    target: "Churn",
    filepath: "data/saas_churn.csv",
    generate: () => {
      const rows = [];
      const plans = ['Basic', 'Pro', 'Enterprise'];
      const contracts = ['Month-to-Month', 'One Year', 'Two Year'];
      for (let i = 0; i < 350; i++) {
        const tenure = Math.floor(Math.random() * 48) + 1;
        const mCharge = Math.round((Math.random() * 270 + 29.99) * 100) / 100;
        const tCharge = Math.round(tenure * mCharge * (0.92 + Math.random() * 0.12) * 100) / 100;
        const tickets = Math.floor(Math.exp(Math.random() * 2.2));
        const activeHours = Math.round((Math.random() * Math.random() * 8 + 0.5) * 10) / 10;
        const contract = contracts[Math.floor(Math.random() * contracts.length)];
        const logit = -2.0 + 0.38 * tickets - 0.06 * tenure + (contract === 'Month-to-Month' ? 0.9 : 0) - 0.25 * activeHours;
        rows.push({
          User_ID: `USR-${20000 + i}`,
          Tenure_Months: tenure,
          Monthly_Charges_USD: mCharge,
          Total_Charges_USD: tCharge,
          Support_Tickets: tickets,
          Daily_Active_Hours: activeHours,
          Plan_Type: plans[Math.floor(Math.random() * plans.length)],
          Contract_Type: contract,
          Churn: Math.random() < (1.0 / (1.0 + Math.exp(-logit))) ? 1 : 0
        });
      }
      return rows;
    }
  },

  finance: {
    name: "📈 Global Financial Market Trends",
    description: "Time-series daily stock prices, market sentiment scores, RSI indicators, trading volume, and return percentages.",
    target: "Close_Price_USD",
    filepath: "data/financial_market.csv",
    generate: () => {
      const rows = [];
      let price = 150.0;
      const startDate = new Date(2024, 0, 1);
      for (let i = 0; i < 300; i++) {
        const ret = (Math.random() - 0.49) * 0.035;
        const prevPrice = price;
        price = Math.max(20.0, Math.round((price * Math.exp(ret)) * 100) / 100);
        rows.push({
          Date: new Date(startDate.getTime() + i * 86400000).toISOString().split('T')[0],
          Close_Price_USD: price,
          Daily_Volume: Math.floor(Math.random() * 4000000) + 600000,
          Market_Sentiment_Score: Math.round((Math.min(1.0, Math.max(0.0, 0.5 + (Math.random() - 0.5) * 0.5))) * 100) / 100,
          RSI_14: Math.round((Math.random() * 60 + 20) * 10) / 10,
          Daily_Return_Pct: i === 0 ? 0 : Math.round(((price - prevPrice) / prevPrice * 100) * 100) / 100
        });
      }
      return rows;
    }
  },

  healthcare: {
    name: "🩺 Healthcare Cardiac Risk Diagnostics",
    description: "Clinical diagnostic dataset mapping patient age, BMI, systolic blood pressure, cholesterol, glucose, and cardiac risk flags.",
    target: "High_Cardiac_Risk",
    filepath: "data/healthcare_patients.csv",
    generate: () => {
      const rows = [];
      for (let i = 0; i < 300; i++) {
        const age = Math.floor(Math.random() * 65) + 20;
        const bmi = Math.round((Math.min(45.0, Math.max(16.0, 26.5 + (Math.random() - 0.5) * 10))) * 10) / 10;
        const bp = Math.floor(Math.random() * 80) + 95;
        const smoker = Math.random() < 0.25 ? 'Yes' : 'No';
        const logit = -4.0 + 0.04 * age + 0.08 * bmi + 0.025 * (bp - 120) + (smoker === 'Yes' ? 1.2 : 0);
        rows.push({
          Patient_ID: `PAT-${30000 + i}`,
          Age: age,
          BMI: bmi,
          Systolic_BP: bp,
          Cholesterol: Math.floor(Math.random() * 160) + 150,
          Glucose: Math.floor(Math.random() * 150) + 70,
          Exercise_Hours_Week: Math.floor(Math.random() * 12),
          Smoker: smoker,
          High_Cardiac_Risk: Math.random() < (1.0 / (1.0 + Math.exp(-logit))) ? 1 : 0
        });
      }
      return rows;
    }
  },

  hr_attrition: {
    name: "👥 HR Analytics & Employee Attrition",
    description: "Workforce demographic, salary scale, tenure, overtime, work-life balance scores, and attrition rates.",
    target: "Attrition",
    filepath: "data/hr_attrition.csv",
    generate: () => {
      const rows = [];
      const depts = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance'];
      const roles = ['Developer', 'Manager', 'Analyst', 'Specialist'];
      const edus = ['Bachelors', 'Masters', 'PhD', 'High School'];
      for (let i = 0; i < 300; i++) {
        const age = Math.floor(Math.random() * 40) + 22;
        const yrs = Math.floor(Math.random() * 15) + 1;
        const sat = Math.floor(Math.random() * 5) + 1;
        const ot = Math.random() < 0.3 ? 'Yes' : 'No';
        const logit = -1.8 - 0.08 * yrs - 0.3 * sat + (ot === 'Yes' ? 1.1 : 0);
        rows.push({
          Employee_ID: `EMP-${40000 + i}`,
          Age: age,
          Department: depts[Math.floor(Math.random() * depts.length)],
          Job_Role: roles[Math.floor(Math.random() * roles.length)],
          Education_Level: edus[Math.floor(Math.random() * edus.length)],
          Monthly_Salary_USD: Math.round((3500 + yrs * 750 + Math.random() * 3000) * 100) / 100,
          Years_At_Company: yrs,
          Work_Life_Balance_Score: Math.floor(Math.random() * 4) + 1,
          Job_Satisfaction_1to5: sat,
          OverTime: ot,
          Attrition: Math.random() < (1.0 / (1.0 + Math.exp(-logit))) ? 1 : 0
        });
      }
      return rows;
    }
  },

  marketing: {
    name: "🎯 Digital Marketing & A/B Campaign Testing",
    description: "Performance metrics across ad channels, copy variants, impressions, clicks, conversions, spend, and ROAS.",
    target: "ROAS",
    filepath: "data/marketing_campaigns.csv",
    generate: () => {
      const rows = [];
      const chans = ['Google Ads', 'Meta Ads', 'LinkedIn', 'Email Marketing'];
      const vars = ['Variant A (Control)', 'Variant B (New Copy)', 'Variant C (Video Ad)'];
      for (let i = 0; i < 300; i++) {
        const imp = Math.floor(Math.random() * 200000) + 10000;
        const ctr = Math.round((Math.random() * 5 + 1.2) * 10) / 10;
        const clicks = Math.floor(imp * (ctr / 100));
        const cvr = Math.round((Math.random() * 8 + 2) * 10) / 10;
        const conv = Math.floor(clicks * (cvr / 100));
        const spend = Math.round((Math.random() * 5000 + 300) * 100) / 100;
        const rev = Math.round((conv * (Math.random() * 100 + 50)) * 100) / 100;
        rows.push({
          Campaign_ID: `CMP-${50000 + i}`,
          Channel: chans[Math.floor(Math.random() * chans.length)],
          Variant: vars[Math.floor(Math.random() * vars.length)],
          Impressions: imp,
          Clicks: clicks,
          CTR_Pct: ctr,
          Conversions: conv,
          Conversion_Rate_Pct: cvr,
          Ad_Spend_USD: spend,
          Revenue_Generated_USD: rev,
          ROAS: spend > 0 ? Math.round((rev / spend) * 100) / 100 : 0
        });
      }
      return rows;
    }
  },

  supply_chain: {
    name: "🚚 Supply Chain Logistics & Inventory",
    description: "Global delivery tracking with carriers, warehouse origins, shipping weights, actual vs estimated delivery days, and delay metrics.",
    target: "On_Time_Delivery",
    filepath: "data/supply_chain.csv",
    generate: () => {
      const rows = [];
      const regs = ['North America', 'Europe', 'Asia Pacific', 'Latin America'];
      const carrs = ['DHL Express', 'FedEx', 'UPS Global', 'Regional Post'];
      const whs = ['WH-East', 'WH-West', 'WH-Central', 'WH-South'];
      for (let i = 0; i < 300; i++) {
        const wt = Math.round((Math.random() * 40 + 0.5) * 10) / 10;
        const cost = Math.round((wt * 5.2 + 15) * 100) / 100;
        const est = Math.floor(Math.random() * 8) + 2;
        const delay = Math.random() < 0.3 ? Math.floor(Math.random() * 4) + 1 : 0;
        rows.push({
          Shipment_ID: `SHP-${60000 + i}`,
          Region: regs[Math.floor(Math.random() * regs.length)],
          Carrier: carrs[Math.floor(Math.random() * carrs.length)],
          Warehouse: whs[Math.floor(Math.random() * whs.length)],
          Package_Weight_KG: wt,
          Shipping_Cost_USD: cost,
          Estimated_Days: est,
          Actual_Days: est + delay,
          Delay_Days: delay,
          On_Time_Delivery: delay === 0 ? 1 : 0
        });
      }
      return rows;
    }
  },

  customer_reviews: {
    name: "💬 Customer Support NLP Reviews & Sentiment",
    description: "Customer feedback text, tokenized word counts, sentiment polarity ratings (Positive, Neutral, Negative), and rating scale.",
    target: "Rating_1to5",
    filepath: "data/customer_reviews.csv",
    generate: () => {
      const rows = [];
      const templates = [
        ["The product quality is absolutely outstanding! Extremely satisfied with fast delivery.", 5, "Positive"],
        ["Terrible experience. The package arrived damaged and customer service was unresponsive.", 1, "Negative"],
        ["Decent overall. Works as advertised, nothing extraordinary but fine.", 3, "Neutral"],
        ["Loved the seamless interface and intuitive dashboard! Highly recommended.", 5, "Positive"],
        ["Extremely disappointed. Software crashes repeatedly and features are broken.", 1, "Negative"]
      ];
      for (let i = 0; i < 300; i++) {
        const t = templates[i % templates.length];
        rows.push({
          Review_ID: `REV-${70000 + i}`,
          Customer_Name: `User_${100 + (i % 50)}`,
          Review_Text: t[0],
          Rating_1to5: t[1],
          Sentiment: t[2]
        });
      }
      return rows;
    }
  }
};
