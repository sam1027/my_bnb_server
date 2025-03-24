import { insertRoomService } from '../service/bnb.srvc';

export const insertRoom = async (ctx:any, next : () => void) => {
    const params = ctx.request.body; // post,put 이런애들은 바디에 붙어와서
    const result = await insertRoomService(params);
    ctx.body = result;
}