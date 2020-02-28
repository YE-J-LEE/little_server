const Koa = require('koa');
const Router = require('koa-router');

const app = new Koa();
const router = new Router();
const api = require('./api');

router.use('/api', api.routes());


// 미들웨어 등록
app.use(router.routes()).use(router.allowedMethods());


app.listen(4000, () =>{
    console.log('semi-server is listening to port 4000');
});