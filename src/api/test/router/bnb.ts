import Router from 'koa-router';
import * as bnbCtrl from 'api/test/controller/bnb.ctrl';

const bnb = new Router();

// BNB
bnb.post('/', bnbCtrl.insertRoom);

export default bnb;