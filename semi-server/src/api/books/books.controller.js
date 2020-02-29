const Joi = require('joi');
const {Types: {ObjectId}} = require('mongoose');
// <=> const ObjectId = require('mongoose').Types.ObjectId
const Book = require('models/book');

exports.create = async (ctx) => {
    // request body 에서 값들을 추출합니다
    const { 
        title, 
        authors, 
        publishedDate, 
        price, 
        tags 
    } = ctx.request.body;

    // Book 인스턴스를 생성합니다
    const book = new Book({
        title, 
        authors,
        publishedDate,
        price,
        tags
    });

    // 만들어진 Book 인스턴스를, 이렇게 수정 할 수도 있습니다.
    // book.title = title;

    //.save() 함수를 실행하면 이 때 데이터베이스에 실제로 데이터를 작성합니다.
    // Promise 를 반환합니다.
    try {
        await book.save();
    } catch(e) {
        // HTTP 상태 500 와 Internal Error 라는 메시지를 반환하고, 
        // 에러를 기록합니다.
        return ctx.throw(500, e);
    }

    // 저장한 결과를 반환합니다.
    ctx.body = book;
};


// 이렇게 데이터를 요청하는 것을 쿼리라고 함
exports.list = async (ctx) => {
    let books;

    try{ // exec을 해야 실제 데이터베이스에 요청 가능하며 promise인 반환값은 await사용가능
        books = await Book.find()
            .sort({_id: -1}) // id의 역순으로 sorting
            .limit(3) // 3개로 제한
            .exec();
    } catch (e){
        return ctx.throw(500, e);
    }

    ctx.body = books;
};

exports.get = async (ctx) => {
    const {id} = ctx.params; //url 파라미터에서 id값을 읽어오는 것
    let book;
    try {
        book = await Book.findById(id).exec();
    } catch (e){
        if(e.name === 'CastError'){
            ctx.status = 400;
            return;
        }
        return ctx.throw(500, e);
    }

    if(!book){
        ctx.status = 404;
        ctx.body = {message: 'book not found'};
        return;
    }

    ctx.body = book;

};

exports.delete = async (ctx) => {
    const {id} = ctx.params;
    try{
        await Book.findByIdAndRemove(id).exec();
    } catch (e){
        if(e.name === 'CastError'){
            ctx.status = 400;
            return;
        }
    }
    ctx.body = '204';
};

exports.replace = async (ctx) => {
    const  {id}  = ctx.params;

    if(!ObjectId.isValid(id)){
        ctx.status = 400;
        return;
    }

    // validate할 스키마들
    const schema = Joi.object().keys({
        title:  Joi.string().required(),
        authors: Joi.array().items(Joi.object().keys({
            name: Joi.string().required(),
            email: Joi.string().email().required()
        })),
        publishedDate: Joi.date().required(),
        price: Joi.number().required(),
        tags: Joi.array().items((Joi.string()).required())

    });

    const result = Joi.validate(ctx.request.body, schema);

    if(result.error){
        ctx.status = 400;
        ctx.body = result.error;
        return;
    }

    let book;

    try {
        book = await Book.findByIdAndUpdate(id, ctx.request.body, {
            upsert: true,
            new: true
        });
    } catch(e){
        return ctx.throw(500, e);
    }
    ctx.body = book;

};
exports.update = async (ctx) => {
    const {id} = ctx.params;
    if(!ObjectId.isValid(id)){
        ctx.status = 400;
        return;
    }
    let book;
    try{
        book = await Book.findByIdAndUpdate(id, ctx.request.body, {
            new: true // 업데이트 후의 반환값을 나타내주게끔. upsert는 default가 false다.
        });
    } catch (e){
        return ctx.throw(500, e);
    }
    ctx.body = book;
};