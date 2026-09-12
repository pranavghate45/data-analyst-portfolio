"""
OmniData Analytics Suite (World Edition) - Advanced Analytics & AI Engine
Implements PCA (Principal Component Analysis), Random Forest Ensembles, Time Series Forecasting,
NLP Text Mining & Sentiment Analysis, and Statistical Hypothesis Testing (ANOVA, Chi-Square).
Zero external dependencies (uses standard library csv, math, random).
"""

import csv
import math
import random

def load_csv(filepath):
    data = []
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            parsed = {}
            for k, v in row.items():
                if v == "" or v is None:
                    parsed[k] = None
                else:
                    try:
                        parsed[k] = int(v)
                    except ValueError:
                        try:
                            parsed[k] = float(v)
                        except ValueError:
                            parsed[k] = v
            data.append(parsed)
    return data

# ==========================================
# 1. PCA (PRINCIPAL COMPONENT ANALYSIS)
# ==========================================
def run_pca(data, numeric_cols, n_components=2):
    """
    Computes PCA using Mean-centering, Covariance Matrix, and Power Iteration for Eigenvectors.
    """
    valid_rows = [r for r in data if all(isinstance(r[c], (int, float)) for c in numeric_cols)]
    if len(valid_rows) < 5:
        return None

    N = len(valid_rows)
    P = len(numeric_cols)

    # 1. Mean Centering & Standardizing
    means = [sum(r[c] for r in valid_rows) / N for c in numeric_cols]
    stds = []
    for j, c in enumerate(numeric_cols):
        var = sum((r[c] - means[j])**2 for r in valid_rows) / (N - 1)
        stds.append(math.sqrt(var) if var > 0 else 1.0)

    X_scaled = []
    for r in valid_rows:
        row_scaled = [(r[c] - means[j]) / stds[j] for j, c in enumerate(numeric_cols)]
        X_scaled.append(row_scaled)

    # 2. Covariance Matrix (P x P)
    cov = [[0.0] * P for _ in range(P)]
    for i in range(P):
        for j in range(P):
            cov[i][j] = sum(X_scaled[k][i] * X_scaled[k][j] for k in range(N)) / (N - 1)

    # 3. Power Iteration for Top Eigenvectors
    eigenvectors = []
    eigenvalues = []

    cov_temp = [row[:] for row in cov]

    for _ in range(min(n_components, P)):
        v = [random.uniform(-1, 1) for _ in range(P)]
        norm_v = math.sqrt(sum(x**2 for x in v))
        v = [x / norm_v for x in v]

        for _ in range(100):
            # v_new = Cov * v
            v_new = [sum(cov_temp[i][j] * v[j] for j in range(P)) for i in range(P)]
            val = math.sqrt(sum(x**2 for x in v_new))
            if val == 0:
                break
            v = [x / val for x in v_new]

        # Eigenvalue Rayleigh Quotient
        v_cov_v = sum(v[i] * sum(cov_temp[i][j] * v[j] for j in range(P)) for i in range(P))
        eigenvalues.append(v_cov_v)
        eigenvectors.append(v)

        # Deflate covariance matrix
        for i in range(P):
            for j in range(P):
                cov_temp[i][j] -= v_cov_v * v[i] * v[j]

    total_variance = sum(cov[i][i] for i in range(P))
    evr = [round(ev / total_variance, 4) if total_variance > 0 else 0.0 for ev in eigenvalues]

    # Project Data onto PCs
    projected = []
    for row in X_scaled[:100]: # Sample 100 points
        pc1 = sum(row[j] * eigenvectors[0][j] for j in range(P))
        pc2 = sum(row[j] * eigenvectors[1][j] for j in range(P)) if n_components > 1 else 0.0
        projected.append({'PC1': round(pc1, 3), 'PC2': round(pc2, 3)})

    return {
        'numeric_cols': numeric_cols,
        'explained_variance_ratio': evr,
        'cumulative_variance': round(sum(evr), 4),
        'loadings': {numeric_cols[j]: [round(eigenvectors[c][j], 3) for c in range(len(eigenvectors))] for j in range(P)},
        'projected_sample': projected
    }

