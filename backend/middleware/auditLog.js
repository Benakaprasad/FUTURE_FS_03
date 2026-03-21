const pool = require('../config/database');

const auditLog = (tableName, action) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = async function (data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          await pool.query(
            `INSERT INTO audit_log
               (table_name, record_id, action, new_data, changed_by, ip_address, user_agent)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              tableName,
              data?.id || data?.data?.id || null,
              action,
              JSON.stringify(data),
              req.user?.id || null,
              req.ip,
              req.headers['user-agent'] || null,
            ]
          );
        } catch (err) {
          console.error('Audit log error:', err.message);
        }
      }
      return originalJson(data);
    };

    next();
  };
};

module.exports = { auditLog };