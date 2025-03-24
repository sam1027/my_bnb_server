import Router from "koa-router";
import test from "@api/test/router"; 
import notice from "@api/test/router/notice";
import bnb from "@api/test/router/bnb";

const router = new Router();

router.use('/test',test.routes());

// smart-board
router.use('/notice',notice.routes());

// my-bnb
router.use('/bnb', bnb.routes());

export default router;
