import { Router } from 'express';
import { dashboardController } from '../controllers/dashboardController';
import { storesController } from '../controllers/storesController';
import { authController } from '../controllers/authController';
import { dataEntryController } from '../controllers/dataEntryController';
import { renojaController } from '../controllers/renojaController';
import { userController } from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// ============================================
// PUBLIC ROUTES (NO AUTHENTICATION REQUIRED)
// ============================================
router.post('/auth/login', authController.validateLogin, authController.login);

// ============================================
// PROTECTED ROUTES (AUTHENTICATION REQUIRED)
// ============================================
// Apply authentication middleware to all routes below
router.use(authenticate);

// Auth routes (require authentication)
router.get('/auth/me', authController.me);

// User management routes (executive only)
router.get('/users', authorize('executive'), userController.getUsers);
router.post('/users', authorize('executive'), userController.validateCreateUser, userController.createUser);
router.put('/users/:id', authorize('executive'), userController.validateUpdateUser, userController.updateUser);
router.delete('/users/:id', authorize('executive'), userController.deleteUser);

// Dashboard routes - all authenticated users can access
router.get('/dashboard/overview', dashboardController.getOverview);
router.get('/dashboard/stores-timeseries', dashboardController.getStoresTimeSeries);
router.get('/dashboard/export-csv', dashboardController.exportCSV);

// Store routes - all authenticated users can access
router.get('/stores', storesController.getStores);
router.get('/stores/:storeCode/metrics', storesController.getStoreMetrics);
router.get('/stores/compare', storesController.compareStores);

// Data entry routes - all authenticated users can access
router.post('/data-entry/weekly', 
  dataEntryController.validateWeeklyEntry, 
  dataEntryController.submitWeeklyEntry
);

router.post('/data-entry/import-csv', 
  dataEntryController.importCSV
);

router.get('/data-entry/csv-template', 
  dataEntryController.getCSVTemplate
);

router.get('/data-entry/recent', 
  dataEntryController.getRecentEntries
);

router.get('/data-entry/last-week/:storeCode', 
  dataEntryController.getLastWeekData
);

router.put('/data-entry/weekly/:id', 
  dataEntryController.validateWeeklyEntry, 
  dataEntryController.updateWeeklyEntry
);

router.delete('/data-entry/weekly/:id', 
  dataEntryController.deleteWeeklyEntry
);

// Renoja-specific routes
router.get('/renoja/dashboard', renojaController.getDashboardOverview);
router.get('/renoja/recent', renojaController.getRecentEntries);
router.get('/renoja/last-week/:storeCode', renojaController.getLastWeekData);

router.post('/renoja/weekly', 
  renojaController.validateRenojaEntry,
  renojaController.submitWeeklyEntry
);

export default router; 