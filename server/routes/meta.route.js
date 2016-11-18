import express from 'express';
import validate from 'express-validation';
import paramValidation from '../../config/param-validation';
import metaCtrl from '../controllers/meta.controller';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  /** GET /api/metas - Get list of metas */
  .get(metaCtrl.list)

  /** POST /api/metas - Create new meta */
  .post(metaCtrl.create);

router.route('/search')
  .get(metaCtrl.search);

router.route('/:metaId')
  /** GET /api/metas/:metaId - Get meta */
  .get(metaCtrl.get)

  /** DELETE /api/metas/:metaId - Delete meta */
  .delete(metaCtrl.remove);

// This will add the meta directly in req
router.param('metaId', metaCtrl.load);

export default router;
