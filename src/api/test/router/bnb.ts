import { authAndUpload, authMw, onlyGuest, optionalAuthMw } from './../../../middleware/authMiddleware';
import Router from 'koa-router';
import * as bnbCtrl from 'api/test/controller/bnb.ctrl';
import { StateWithUser } from '@utils/type/auth';
import { DefaultContext } from 'koa';

const bnb = new Router<StateWithUser, DefaultContext>();

// 숙박업소 신규 등록
bnb.post('/', ...authAndUpload, bnbCtrl.insertRoom);

// 숙박업소 목록 조회
bnb.get('/', optionalAuthMw, bnbCtrl.selectRooms);

// 숙박업소 상세 조회
bnb.get('/detail', bnbCtrl.selectRoomDetail);

// 숙박업소 즐겨찾기 토글
bnb.post('/favorite', authMw, bnbCtrl.toggleFavoriteRoom);

// 코드 목록 조회
bnb.get('/codes', bnbCtrl.selectCodes);

// 리뷰 등록
bnb.post('/review', authMw, bnbCtrl.insertReview);

// 리뷰 목록 조회
bnb.get('/review', bnbCtrl.selectReviews);

// 예약 등록
bnb.post('/booking', authMw, bnbCtrl.insertBooking);

// 예약 상세 조회
bnb.get('/booking/detail', authMw, bnbCtrl.selectBookingDetail);

// 예약 상태 수정
bnb.patch('/booking/status', authMw, bnbCtrl.updateBookingStatus);

// 예약 목록 조회
bnb.get('/booking', authMw, bnbCtrl.selectBookings);

// 이메일 중복 체크
bnb.get('/auth/check/email', bnbCtrl.checkEmail);

// 회원 가입
bnb.post('/auth/signup', bnbCtrl.signup);

// 로그인
bnb.post('/auth/login', bnbCtrl.login);

// 토큰 재발급
bnb.post('/auth/refresh', bnbCtrl.refreshToken);

// 로그아웃
// bnb.post('/auth/logout', authMw, bnbCtrl.logout);

// 회원 정보 조회
// bnb.get('/auth/info', authMw, bnbCtrl.getAccountInfo);


export default bnb;