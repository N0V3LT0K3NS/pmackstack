import { Router } from 'express';
import { dashboardController } from '../controllers/dashboardController';
import { storesController } from '../controllers/storesController';
import { authController } from '../controllers/authController';
import { dataEntryController } from '../controllers/dataEntryController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public routes (no auth required)
router.post('/auth/login', authController.validateLogin, authController.login);

// Protected routes (auth required)
router.use(authenticate); // All routes below this require authentication

// Auth routes
router.get('/auth/me', authController.me);

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

export default router; 