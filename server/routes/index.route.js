import express from 'express';
import metaRoutes from './meta.route';

const router = express.Router(); // eslint-disable-line new-cap

router.use('/metas', metaRoutes);

export default router;
