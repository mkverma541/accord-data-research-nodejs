const { format, addSeconds } = require("date-fns");
const { pool } = require("../../config/database");
const {
  fetchUserCart,
  updatePaymentStatus,
  getPackagePeriods,
  sendOrderConfirmationEmail,
} = require("./helper");

const formatDateForDB = (date) => format(date, "yyyy-MM-dd HH:mm:ss");

const processOrder = async (userId, orderId, paymentId) => {
  const connection = await pool.getConnection();

  try {
    // Start transaction
    console.log("Starting transaction for user:", userId);
    await connection.beginTransaction();

    // Fetch user's cart
    const userCart = await fetchUserCart(userId);

    if (!userCart || userCart.length === 0) {
      console.error("Cart is empty for user:", userId);
      throw new Error("Cart is empty");
    }

    // Update payment reference
    await updatePaymentStatus(paymentId, orderId);
    console.log("Payment updated successfully for order:", orderId);

    // Separate file and package items
    const fileIds = userCart.filter((item) => item.item_type === 1).map((item) => item.item_id);
    const packages = userCart.filter((item) => item.item_type === 2);

    // Process packages if any
    if (packages.length > 0) {
      const packageIds = packages.map((item) => item.item_id);
      const packagePeriods = await getPackagePeriods(packageIds);

      const packageInsertions = packages.map((item) => ({
        userId,
        packageId: item.item_id,
        orderId,
        dateExpire: formatDateForDB(addSeconds(new Date(), packagePeriods.get(item.item_id) || 0)),
        isActive: 1,
        isCurrent: 0,
      }));

      // Deactivate current packages
      await connection.execute("UPDATE res_upackages SET is_current = 0 WHERE user_id = ?", [userId]);

      // Batch insert packages
      const packageInsertValues = packageInsertions.map(
        (pkg) => [pkg.userId, pkg.packageId, pkg.orderId, pkg.isActive, pkg.isCurrent, pkg.dateExpire]
      );
      await connection.query(
        "INSERT INTO res_upackages (user_id, package_id, order_id, is_active, is_current, date_expire) VALUES ?",
        [packageInsertValues]
      );
      console.log("Packages inserted successfully for user:", userId);
    }

    // Insert files if any
    if (fileIds.length > 0) {
      const fileInsertValues = fileIds.map((fileId) => [userId, fileId, orderId]);
      await connection.query(
        "INSERT INTO res_ufiles (user_id, file_id, order_id) VALUES ?",
        [fileInsertValues]
      );
      console.log("Files inserted successfully for user:", userId);
    }

    // Clear user's cart
    await connection.execute("DELETE FROM res_cart WHERE user_id = ?", [userId]);
    console.log("Cart cleared for user:", userId);

    // Commit transaction
    await connection.commit();
    console.log("Transaction committed successfully for user:", userId);

    // Send order confirmation email asynchronously
    sendOrderConfirmationEmail(userId, paymentId, orderId);
    console.log("Order confirmation email sent to user:", userId);
  } catch (error) {
    console.error("Error during order processing for user:", userId, "Error:", error.message);
    await connection.rollback();
    throw error;
  } finally {
    if (connection) connection.release(); // Release the connection
    console.log("Database connection released for user:", userId);
  }
};

module.exports = { processOrder };
