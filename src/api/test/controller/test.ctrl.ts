import { 
    testService,
    testPostService,
 } from '@api/test/service/test.srvc';

export const test = async (ctx:any, next : () => void) => {
    const { name } = ctx.query; // get, delete 이런 애들은 url?param=파라미터 << 요렇게 붙어 오기 때문에 
    const result = await testService(name);
    ctx.body = result;
}


export const postTest = async (ctx:any, next : () => void) => {
    const { name,id } = ctx.request.body; // post,put 이런애들은 바디에 붙어와서
    const result = await testPostService(id,name);
    ctx.body = result;
}


