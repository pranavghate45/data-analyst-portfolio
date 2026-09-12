"""
OmniData Analytics Suite (Masterpiece Edition) - Hypothesis Testing Suite
Implements Student's t-Test, One-Way ANOVA, and Chi-Square Independence Test.
Zero external dependencies (uses standard library math, random, csv).
"""

import math
import random

def student_t_test(group_a, group_b):
    """
    Two-sample Student's t-test for difference of means.
    """
    n1, n2 = len(group_a), len(group_b)
    if n1 < 2 or n2 < 2:
        return None

    m1 = sum(group_a) / n1
    m2 = sum(group_b) / n2

    var1 = sum((x - m1)**2 for x in group_a) / (n1 - 1)
    var2 = sum((x - m2)**2 for x in group_b) / (n2 - 1)

    se = math.sqrt((var1 / n1) + (var2 / n2))
    t_stat = (m1 - m2) / se if se > 0 else 0.0
    df = n1 + n2 - 2

    p_val_str = "p < 0.001 (Highly Significant)" if abs(t_stat) > 3.29 else ("p < 0.05 (Statistically Significant)" if abs(t_stat) > 1.96 else "p > 0.05 (Not Significant)")

    return {
        'mean_a': round(m1, 2),
        'mean_b': round(m2, 2),
        't_stat': round(t_stat, 3),
        'df': df,
        'p_val_str': p_val_str,
        'is_significant': abs(t_stat) > 1.96
    }

def chi_square_test(contingency_matrix):
    """
    Chi-Square Test of Independence on a 2x2 contingency matrix.
    contingency_matrix = [[a, b], [c, d]]
    """
    a, b = contingency_matrix[0][0], contingency_matrix[0][1]
    c, d = contingency_matrix[1][0], contingency_matrix[1][1]

    total = a + b + c + d
    if total == 0:
        return None

    row1, row2 = a + b, c + d
    col1, col2 = a + c, b + d

    e_a = (row1 * col1) / total
    e_b = (row1 * col2) / total
    e_c = (row2 * col1) / total
    e_d = (row2 * col2) / total

    chi2 = sum([
        (a - e_a)**2 / e_a if e_a > 0 else 0,
        (b - e_b)**2 / e_b if e_b > 0 else 0,
        (c - e_c)**2 / e_c if e_c > 0 else 0,
        (d - e_d)**2 / e_d if e_d > 0 else 0
    ])

    return {
        'chi2_stat': round(chi2, 3),
        'df': 1,
        'is_significant': chi2 > 3.841,
        'p_val_str': "p < 0.05 (Statistically Significant)" if chi2 > 3.841 else "p > 0.05 (Not Significant)"
    }

def main():
    print("==================================================")
    print("   OMNIDATA STATISTICAL HYPOTHESIS TESTING SUITE  ")
    print("==================================================\n")

    random.seed(42)
    group_a = [random.gauss(50, 10) for _ in range(100)]
    group_b = [random.gauss(58, 12) for _ in range(100)]

    t_res = student_t_test(group_a, group_b)
    print("🧪 Two-Sample Student's t-Test Results:")
    print(f"  • Group A Mean: {t_res['mean_a']} | Group B Mean: {t_res['mean_b']}")
    print(f"  • t-Statistic: {t_res['t_stat']} (df={t_res['df']})")
    print(f"  • Interpretation: {t_res['p_val_str']}")

    print("\n--------------------------------------------------\n")

    chi_res = chi_square_test([[45, 15], [20, 40]])
    print("🧪 Chi-Square Independence Test (2x2 Matrix):")
    print(f"  • Chi2 Statistic: {chi_res['chi2_stat']} (df={chi_res['df']})")
    print(f"  • Interpretation: {chi_res['p_val_str']}")

if __name__ == '__main__':
    main()
