import Router from 'koa-router';
import * as testCtrl from 'api/test/controller/test.ctrl';
import * as noticeCtrl from 'api/test/controller/notice.ctrl';
// import * as adminCtrl from './admin.ctrl';

const router = new Router();

router.get('/',testCtrl.test);
router.post('/',testCtrl.postTest);

// Notice
router.get('/notice', noticeCtrl.selectNotice);
router.post('/notice', noticeCtrl.insertNotice);

export default router;