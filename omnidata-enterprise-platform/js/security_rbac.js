/**
 * Data Security, PII Data Masking & Role-Based Access Control (RBAC) Engine
 * Dynamically masks sensitive PII fields (email, phone, credit card)
 * and enforces RBAC permission views (Executive, Analyst, Viewer, Admin).
 */

class SecurityRBACEngineJS {
  static currentRole = 'Admin'; // Default: Admin

  static setRole(role) {
    this.currentRole = role;
  }

  static getRole() {
    return this.currentRole;
  }

  /**
   * Mask PII fields in a dataset copy
   */
  static applyPIIMasking(data) {
    if (!data || data.length === 0) return [];

    return data.map(row => {
      const copy = { ...row };
      Object.keys(copy).forEach(col => {
        const val = copy[col];
        if (typeof val === 'string') {
          // Email masking e.g. john.doe@gmail.com -> j***e@gmail.com
          if (col.toLowerCase().includes('email') || val.includes('@')) {
            const parts = val.split('@');
            if (parts.length === 2) {
              const name = parts[0];
              const maskedName = name.length > 2 ? name[0] + '***' + name[name.length - 1] : name[0] + '***';
              copy[col] = `${maskedName}@${parts[1]}`;
            }
          }
          // Phone masking e.g. +1 555-123-4567 -> +1 ***-***-4567
          else if (col.toLowerCase().includes('phone')) {
            copy[col] = val.replace(/\d(?=\d{4})/g, '*');
          }
          // Credit card / SSN masking
          else if (col.toLowerCase().includes('card') || col.toLowerCase().includes('ssn')) {
            copy[col] = '****-****-****-' + val.slice(-4);
          }
        }

        // RBAC Masking for Viewer / Analyst roles (Redact high-level salary / price for restricted roles if needed)
        if (this.currentRole === 'Viewer') {
          if (col.toLowerCase().includes('salary') || col.toLowerCase().includes('revenue') || col.toLowerCase().includes('profit')) {
            copy[col] = '🔒 [REDACTED BY RBAC]';
          }
        }
      });
      return copy;
    });
  }

  /**
   * Check if metric is visible for current role
   */
  static isMetricVisible(metricKey) {
    if (this.currentRole === 'Admin' || this.currentRole === 'Executive') return true;
    if (this.currentRole === 'Analyst') return !metricKey.toLowerCase().includes('profit');
    if (this.currentRole === 'Viewer') return !metricKey.toLowerCase().includes('salary') && !metricKey.toLowerCase().includes('profit') && !metricKey.toLowerCase().includes('revenue');
    return true;
  }
}
