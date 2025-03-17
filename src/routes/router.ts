import Router from "koa-router";
import test from "@api/test/router"; 

const router = new Router();


router.use('/test',test.routes());


export default router;
