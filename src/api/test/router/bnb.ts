import Router from 'koa-router';
import * as bnbCtrl from 'api/test/controller/bnb.ctrl';
import multer from '@koa/multer';

const storage = multer.diskStorage({
    destination: 'public/uploads/',
    filename: (req:any, file:any, cb:any) => {
      cb(null, Date.now() + '-' + file.originalname);
    },
});

const upload = multer({ storage });

const bnb = new Router();

// 숙박업소 신규 등록
bnb.post('/', upload.array('images', 10), bnbCtrl.insertRoom);

// 숙박업소 목록 조회
bnb.get('/', bnbCtrl.selectRooms);

// 숙박업소 상세 조회
bnb.get('/detail', bnbCtrl.selectRoomDetail);

// 숙박업소 즐겨찾기 토글
bnb.post('/favorite', bnbCtrl.toggleFavoriteRoom);

// 코드 목록 조회
bnb.get('/codes', bnbCtrl.selectCodes);

// 리뷰 등록
bnb.post('/review', bnbCtrl.insertReview);

// 리뷰 목록 조회
bnb.get('/review', bnbCtrl.selectReviews);

// 예약 등록
bnb.post('/booking', bnbCtrl.insertBooking);

// 예약 상세 조회
bnb.get('/booking/detail', bnbCtrl.selectBookingDetail);

// 예약 상태 수정
bnb.patch('/booking/status', bnbCtrl.updateBookingStatus);

// 예약 목록 조회
bnb.get('/booking', bnbCtrl.selectBookings);

export default bnb;