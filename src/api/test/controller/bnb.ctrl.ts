import { insertBookingService, insertReviewService, insertRoomService, selectBookingDetailService, selectCodesService, selectReviewsService, selectRoomDetailService, selectRoomsService, toggleFavoriteRoomService, updateBookingStatusService } from '../service/bnb.srvc';
import { Context } from 'koa';
import { File } from '@koa/multer';

export const insertRoom = async (ctx:Context, next : () => void) => {
    const files = ctx.request.files as File[]; // 이미지들
    const body = ctx.request.body; // post,put 이런애들은 바디에 붙어와서
    const result = await insertRoomService(body, files);
    ctx.body = result;
}

export const selectRooms = async (ctx:any, next : () => void) => {
    const result = await selectRoomsService();
    ctx.body = result;
}

export const selectRoomDetail = async (ctx:any, next : () => void) => {
    const { id } = ctx.query; // get, delete 이런 애들은 url?param=파라미터 << 요렇게 붙어 오기 때문에 
    const result = await selectRoomDetailService(id);
    ctx.body = result;
}

export const toggleFavoriteRoom = async (ctx:any, next : () => void) => {
    const body = ctx.request.body; // post,put 이런애들은 바디에 붙어와서
    const result = await toggleFavoriteRoomService(body);
    ctx.body = result;
}

export const selectCodes = async (ctx:any, next : () => void) => {
    const { code_group_id } = ctx.query; // get, delete 이런 애들은 url?param=파라미터 << 요렇게 붙어 오기 때문에 
    const result = await selectCodesService(code_group_id);
    ctx.body = result;
}

export const insertReview = async (ctx:any, next : () => void) => {
    const body = ctx.request.body; // post,put 이런애들은 바디에 붙어와서
    const result = await insertReviewService(body);
    ctx.body = result;
}

export const selectReviews = async (ctx:any, next : () => void) => {
    const { room_id } = ctx.query; // get, delete 이런 애들은 url?param=파라미터 << 요렇게 붙어 오기 때문에 
    const result = await selectReviewsService(room_id);
    ctx.body = result;
}

export const insertBooking = async (ctx:any, next : () => void) => {
    const body = ctx.request.body; // post,put 이런애들은 바디에 붙어와서
    const result = await insertBookingService(body);
    ctx.body = result;
}

export const selectBookingDetail = async (ctx:any, next : () => void) => {
    const { booking_id } = ctx.query; // get, delete 이런 애들은 url?param=파라미터 << 요렇게 붙어 오기 때문에 
    const result = await selectBookingDetailService(booking_id);
    ctx.body = result;
}

export const updateBookingStatus = async (ctx:any, next : () => void) => {
    const { booking_id, status } = ctx.request.body;
    const result = await updateBookingStatusService(booking_id, status);
    ctx.body = result;
}