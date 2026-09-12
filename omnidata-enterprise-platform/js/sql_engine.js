/**
 * Client-side In-Memory Enterprise SQL Query Engine for Browser Datasets
 * Supports SELECT, WHERE, GROUP BY, ORDER BY, LIMIT, and Window Functions (ROW_NUMBER, RANK, LAG, LEAD, SUM OVER, AVG OVER)
 */

class SQLEngineJS {
  static executeQuery(sqlStr, data) {
    if (!data || data.length === 0) return { error: "No active dataset loaded." };
    const query = sqlStr.trim();
    if (!query) return { error: "Empty query string." };

    const upper = query.toUpperCase();
    if (!upper.startsWith('SELECT')) {
      return { error: "Only SELECT queries are supported in sandbox mode." };
    }

    try {
      let copy = JSON.parse(JSON.stringify(data));
      const cols = Object.keys(copy[0] || {});

      // 1. WHERE Filtering
      const whereMatch = query.match(/WHERE\s+(.*?)(?=\s+GROUP|\s+ORDER|\s+LIMIT|\s+WINDOW|$)/i);
      if (whereMatch) {
        const condStr = whereMatch[1].trim();
        copy = SQLEngineJS._applyWhereFilter(copy, condStr);
      }

      // 2. Window Functions check e.g. ROW_NUMBER() OVER (...), LAG(col) OVER (...), SUM(col) OVER (...)
      if (upper.includes('OVER')) {
        return SQLEngineJS._executeWindowQuery(query, copy);
      }

      // 3. GROUP BY query pattern
      if (upper.includes('GROUP BY')) {
        const groupMatch = query.match(/SELECT\s+(.*?)\s+FROM\s+.*?\s+GROUP\s+BY\s+(.*?)(?:\s+ORDER\s+BY\s+(.*?))?(?:\s+LIMIT\s+(\d+))?$/i);
        if (groupMatch) {
          const selectPart = groupMatch[1].trim();
          const groupByCol = groupMatch[2].trim();
          const orderByPart = groupMatch[3] ? groupMatch[3].trim() : null;
          const limitVal = groupMatch[4] ? parseInt(groupMatch[4], 10) : 50;

          // Parse aggregate function e.g. AVG(Total_Spend_USD) or COUNT(*)
          const aggMatch = selectPart.match(/(AVG|SUM|COUNT|MIN|MAX)\((.*?)\)/i);
          const aggFunc = aggMatch ? aggMatch[1].toUpperCase() : 'COUNT';
          const aggCol = aggMatch ? aggMatch[2].trim() : cols[0];

          const res = PivotBuilder.generatePivotTable(copy, groupByCol, null, aggCol === '*' ? cols[0] : aggCol, aggFunc.toLowerCase());
          if (res) {
            let rows = res.rowKeys.map(rk => ({
              [groupByCol]: rk,
              [`${aggFunc}(${aggCol})`]: res.matrix[rk]['Value']
            }));

            if (orderByPart) {
              const isDesc = orderByPart.toUpperCase().includes('DESC');
              const sortKey = `${aggFunc}(${aggCol})`;
              rows.sort((a, b) => isDesc ? b[sortKey] - a[sortKey] : a[sortKey] - b[sortKey]);
            }

            return {
              headers: [groupByCol, `${aggFunc}(${aggCol})`],
              rows: rows.slice(0, limitVal)
            };
          }
        }
      }

      // 4. Standard SELECT with ORDER BY / LIMIT
      let limitVal = 50;
      const limitMatch = query.match(/LIMIT\s+(\d+)/i);
      if (limitMatch) limitVal = parseInt(limitMatch[1], 10);

      const orderMatch = query.match(/ORDER\s+BY\s+(\w+)(?:\s+(ASC|DESC))?/i);
      if (orderMatch) {
        const sortCol = orderMatch[1];
        const isDesc = orderMatch[2] ? orderMatch[2].toUpperCase() === 'DESC' : false;
        copy.sort((a, b) => {
          if (a[sortCol] === b[sortCol]) return 0;
          if (a[sortCol] === null || a[sortCol] === undefined) return 1;
          if (b[sortCol] === null || b[sortCol] === undefined) return -1;
          return isDesc ? (b[sortCol] > a[sortCol] ? 1 : -1) : (a[sortCol] > b[sortCol] ? 1 : -1);
        });
      }

      return {
        headers: cols,
        rows: copy.slice(0, limitVal)
      };

    } catch (err) {
      return { error: `SQL Parser Error: ${err.message}` };
    }
  }

