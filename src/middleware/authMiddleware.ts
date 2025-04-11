import multer from '@koa/multer';
import { Middleware } from 'koa';
import { verifyToken } from '@utils/auth/jwt';
const storage = multer.diskStorage({
    destination: 'public/uploads/',
    filename: (req:any, file:any, cb:any) => {
      cb(null, Date.now() + '-' + file.originalname);
    },
});

const upload = multer({ storage });

// 미들웨어 조합 함수
export const authAndUpload = async (ctx: any, next: any) => {
    await authMw(ctx, async () => {
        await upload.array('images', 10)(ctx, next);
    });
};

// 토큰 검증 미들웨어
export const authMw = async (ctx:any, next:any) => {
  const authHeader = ctx.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    ctx.status = 401;
    ctx.body = { message: '토큰이 없습니다.' };
    return;
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    ctx.state.user = decoded; // 유저 정보를 ctx.state에 저장해서 다음 미들웨어/컨트롤러에서 사용 가능
    await next();   // 다음 미들웨어 or 컨트롤러로 넘어감
  } catch (e) {
    ctx.status = 403;
    ctx.body = { message: '유효하지 않은 토큰입니다.' };
  }
};

// 권한 검증 미들웨어
export const RoleMw = (requiredRoles: string[]): Middleware => {
    return async (ctx, next) => {
      const user = ctx.state.user;
  
      if (!user) {
        ctx.status = 401;
        ctx.body = { message: '인증되지 않은 사용자입니다.' };
        return;
      }
  
      if (!requiredRoles.includes(user.role)) {
        ctx.status = 403;
        ctx.body = { message: `해당 API는 (${requiredRoles.join(', ')}) 권한이 필요합니다.` };
        return;
      }
  
      await next(); // 권한이 일치하면 다음으로 넘어감
    };
  };