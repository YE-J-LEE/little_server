require('dotenv').config();

const Koa = require('koa');
const Router = require('koa-router');

const app = new Koa();
const router = new Router();
const api = require('./api');

const mongoose = require('mongoose');
const bodyParser = require('koa-bodyparser');

mongoose.Promise = global.Promise; // node의 프로미스를 사용

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(
    (response) => {
        console.log('Successfully connected to mongodb');
    }
).catch(e => {
    console.error(e);
});


const port = process.env.PORT || 4000;

app.use(bodyParser()); // json 객체 사용 가능   

router.use('/api', api.routes());


// 미들웨어 등록
app.use(router.routes()).use(router.allowedMethods());


app.listen(port, () =>{
    console.log('semi-server is listening to port 4000');
});