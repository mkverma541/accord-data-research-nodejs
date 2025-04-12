const { pool } = require("../config/database");

// Helper function: Execute query with parameters
const executeQuery = async (query, params) => {
  const [results] = await pool.query(query, params);
  return results;
};




const getGroupProjects = async (req) => {
  let { search, status, page = 1, limit = 10 } = req.query;
  page = parseInt(page, 10);
  limit = parseInt(limit, 10);
  const offset = (page - 1) * limit;

  const queryParams = [];
  let whereClause = "WHERE 1=1";

  if (search?.trim()) {
    whereClause += " AND (gp.project_name LIKE ? OR gp.project_code LIKE ?)";
    queryParams.push(`%${search}%`, `%${search}%`);
  }

  if (status?.trim()) {
    whereClause += " AND gp.status = ?";
    queryParams.push(status);
  }

  const groupProjectQuery = `
    SELECT 
      gp.project_id, gp.project_code, gp.project_name, gp.status,
      gp.created_at, gp.updated_at, c.client_name, c.client_id
    FROM group_projects gp
    INNER JOIN clients c ON gp.client_id = c.client_id
    ${whereClause}
    ORDER BY gp.created_at DESC
    LIMIT ? OFFSET ?`;

  queryParams.push(limit, offset);

  const countQuery = `
    SELECT COUNT(*) AS total_count
    FROM group_projects gp
    ${whereClause}`;

  const groupProjects = await executeQuery(groupProjectQuery, queryParams);
  const [{ total_count }] = await executeQuery(countQuery, queryParams.slice(0, -2));

  return { groupProjects, total_count, page, limit };
};


const getChildProjectsMap = async (groupIds = []) => {
  if (!Array.isArray(groupIds) || groupIds.length === 0) {
    console.log("No group project IDs found.");
    return new Map();
  }

  // Ensure all IDs are numbers
  const cleanIds = groupIds.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
  const placeholders = cleanIds.map(() => '?').join(',');

  const query = `
    SELECT 
      p.*, c.client_name, c.client_code, co.name AS country_name
    FROM projects p
    INNER JOIN clients c ON p.client_id = c.client_id
    INNER JOIN countries co ON p.country_code = co.code
    WHERE p.group_project_id IN (${placeholders})`;

  const projects = await executeQuery(query, cleanIds);

  const projectMap = new Map();
  for (const p of projects) {
    const groupId = parseInt(p.group_project_id, 10);
    if (!projectMap.has(groupId)) {
      projectMap.set(groupId, []);
    }
    projectMap.get(groupId).push(p);
  }

  return projectMap;
};


const getDefaultStatusCounts = () => ({
  duplicate_ip: 0,
  geo_ip_mismatch: 0,
  drop_out: 0,
  over_quota: 0,
  complete: 0,
  terminate: 0,
  quality_terminate: 0,
  survey_closed: 0,
  test_link: 0,
  total_click: 0,
});

const aggregateStatusCounts = (projects) => {
  const total = getDefaultStatusCounts();
  for (const p of projects) {
    const sc = p.status_counts || {};
    for (const key in total) {
      total[key] += sc[key] || 0;
    }
  }
  return total;
};

const calculateMedian = (values) => {
  if (values.length === 0) return 0;
  const sorted = values.slice().sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

// Fetch status and total click counts
const getStatusClickCounts = async () => {
  const query = `
      SELECT 
        pr.project_id, pr.status, COUNT(*) AS count,
        (SELECT COUNT(*) FROM project_report WHERE project_id = pr.project_id) AS total_click
      FROM project_report pr
      GROUP BY pr.project_id, pr.status`;

  const statusResults = await executeQuery(query, []);

  const statusMap = new Map();

  statusResults.forEach((row) => {
    if (!statusMap.has(row.project_id)) {
      statusMap.set(row.project_id, {
        total_click: row.total_click || 0
      });
    }

    const projectStatus = statusMap.get(row.project_id);
    projectStatus[row.status] = row.count;  // Use status directly as key
  });

  return statusMap;
};



// Main handler function
const getAllProjects = async (req, res) => {
  try {
    const { groupProjects, total_count, page, limit } = await getGroupProjects(req);
    const groupIds = groupProjects.map(g => g.project_id);
    const childProjectsMap = await getChildProjectsMap(groupIds);
    const statusMap = await getStatusClickCounts();

    const result = groupProjects.map((gp) => {
      const children = childProjectsMap.get(gp.project_id) || [];
      const enrichedChildren = children.map(project => {
        const statusCounts = statusMap.get(project.project_id) || getDefaultStatusCounts();
        return {
          ...project,
          field_ir: project.ir || 0,
          conversion_rate: project.cr || 0,
          drop_out_rate: project.dr || 0,
          median_loi: project.loi || 0,
          cpi_percent: parseFloat(project.project_cpi) || 0,
          pre_screen: project.pre_screen || 0,
          status_counts: statusCounts,
        };
      });

      const medianLOI = calculateMedian(enrichedChildren.map(p => p.median_loi).filter(loi => loi > 0));
      const status_counts = aggregateStatusCounts(enrichedChildren);

      return {
        project_id: gp.project_id,
        project_code: gp.project_code,
        project_name: gp.project_name,
        status: gp.status,
        created_at: gp.created_at,
        updated_at: gp.updated_at,
        child_projects: enrichedChildren,
        median_loi: medianLOI,
        status_counts,
        client_name: gp.client_name
      };
    });

    res.status(200).json({
      data: result,
      status: "success",
      pagination: {
        currentPage: page,
        perPage: limit,
        totalPages: Math.ceil(total_count / limit),
        totalItems: total_count,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error", status: "error" });
  }
};


module.exports = { getAllProjects };
