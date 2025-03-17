import Router from 'koa-router';
import * as testCtrl from 'api/test/controller/test.ctrl';
// import * as adminCtrl from './admin.ctrl';

const test = new Router();

test.get('/',testCtrl.test);
test.post('/',testCtrl.postTest);

export default test;