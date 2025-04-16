export const errorHandler = async (ctx:any, next:any) => {
    try {
      await next(); // 모든 라우트/미들웨어 실행
    } catch (err:any) {
      console.error('서버 에러 발생:', err);
  
      ctx.status = err.status || 500;
      ctx.body = {
        message: err.message || '서버 내부 오류가 발생했습니다.',
      };
    }
  };
  