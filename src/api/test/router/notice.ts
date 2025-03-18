import Router from 'koa-router';
import * as noticeCtrl from 'api/test/controller/notice.ctrl';

const notice = new Router();

// Notice
notice.get('/', noticeCtrl.selectNotice);
notice.post('/', noticeCtrl.insertNotice);
notice.put('/', noticeCtrl.deleteNotice);

export default notice;