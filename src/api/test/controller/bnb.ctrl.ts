import { insertRoomService, selectRoomsService, toggleFavoriteRoomService } from '../service/bnb.srvc';
import { Context } from 'koa';
import { File } from '@koa/multer';

export const insertRoom = async (ctx:Context, next : () => void) => {
    const files = ctx.request.files as File[]; // 이미지들
    const body = ctx.request.body; // post,put 이런애들은 바디에 붙어와서
    const result = await insertRoomService(body, files);
    ctx.body = result;
}

export const selectRooms = async (ctx:any, next : () => void) => {
    const { id } = ctx.query; // get, delete 이런 애들은 url?param=파라미터 << 요렇게 붙어 오기 때문에 
    const result = await selectRoomsService(id);
    ctx.body = result;
}

export const toggleFavoriteRoom = async (ctx:any, next : () => void) => {
    const body = ctx.request.body; // post,put 이런애들은 바디에 붙어와서
    const result = await toggleFavoriteRoomService(body);
    ctx.body = result;
}