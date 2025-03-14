const { pool } = require("../../config/database");

/**
 * Add a new product tag
 */
async function addTag(req, res) {
  const { tag_name } = req.body;

  if (!tag_name) {
    return res.status(400).json({ error: "Tag name is required." });
  }

  try {
    const [result] = await pool.execute(
      `INSERT INTO res_product_tags (tag_name) VALUES (?)`,
      [tag_name]
    );

    res.status(201).json({
      message: "Tag added successfully",
      tag_id: result.insertId,
    });
  } catch (error) {
    console.error("Database error in addTag:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * Get all tags
 */
async function getAllTags(req, res) {
  try {
    const [tags] = await pool.execute(
      `SELECT id AS tag_id, tag_name FROM res_product_tags`
    );

    res.status(200).json({
      message: "Tags retrieved successfully",
      data: tags
    });
  } catch (error) {
    console.error("Database error in getAllTags:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * Delete a tag by ID
 */
async function deleteTag(req, res) {
  const { tagId } = req.params;

  if (!tagId) {
    return res.status(400).json({ error: "Tag ID is required." });
  }

  try {
    const [result] = await pool.execute(
      `DELETE FROM res_product_tags WHERE id = ?`,
      [tagId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Tag not found." });
    }

    res.status(200).json({
      message: "Tag deleted successfully",
    });
  } catch (error) {
    console.error("Database error in deleteTag:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * Get tags for a specific product
 */
async function getProductTags(req, res) {
  const { productId } = req.params;

  if (!productId) {
    return res.status(400).json({ error: "Product ID is required." });
  }

  try {
    const [tags] = await pool.execute(
      `SELECT pt.id AS tag_id, pt.tag_name 
       FROM res_product_tags pt
       JOIN res_product_tag_map ptm ON pt.id = ptm.tag_id
       WHERE ptm.product_id = ?`,
      [productId]
    );

    res.status(200).json({
      message: "Tags retrieved successfully",
      tags,
    });
  } catch (error) {
    console.error("Database error in getProductTags:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * Add tags to a specific product
 */
async function addProductTags(req, res) {
  const { productId } = req.params;
  const { tag_ids } = req.body; // Array of tag IDs

  if (!productId || !Array.isArray(tag_ids) || tag_ids.length === 0) {
    return res.status(400).json({
      error: "Product ID and tag IDs are required, and tag_ids must be an array.",
    });
  }

  try {
    const values = tag_ids.map((tagId) => [productId, tagId]);
    await pool.query(
      `INSERT INTO res_product_tag_map (product_id, tag_id) VALUES ?`,
      [values]
    );

    res.status(201).json({
      message: "Tags added to product successfully",
    });
  } catch (error) {
    console.error("Database error in addProductTags:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  addTag,
  getAllTags,
  deleteTag,
  getProductTags,
  addProductTags,
};
