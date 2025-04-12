
const mysql = require("mysql2/promise");
const { faker } = require("@faker-js/faker");

const pool = mysql.createPool({
  host: "localhost",
  user: "root", // Change if needed
  password: "", // Change if needed
  database: "mathekgc_accord-data-research",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function insertProjects() {
  const projects = [];

  for (let i = 13; i <= 100; i++) {
    projects.push([
      '11', // client_id
      `ADR${i}`, // project_code
      faker.company.catchPhrase(), // project_name
      faker.lorem.paragraph(), // project_description
    ]);
  }

  const sql = `INSERT INTO group_projects (
      client_id, project_code, project_name, project_description
    ) VALUES ?
  `;

  try {
    const [result] = await pool.query(sql, [projects]);

    console.log(`✅ Successfully inserted ${result.affectedRows} projects.`);

  } catch (error) {
    console.error("Error inserting projects:", error);
  } finally {
    await pool.end();
  }
}

insertProjects();