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

// BNB
bnb.post('/', upload.array('images', 10), bnbCtrl.insertRoom);
bnb.get('/', bnbCtrl.selectRooms);

bnb.get('/detail', bnbCtrl.selectRoomDetail);
bnb.post('/favorite', bnbCtrl.toggleFavoriteRoom);
bnb.get('/codes', bnbCtrl.selectCodes);
bnb.post('/review', bnbCtrl.insertReview);
bnb.get('/review', bnbCtrl.selectReviews);

export default bnb;