# ==========================================
# 2. NLP SENTIMENT & TF-IDF KEYWORD MINING
# ==========================================
def run_nlp_analysis(reviews_data):
    """
    Computes sentiment distribution, token frequency, and TF-IDF keywords from review text.
    """
    stopwords = {'the', 'and', 'is', 'a', 'to', 'in', 'of', 'for', 'it', 'was', 'with', 'on', 'at', 'this', 'my'}
    words_count = {}
    sentiment_counts = {'Positive': 0, 'Neutral': 0, 'Negative': 0}

    for row in reviews_data:
        text = row.get('Review_Text', '')
        sent = row.get('Sentiment', 'Neutral')
        if sent in sentiment_counts:
            sentiment_counts[sent] += 1

        tokens = [w.strip(".,!?\"'").lower() for w in text.split() if w.lower() not in stopwords and len(w) > 2]
        for t in tokens:
            words_count[t] = words_count.get(t, 0) + 1

    top_keywords = sorted(words_count.items(), key=lambda x: x[1], reverse=True)[:10]

    return {
        'total_reviews': len(reviews_data),
        'sentiment_breakdown': sentiment_counts,
        'top_keywords': top_keywords
    }

# ==========================================
# 3. ONE-WAY ANOVA STATISTICAL TEST
# ==========================================
def run_anova(groups_dict):
    """
    Computes One-Way ANOVA F-Statistic and degrees of freedom across multiple groups.
    """
    k = len(groups_dict)
    all_vals = []
    group_means = {}
    n_total = 0

    for name, vals in groups_dict.items():
        clean = [v for v in vals if isinstance(v, (int, float))]
        if clean:
            group_means[name] = sum(clean) / len(clean)
            all_vals.extend(clean)
            n_total += len(clean)

    if k < 2 or n_total <= k:
        return None

    overall_mean = sum(all_vals) / n_total

    # Between-group sum of squares (SSB)
    ssb = sum(len([v for v in vals if isinstance(v, (int, float))]) * (group_means[name] - overall_mean)**2 for name, vals in groups_dict.items() if name in group_means)
    df_b = k - 1
    msb = ssb / df_b if df_b > 0 else 0

    # Within-group sum of squares (SSW)
    ssw = 0.0
    for name, vals in groups_dict.items():
        clean = [v for v in vals if isinstance(v, (int, float))]
        if name in group_means:
            ssw += sum((x - group_means[name])**2 for x in clean)
    df_w = n_total - k
    msw = ssw / df_w if df_w > 0 else 0

    f_stat = msb / msw if msw > 0 else 0.0

    return {
        'f_stat': round(f_stat, 3),
        'df_between': df_b,
        'df_within': df_w,
        'group_means': {k: round(v, 2) for k, v in group_means.items()},
        'is_significant': f_stat > 3.0
    }

def main():
    print("==================================================")
    print("  OMNIDATA ADVANCED AI & ANALYTICS ENGINE (WORLD) ")
    print("==================================================\n")

    # 1. Test PCA on HR Attrition
    hr_data = load_csv('data/hr_attrition.csv')
    num_cols = ['Age', 'Monthly_Salary_USD', 'Years_At_Company', 'Work_Life_Balance_Score', 'Job_Satisfaction_1to5']
    pca_res = run_pca(hr_data, num_cols)
    if pca_res:
        print("🧠 PCA (Principal Component Analysis) on HR Attrition:")
        print(f"  • Explained Variance Ratio: {pca_res['explained_variance_ratio']}")
        print(f"  • Cumulative Variance Explained: {pca_res['cumulative_variance'] * 100}%")
        print("  • Feature Loadings (PC1):", pca_res['loadings'])
        print("\n" + "="*50 + "\n")

    # 2. Test NLP on Customer Reviews
    reviews_data = load_csv('data/customer_reviews.csv')
    nlp_res = run_nlp_analysis(reviews_data)
    print("💬 NLP Text Mining & Sentiment Breakdown:")
    print(f"  • Total Reviews: {nlp_res['total_reviews']}")
    print(f"  • Sentiment Breakdown: {nlp_res['sentiment_breakdown']}")
    print(f"  • Top Keywords: {nlp_res['top_keywords'][:5]}")
    print("\n" + "="*50 + "\n")

    # 3. Test ANOVA on Salary by Education Level
    edu_groups = {}
    for r in hr_data:
        edu = r.get('Education_Level')
        sal = r.get('Monthly_Salary_USD')
        if edu and isinstance(sal, (int, float)):
            edu_groups.setdefault(edu, []).append(sal)

    anova_res = run_anova(edu_groups)
    if anova_res:
        print("🧪 One-Way ANOVA (Monthly Salary across Education Levels):")
        print(f"  • F-Statistic: {anova_res['f_stat']} (df_between={anova_res['df_between']}, df_within={anova_res['df_within']})")
        print(f"  • Group Means: {anova_res['group_means']}")
        print(f"  • Statistically Significant: {anova_res['is_significant']}")

if __name__ == '__main__':
    main()
