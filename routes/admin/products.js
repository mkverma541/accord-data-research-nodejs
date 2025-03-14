const express = require('express');
const router = express.Router();

const ProductController = require('../../controllers/admin/products');
const VariantController = require('../../controllers/admin/productVariants');
const AttributeController = require('../../controllers/admin/productAttributes');
const CategoryController = require('../../controllers/admin/productCategories');
const TagController = require('../../controllers/admin/productTags');

// Product routes
router.post('/create', ProductController.addProduct);
router.get('/', ProductController.getProductList);

// Variant routes
router.post('/variants/create', VariantController.addVariant);

// Attribute routes
router.post('/attributes/type', AttributeController.addAttributeType);
router.post('/attributes/value', AttributeController.addAttributeValue);
router.get('/attributes/:type', AttributeController.getAttributeByType);
router.get('/attributes', AttributeController.getAllAttributes);

// Categories
router.post('/categories/create', CategoryController.addCategory);  
router.get('/categories/:categoryId', CategoryController.getSubcategories)  
router.get('/categories', CategoryController.listCategories);

// Tags
router.post("/tags", TagController.addTag); // Add a new tag
router.get("/tags", TagController.getAllTags); // List all tags
router.delete("/tags/:tagId", TagController.deleteTag); // Delete a tag by ID
router.get("/products/:productId/tags", TagController.getProductTags); // Get tags for a specific product
router.post("/products/:productId/tags",TagController.addProductTags); // Add tags to a specific product


module.exports = router;