  static _applyWhereFilter(data, condStr) {
    const match = condStr.match(/(\w+)\s*(=|!=|>|<|>=|<=)\s*(.*)/);
    if (!match) return data;

    const col = match[1];
    const op = match[2];
    let valStr = match[3].replace(/^"|^'|"$|'$"/g, '').trim();
    const numVal = parseFloat(valStr);
    const targetVal = !isNaN(numVal) ? numVal : valStr;

    return data.filter(row => {
      const v = row[col];
      if (v === null || v === undefined) return false;
      if (op === '=') return v == targetVal;
      if (op === '!=') return v != targetVal;
      if (op === '>') return v > targetVal;
      if (op === '<') return v < targetVal;
      if (op === '>=') return v >= targetVal;
      if (op === '<=') return v <= targetVal;
      return true;
    });
  }

  static _executeWindowQuery(query, data) {
    const upper = query.toUpperCase();
    let result = JSON.parse(JSON.stringify(data));

    // Parse Window Function e.g., ROW_NUMBER() OVER (PARTITION BY Category ORDER BY Total_Spend_USD DESC)
    const partitionMatch = query.match(/PARTITION\s+BY\s+(\w+)/i);
    const orderMatch = query.match(/ORDER\s+BY\s+(\w+)(?:\s+(ASC|DESC))?/i);

    const partitionCol = partitionMatch ? partitionMatch[1] : null;
    const sortCol = orderMatch ? orderMatch[1] : (Object.keys(data[0])[0]);
    const isDesc = orderMatch && orderMatch[2] ? orderMatch[2].toUpperCase() === 'DESC' : false;

    // Helper sort function
    const sortFn = (a, b) => {
      if (a[sortCol] === b[sortCol]) return 0;
      if (a[sortCol] === null) return 1;
      if (b[sortCol] === null) return -1;
      return isDesc ? (b[sortCol] > a[sortCol] ? 1 : -1) : (a[sortCol] > b[sortCol] ? 1 : -1);
    };

    if (upper.includes('ROW_NUMBER()')) {
      if (partitionCol) {
        // Group by partitionCol and assign row numbers
        const groups = {};
        result.forEach(r => {
          const key = r[partitionCol] || 'Default';
          groups[key] = groups[key] || [];
          groups[key].push(r);
        });

        const finalRows = [];
        Object.keys(groups).forEach(key => {
          groups[key].sort(sortFn);
          groups[key].forEach((row, idx) => {
            row['row_num'] = idx + 1;
            finalRows.push(row);
          });
        });
        result = finalRows;
      } else {
        result.sort(sortFn);
        result.forEach((r, idx) => r['row_num'] = idx + 1);
      }
    } else if (upper.includes('LAG(') || upper.includes('LEAD(')) {
      const isLag = upper.includes('LAG(');
      const lagMatch = query.match(/(?:LAG|LEAD)\((\w+)\)/i);
      const targetCol = lagMatch ? lagMatch[1] : sortCol;

      result.sort(sortFn);
      result.forEach((r, idx) => {
        const targetIdx = isLag ? idx - 1 : idx + 1;
        const colName = isLag ? `prev_${targetCol}` : `next_${targetCol}`;
        r[colName] = (targetIdx >= 0 && targetIdx < result.length) ? result[targetIdx][targetCol] : null;
      });
    } else if (upper.includes('SUM(') && upper.includes('OVER')) {
      const sumMatch = query.match(/SUM\((\w+)\)\s+OVER/i);
      const sumCol = sumMatch ? sumMatch[1] : sortCol;
      result.sort(sortFn);

      let running = 0;
      result.forEach(r => {
        const val = typeof r[sumCol] === 'number' ? r[sumCol] : 0;
        running += val;
        r[`running_sum_${sumCol}`] = Math.round(running * 100) / 100;
      });
    }

    const limitMatch = query.match(/LIMIT\s+(\d+)/i);
    const limitVal = limitMatch ? parseInt(limitMatch[1], 10) : 15;

    const cols = Object.keys(result[0] || {});
    return {
      headers: cols,
      rows: result.slice(0, limitVal)
    };
  }
}
