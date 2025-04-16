import { checkEmailService, getUserByEmail, insertBookingService, insertReviewService, insertRoomService, selectBookingDetailService, selectBookingsService, selectCodesService, selectReviewsService, selectRoomDetailService, selectRoomsService, signupService, toggleFavoriteRoomService, updateBookingStatusService } from '../service/bnb.srvc';
import { Context } from 'koa';
import { File } from '@koa/multer';
import bcrypt from 'bcryptjs';
import { generateRefreshToken } from '@utils/auth/jwt';
import { generateAccessToken } from '@utils/auth/jwt';
import jwt from 'jsonwebtoken';

// 숙박업소 신규 등록
export const insertRoom = async (ctx:Context, next : () => void) => {
    const files = ctx.request.files as File[]; // 이미지들
    const body = ctx.request.body; // post,put 이런애들은 바디에 붙어와서
    const user = ctx.state.user;
    const result = await insertRoomService(body, files, user);
    ctx.body = result;
}

// 숙박업소 목록 조회
export const selectRooms = async (ctx:any, next : () => void) => {
    const { page, limit, search } = ctx.query;
    const user = ctx.state.user;
    const result = await selectRoomsService(user, page, limit, search);
    ctx.body = result;
}

// 숙박업소 상세 조회
export const selectRoomDetail = async (ctx:any, next : () => void) => {
    const { id } = ctx.query; // get, delete 이런 애들은 url?param=파라미터 << 요렇게 붙어 오기 때문에 
    const result = await selectRoomDetailService(id);
    ctx.body = result;
}

// 숙박업소 즐겨찾기 토글
export const toggleFavoriteRoom = async (ctx:any, next : () => void) => {
    const body = ctx.request.body; // post,put 이런애들은 바디에 붙어와서
    const user = ctx.state.user;
    const result = await toggleFavoriteRoomService(body, user);
    ctx.body = result;
}

// 코드 목록 조회
export const selectCodes = async (ctx:any, next : () => void) => {
    const { code_group_id } = ctx.query; // get, delete 이런 애들은 url?param=파라미터 << 요렇게 붙어 오기 때문에 
    const result = await selectCodesService(code_group_id);
    ctx.body = result;
}

// 리뷰 등록
export const insertReview = async (ctx:any, next : () => void) => {
    const body = ctx.request.body; // post,put 이런애들은 바디에 붙어와서
    const user = ctx.state.user;
    const result = await insertReviewService(body, user);
    ctx.body = result;
}

// 리뷰 목록 조회
export const selectReviews = async (ctx:any, next : () => void) => {
    const { room_id } = ctx.query; // get, delete 이런 애들은 url?param=파라미터 << 요렇게 붙어 오기 때문에 
    const result = await selectReviewsService(room_id);
    ctx.body = result;
}

// 예약 등록
export const insertBooking = async (ctx:any, next : () => void) => {
    const body = ctx.request.body; // post,put 이런애들은 바디에 붙어와서
    const user = ctx.state.user;
    const result = await insertBookingService(body, user);
    ctx.body = result;
}

// 예약 상세 조회
export const selectBookingDetail = async (ctx:any, next : () => void) => {
    const { booking_id } = ctx.query; // get, delete 이런 애들은 url?param=파라미터 << 요렇게 붙어 오기 때문에 
    const result = await selectBookingDetailService(booking_id);
    ctx.body = result;
}

// 예약 상태 수정
export const updateBookingStatus = async (ctx:any, next : () => void) => {
    const { booking_id, status } = ctx.request.body;
    const result = await updateBookingStatusService(booking_id, status);
    ctx.body = result;
}

// 예약 목록 조회
export const selectBookings = async (ctx:any, next : () => void) => {
    const { page, limit, search, status, sort } = ctx.query;
    const user = ctx.state.user;
    const result = await selectBookingsService(user, page, limit, search, status, sort);
    ctx.body = result;
}

// 이메일 중복 체크
export const checkEmail = async (ctx:any, next : () => void) => {
    const { email } = ctx.query;
    const result = await checkEmailService(email);
    ctx.body = result;
}

// 회원가입
export const signup = async (ctx:any, next : () => void) => {
    const { name, email, password } = ctx.request.body;
    const hashedPwd = await bcrypt.hash(password, 10);
    const result = await signupService({name, email, password:hashedPwd});
    ctx.body = result;
}

// 로그인
export const login = async (ctx:any, next : () => void) => {
    const { email, password } = ctx.request.body;
    const user = await getUserByEmail(email);
    if (!user) {
        ctx.status = 401;
        ctx.body = { message: '사용자를 찾을 수 없습니다.' };
        return;
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        ctx.status = 401;
        ctx.body = { message: '비밀번호가 틀렸습니다.' };
        return;
    }

    const accessToken = generateAccessToken({ id: user.id, name: user.name, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id });

    ctx.cookies.set('refreshToken', refreshToken, {
        httpOnly: true,
        sameSite: 'None',
        secure: process.env.NODE_ENV === 'REMOTE',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7일
    })

    ctx.body = { accessToken, message: '로그인이 성공적으로 완료되었습니다.' };
}

// 토큰 재발급
export const refreshToken = async (ctx:any, next : () => void) => {
    const refreshToken = ctx.cookies.get('refreshToken');

    if (!refreshToken) {
        ctx.status = 401;
        ctx.body = { message: 'refreshToken이 없습니다.' };
        return;
    }

    try {
        const SECRET = process.env.JWT_SECRET || 'secret';
        const payload = jwt.verify(refreshToken, SECRET) as jwt.JwtPayload;
        const newAccessToken = generateAccessToken({ id: payload.id, name: payload.name, email: payload.email, role: payload.role });
        ctx.body = { accessToken: newAccessToken };
    } catch (err) {
        ctx.status = 403;
        ctx.body = { message: 'refreshToken이 유효하지 않음' };
    }
}