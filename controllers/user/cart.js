const { pool } = require("../../config/database");



async function syncCart(req, res) {
  try {
    const cartItems = req.body;
    const { id } = req.user;
    const user_id = id;

    // Delete all existing cart items for the user
    await pool.execute("DELETE FROM res_cart WHERE user_id = ?", [user_id]);

    // Insert all items from the request body into the cart
    const insertQuery = "INSERT INTO res_cart (user_id, item_id, item_type, item_name, sale_price, original_price, quantity, stock) VALUES ?";
    
    // Prepare the values for insertion
    const values = cartItems.map((item) => {
      // Set original_price to sale_price if original_price is missing
      const originalPrice = item.original_price || item.sale_price;
      
      return [
        user_id, 
        item.item_id, 
        item.item_type, 
        item.item_name, 
        item.sale_price, 
        originalPrice, 
        item.quantity, 
        item.stock
      ];
    });

    await pool.query(insertQuery, [values]);
  
    res.status(200).json({ message: "Cart synchronized successfully." });
  } catch (error) {
    console.error("Error syncing cart:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getCart(req, res) {
  try {
    const { id } = req.user;
    const user_id = id;

    const [cartItems] = await pool.execute("SELECT * FROM res_cart WHERE user_id = ?", [user_id]);

    res.status(200).json(cartItems);
  } catch (error) {
    console.error("Error getting cart:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}


module.exports = { syncCart, getCart };

