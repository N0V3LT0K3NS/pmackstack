import { Router } from 'express';
import { dashboardController } from '../controllers/dashboardController';
import { storesController } from '../controllers/storesController';

const router = Router();

// Dashboard routes
router.get('/dashboard/overview', dashboardController.getOverview);
router.get('/dashboard/stores-timeseries', dashboardController.getStoresTimeSeries);

// Store routes
router.get('/stores', storesController.getStores);
router.get('/stores/:storeCode/metrics', storesController.getStoreMetrics);
router.get('/stores/compare', storesController.compareStores);

export default router; 