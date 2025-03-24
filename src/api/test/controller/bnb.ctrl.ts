import { insertRoomService } from '../service/bnb.srvc';
import { Context } from 'koa';
import { File } from '@koa/multer';

export const insertRoom = async (ctx:Context, next : () => void) => {
    const files = ctx.request.files as File[]; // 이미지들
    const body = ctx.request.body; // post,put 이런애들은 바디에 붙어와서
    console.log('body:', body);
    console.log('files:', files);

    const result = await insertRoomService(body, files);
    ctx.body = result;
}