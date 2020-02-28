const Router = require('koa-router');

const books = new Router();

const handler = (ctx, next) => {
    ctx.body = `${ctx.request.method} ${ctx.request.path}`;
};

books.get('/', handler);
books.post('/', handler);
books.delete('/', handler);
books.put('/', handler);
books.patch('/', handler);

module.exports = books;