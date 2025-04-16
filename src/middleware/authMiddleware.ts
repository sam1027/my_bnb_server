import multer from '@koa/multer';
import { Context, Middleware, Next } from 'koa';
import { verifyToken } from '@utils/auth/jwt';
import { StateWithUser } from '@utils/type/auth';
import { selectCodesService } from '@api/test/service/bnb.srvc';
const storage = multer.diskStorage({
    destination: 'public/uploads/',
    filename: (req:any, file:any, cb:any) => {
      cb(null, Date.now() + '-' + file.originalname);
    },
});

const upload = multer({ storage });

export const multerToKoa = (multerMiddleware: any) => {
  return async (ctx: Context, next: Next) => {
    await new Promise<void>((resolve, reject) => {
      multerMiddleware(ctx.req, ctx.res, (err: any) => {
        if (err) return reject(err);
        resolve();
      });
    });
    await next();
  };
};

// 토큰 검증 미들웨어
export const authMw: Middleware<StateWithUser> = async (ctx: any, next: any)=> {
  const authHeader = ctx.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    ctx.status = 401;
    ctx.body = { message: '토큰이 없습니다.' };
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token); // 토큰만 검증
    ctx.state.user = decoded;
  } catch (e) {
    ctx.status = 401;
    ctx.body = { message: '유효하지 않은 토큰입니다.' };
    return;
  }

  await next(); // 내부 오류는 개별적으로 처리됨
};

// 토큰 검증 미들웨어(선택적) - 비로그인시 튕겨내지 않음
export const optionalAuthMw: Middleware<StateWithUser> = async (ctx: any, next: any) => {
  const authHeader = ctx.headers['authorization'];

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = verifyToken(token);
      ctx.state.user = decoded; // 로그인된 경우만 저장
    } catch (e) {
      // 토큰이 잘못된 경우엔 무시 (에러 던지지 않음)
      ctx.state.user = null;
    }
  } else {
    ctx.state.user = null;
  }

  await next(); // 계속 진행
};

// 권한 검증 미들웨어
const roleMw = (requiredRoles: string[]): Middleware<StateWithUser> => {
    return async (ctx, next) => {
      const user = ctx.state.user;
  
      if (!user) {
        ctx.status = 401;
        ctx.body = { message: '인증되지 않은 사용자입니다.' };
        return;
      }
  
      if (!requiredRoles.includes(user.role)) {
        const roleNames = await Promise.all(
          requiredRoles.map(async (r) => {
            const codes = await selectCodesService('SITE_ROLE', r);
            return codes[0]?.code_name;
          })
        );
        
        ctx.status = 403;
        ctx.body = { message: `해당 기능은 [${roleNames.join(', ')}] 권한이 필요합니다.` };
        return;
      }
  
      await next(); // 권한이 일치하면 다음으로 넘어감
    };
};

// 토큰 검증 및 파일 업로드 미들웨어 조합 함수
export const authAndUpload = [
  authMw,
  multerToKoa(upload.array('images', 10)),
];

export const onlyAdmin: Middleware<StateWithUser>[] = [authMw, roleMw(['ROLE_ADMIN'])];

export const onlyGuest: Middleware<StateWithUser>[] = [authMw, roleMw(['ROLE_GUEST'])];

export const onlyHost: Middleware<StateWithUser>[] = [authMw, roleMw(['ROLE_HOST'])];