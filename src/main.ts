require('dotenv').config();
import dotenv from "dotenv";
import Koa, { DefaultContext } from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors'
import serve from 'koa-static';
import path from "path";
import fs from 'fs';

import api from "@routes/router";

import client from 'config/db';
import { errorHandler } from "middleware/errorHandler";
import { StateWithUser } from "@utils/type/auth";

dotenv.config();
const { PORT,NODE_ENV,HOST_URL_DEV,HOST_URL_PROD } = process.env;


(() => {
const result = dotenv.config({ path: path.join(__dirname, "..", ".env") }); // .env 파일의 경로를 dotenv.config에 넘겨주고 성공여부를 저장함
if (result.parsed == undefined) // .env 파일 parsing 성공 여부 확인
    throw new Error("Cannot loaded environment variables file."); // parsing 실패 시 Throwing
})();

client.connect(err => {
    if (err) {
      console.log('Failed to connect db ' + err)
    } else {
      console.log('Connect to db done!!')
    }
})


const app = new Koa();
app.use(require('koa-mount')('/public/uploads', serve(path.join(__dirname, '../public/uploads'))));
app.use(serve(path.join(__dirname, '../public'))); // 실제 파일 시스템 경로

const router = new Router<StateWithUser, DefaultContext>();
router.use(api.routes()); // api 라우트 적용


const uploadPath = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

//특정 도메인
const options = {
    origin: '*' , // 접근 권한을 부여하는 도메인
    credentials: true, // 응답 헤더에 Access-Control-Allow-Credentials 추가
    optionsSuccessStatus: 200, // 응답 상태 200으로 설정
};
app.proxy = true;
app.use(cors(options));
app.use(bodyParser({
    detectJSON: ctx => !ctx.is('multipart/form-data')
}));

app.use(errorHandler);
app.use(router.routes()).use(router.allowedMethods());


const port = PORT || 4000;
app.listen(port, () => {
    console.log('Listening to port %d', port);
})

