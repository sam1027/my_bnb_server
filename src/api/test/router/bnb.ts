import Router from 'koa-router';
import * as bnbCtrl from 'api/test/controller/bnb.ctrl';
import multer from '@koa/multer';

const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req:any, file:any, cb:any) => {
      cb(null, Date.now() + '-' + file.originalname);
    },
});

const upload = multer({ storage });

const bnb = new Router();

// BNB
bnb.post('/', upload.array('images', 10), bnbCtrl.insertRoom);
bnb.get('/', bnbCtrl.selectRooms);

export default bnb;