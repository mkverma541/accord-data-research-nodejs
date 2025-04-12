var express = require("express");
var router = express.Router();

const ProjectController = require("../controllers/projects");
const ProjectListController = require("../controllers/listProject");

router.post("/add", ProjectController.createProject);
router.get("/list", ProjectListController.getAllProjects);
router.get("/counts", ProjectController.getProjectStatusCounts);
router.put("/update/child/project", ProjectController.updateChildProject);
router.put("/child/update/status", ProjectController.updateChildProjectStatus);
router.put("/update/survey-link", ProjectController.updateProjectSurveyLink);
router.post("/child/add", ProjectController.addChildProject);
router.get("/:projectId/survey-links", ProjectController.getProjectSurveyLinks);
router.post("/suppliers/add", ProjectController.addSupplierToProject);
router.put("/suppliers/update", ProjectController.updateSupplierInProject);
router.get("/mapped-suppliers", ProjectController.getMappedSuppliers);
router.put("/group/update", ProjectController.updateGroupProject);
router.get("/details", ProjectController.getProjectById);
router.get("/group/details", ProjectController.getGroupProjectDetails);
router.post("/clone-project-details", ProjectController.cloneProjectDetails)

module.exports = router;
