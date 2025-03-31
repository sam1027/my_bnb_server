import { deleteNoticeService, insertNoticeService, selectNoticeService } from '../service/notice.srvc';

export const selectNotice = async (ctx:any, next : () => void) => {
    // const { id } = ctx.query; // get, delete 이런 애들은 url?param=파라미터 << 요렇게 붙어 오기 때문에 
    const result = await selectNoticeService();
    ctx.body = result;
}

export const insertNotice = async (ctx:any, next : () => void) => {
    const params = ctx.request.body; // post,put 이런애들은 바디에 붙어와서
    const result = await insertNoticeService(params);
    ctx.body = result;
}

export const deleteNotice = async (ctx:any, next : () => void) => {
    const ids = ctx.request.body; // post,put 이런애들은 바디에 붙어와서
    const result = await deleteNoticeService(ids);
    ctx.body = result;
}


