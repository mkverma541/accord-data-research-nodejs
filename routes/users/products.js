const express = require('express');
const router = express.Router();

const ProductController = require('../../controllers/admin/products');
const VariantController = require('../../controllers/admin/productVariants');
const AttributeController = require('../../controllers/admin/productAttributes');
const CategoryController = require('../../controllers/admin/productCategories');
const TagController = require('../../controllers/admin/productTags');

router.get('/', ProductController.getProductList);

router.get('/attributes/:type', AttributeController.getAttributeByType);
router.get('/attributes', AttributeController.getAllAttributes);

router.get('/categories', CategoryController.listCategories);
router.get('/categories/:categoryId', CategoryController.getSubcategories)  

router.get("/tags", TagController.getAllTags); // List all tags
router.get("/products/:productId/tags", TagController.getProductTags); // Get tags for a specific product


module.exports = router;
