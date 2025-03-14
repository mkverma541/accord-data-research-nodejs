const { pool } = require("../../config/database");

// Add a new category
async function addCategory(req, res) {
  const { category_name, parent_category_id } = req.body;

  try {
    await pool.execute(
      `INSERT INTO res_product_categories (category_name, parent_category_id) VALUES (?, ?)`,
      [category_name, parent_category_id]
    );


    res.status(201).json({ message: "Category added successfully" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}


// Get subcategories of a single category
async function getSubcategories(req, res) {
  const { categoryId } = req.params; // Extract categoryId from request params

  if (!categoryId) {
    return res
      .status(400)
      .json({ error: "Category ID is required in the URL." });
  }

  try {
    // Query to fetch subcategories of the given category ID
    const [subcategories] = await pool.execute(
      `
      SELECT category_id, category_name 
      FROM res_product_categories 
      WHERE parent_category_id = ?
    `,
      [categoryId]
    );


    res.status(200).json({
      data: subcategories
    });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}


// List all categories
async function listCategories(req, res) {
  try {
    const [categories] = await pool.execute(`SELECT category_id, category_name FROM res_product_categories`);


    res.status(200).json(categories);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = { addCategory, listCategories, getSubcategories };
