import Router from "koa-router";
import test from "@api/test/router"; 
import notice from "@api/test/router/notice";
import bnb from "@api/test/router/bnb";
import { StateWithUser } from "@utils/type/auth";
import { DefaultContext } from "koa";

const router = new Router<StateWithUser, DefaultContext>();

router.use('/test',test.routes());

// smart-board
router.use('/notice',notice.routes());

// my-bnb
router.use('/bnb', bnb.routes());

export default router;
