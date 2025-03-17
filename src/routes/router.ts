import Router from "koa-router";
import test from "@api/test/router"; 
import notice from "@api/test/router/notice";

const router = new Router();

router.use('/test',test.routes());
router.use('/notice',notice.routes());

export default router;
