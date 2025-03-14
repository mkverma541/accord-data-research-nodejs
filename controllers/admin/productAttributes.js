const { pool } = require("../../config/database");

/**
 * Add a new attribute type
 */
const addAttributeType = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Attribute name is required." });
  }

  try {
    const [result] = await pool.execute(
      `INSERT INTO res_attributes (name) VALUES (?)`,
      [name]
    );

    res.status(201).json({
      message: "Attribute type added successfully",
      attribute_id: result.insertId,
    });
  } catch (error) {
    console.error("Database error in addAttributeType:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Add a new value to an existing attribute type
 */
const addAttributeValue = async (req, res) => {
  const { attribute_id, value } = req.body;

  if (!attribute_id || !value) {
    return res.status(400).json({
      error: "Attribute ID and value are required.",
    });
  }

  try {
    const [result] = await pool.execute(
      `INSERT INTO res_attribute_values (attribute_id, value) VALUES (?, ?)`,
      [attribute_id, value]
    );

    res.status(201).json({
      message: "Attribute value added successfully",
      value_id: result.insertId,
    });
  } catch (error) {
    console.error("Database error in addAttributeValue:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Retrieve all attributes and their associated values
 */
const getAttributeByType = async (req, res) => {
  const { type } = req.params; // Get the attribute type from the URL

  if (!type) {
    return res
      .status(400)
      .json({ error: "Attribute type is required in the URL." });
  }

  try {
    // Find the attribute ID and name by its type
    const [attribute] = await pool.execute(
      `SELECT id, name FROM res_attributes WHERE name = ?`,
      [type]
    );

    if (!attribute.length) {
      return res
        .status(404)
        .json({ error: `Attribute type '${type}' not found.` });
    }

    const attributeId = attribute[0].id;

    // Retrieve the values (id and value) for the specified attribute type
    const [values] = await pool.execute(
      `SELECT id, value FROM res_attribute_values WHERE attribute_id = ?`,
      [attributeId]
    );

    return res.status(200).json({
      data: values,
    });
  } catch (error) {
    console.error("Database error in getAttributeByType:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


const getAllAttributes = async (req, res) => {
  try {
    // Fetch all attributes with their values
    const [attributes] = await pool.execute(`
      SELECT 
        a.id AS attribute_id,
        a.name AS attribute_name,
        av.id AS value_id,
        av.value AS attribute_value
      FROM res_attributes a
      LEFT JOIN res_attribute_values av ON a.id = av.attribute_id
    `);

    if (!attributes.length) {
      return res
        .status(404)
        .json({ message: "No attributes found." });
    }

    // Group values by attribute
    const groupedAttributes = attributes.reduce((result, attr) => {
      const { attribute_id, attribute_name, value_id, attribute_value } = attr;

      if (!result[attribute_id]) {
        result[attribute_id] = {
          id: attribute_id,
          name: attribute_name,
          values: [],
        };
      }

      if (value_id) {
        result[attribute_id].values.push({
          id: value_id,
          value: attribute_value,
        });
      }

      return result;
    }, {});

    // Convert grouped attributes to an array
    const attributesList = Object.values(groupedAttributes);

    return res.status(200).json({
      message: "Attributes retrieved successfully",
      data: attributesList,
    });
  } catch (error) {
    console.error("Database error in getAllAttributes:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  addAttributeType,
  addAttributeValue,
  getAttributeByType,
  getAllAttributes
};
