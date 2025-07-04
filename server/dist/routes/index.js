"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboardController_1 = require("../controllers/dashboardController");
const storesController_1 = require("../controllers/storesController");
const authController_1 = require("../controllers/authController");
const dataEntryController_1 = require("../controllers/dataEntryController");
const renojaController_1 = require("../controllers/renojaController");
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public routes (no auth required)
router.post('/auth/login', authController_1.authController.validateLogin, authController_1.authController.login);
// Protected routes (auth required)
router.use(auth_1.authenticate); // All routes below this require authentication
// Auth routes
router.get('/auth/me', authController_1.authController.me);
// User management routes (executive only)
router.get('/users', (0, auth_1.authorize)('executive'), userController_1.userController.getUsers);
router.post('/users', (0, auth_1.authorize)('executive'), userController_1.userController.validateCreateUser, userController_1.userController.createUser);
router.put('/users/:id', (0, auth_1.authorize)('executive'), userController_1.userController.validateUpdateUser, userController_1.userController.updateUser);
router.delete('/users/:id', (0, auth_1.authorize)('executive'), userController_1.userController.deleteUser);
// Dashboard routes - all authenticated users can access
router.get('/dashboard/overview', dashboardController_1.dashboardController.getOverview);
router.get('/dashboard/stores-timeseries', dashboardController_1.dashboardController.getStoresTimeSeries);
router.get('/dashboard/export-csv', dashboardController_1.dashboardController.exportCSV);
// Store routes - all authenticated users can access
router.get('/stores', storesController_1.storesController.getStores);
router.get('/stores/:storeCode/metrics', storesController_1.storesController.getStoreMetrics);
router.get('/stores/compare', storesController_1.storesController.compareStores);
// Data entry routes - all authenticated users can access
router.post('/data-entry/weekly', dataEntryController_1.dataEntryController.validateWeeklyEntry, dataEntryController_1.dataEntryController.submitWeeklyEntry);
router.post('/data-entry/import-csv', dataEntryController_1.dataEntryController.importCSV);
router.get('/data-entry/csv-template', dataEntryController_1.dataEntryController.getCSVTemplate);
router.get('/data-entry/recent', dataEntryController_1.dataEntryController.getRecentEntries);
router.get('/data-entry/last-week/:storeCode', dataEntryController_1.dataEntryController.getLastWeekData);
router.put('/data-entry/weekly/:id', dataEntryController_1.dataEntryController.validateWeeklyEntry, dataEntryController_1.dataEntryController.updateWeeklyEntry);
router.delete('/data-entry/weekly/:id', dataEntryController_1.dataEntryController.deleteWeeklyEntry);
// Renoja-specific routes
router.get('/renoja/dashboard', renojaController_1.renojaController.getDashboardOverview);
router.get('/renoja/recent', renojaController_1.renojaController.getRecentEntries);
router.get('/renoja/last-week/:storeCode', renojaController_1.renojaController.getLastWeekData);
router.post('/renoja/weekly', renojaController_1.renojaController.validateRenojaEntry, renojaController_1.renojaController.submitWeeklyEntry);
exports.default = router;
