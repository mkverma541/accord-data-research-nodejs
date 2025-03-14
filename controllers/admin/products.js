const { pool } = require("../../config/database");

async function addProduct(req, res) {
  const {
    product_name,
    sku,
    original_price,
    sale_price = null, // Default to null if not provided
    stock_quantity,
    description = null, // Default to null if not provided
    manufacturer = null, // Default to null if not provided
    supplier = null, // Default to null if not provided
    status,
    images = [],
    tags = [],
    is_featured = 0, // Default to 0 if not provided
    rating = 0, // Default to 0 if not provided
    reviews_count = 0, // Default to 0 if not provided
    categories = [], // Default to empty array if not provided
    variants,
    attributes,
  } = req.body;

  // Validate required fields
  if (!product_name || !original_price) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Prepare data
    const imagesStr = JSON.stringify(images); // Convert images array to JSON string
    const tagsStr = JSON.stringify(tags); // Convert tags array to JSON string
    const categoriesStr = JSON.stringify(categories); // Convert categories array to JSON string
    const isFeaturedInt = is_featured ? 1 : 0; // Convert is_featured to integer (1 or 0)

    // Insert product into the res_products table
    const [result] = await pool.execute(
      `INSERT INTO res_products (
        product_name, sku, original_price, sale_price, stock_quantity, description, manufacturer, supplier, 
        status, images, tags, is_featured, rating, reviews_count, categories
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        product_name,
        sku,
        original_price,
        sale_price,
        stock_quantity,
        description,
        manufacturer,
        supplier,
        status,
        imagesStr, // Insert the JSON string for images
        tagsStr, // Insert the JSON string for tags
        isFeaturedInt, // Insert integer for is_featured
        rating,
        reviews_count,
        categoriesStr, // Insert the JSON string for categories
      ]
    );

    const productId = result.insertId;
    console.log("Inserted product ID:", productId);

    // Add product variants
    if (variants && variants.length > 0) {
      const variantQueries = variants.map((variant) =>
        pool.execute(
          `INSERT INTO res_product_variants (
            product_id, variant_sku, variant_name, variant_price, variant_stock_quantity, color, size, material,
            weight, dimensions, variant_image_url
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            productId,
            variant.variant_sku,
            variant.variant_name,
            variant.variant_price,
            variant.variant_stock_quantity,
            variant.color,
            variant.size,
            variant.material,
            variant.weight,
            variant.dimensions,
            variant.variant_image_url,
          ]
        )
      );
      await Promise.all(variantQueries);
    }

    // Add product attributes
    if (attributes && attributes.length > 0) {
      const attributeQueries = attributes.map((attribute) =>
        pool.execute(
          `INSERT INTO res_product_attributes (product_id, attribute_name, attribute_value) VALUES (?, ?, ?)`,
          [productId, attribute.attribute_name, attribute.attribute_value]
        )
      );
      await Promise.all(attributeQueries);
    }

    res.status(201).json({
      message: "Product added successfully",
      productId,
    });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getProductList(req, res) {
  try {
    // Get page and limit from query parameters, with defaults
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    // Query products with pagination
    const [products] = await pool.execute(
      `SELECT 
        product_name, 
        original_price, 
        sale_price, 
        rating, 
        reviews_count,
        images
      FROM res_products
      LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    // Check if products exist
    if (products.length === 0) {
      return res.status(404).json({ error: "No products found" });
    }

    // Format each product to include only the required keys
    const productList = products.map((product) => ({
      product_name: product.product_name,
      original_price: product.original_price,
      sale_price: product.sale_price,
      rating: product.rating,
      reviews_count: product.reviews_count,
      images: JSON.parse(product.images), // Parse images if stored as JSON
    }));

    // Get the total number of products for pagination metadata
    const [[{ total }]] = await pool.execute(
      `SELECT COUNT(*) AS total FROM res_products`
    );

    // Return the product list with pagination metadata
    res.status(200).json({
      current_page: page,
      total_pages: Math.ceil(total / limit),
      total_products: total,
      data: productList,
    });
  } catch (error) {
    console.error("Error fetching product list:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}



module.exports = { addProduct, getProductList };
