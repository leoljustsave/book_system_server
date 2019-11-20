const router = require("koa-router");
const file = require("../utils/file");
const model = require("../utils/model");
const path = require("path");
const config = require("../config");

const route = new router();
const MBook = model.getModel("book");
const env = config.env.lizhi;

// 对特定书籍执行操作前要先进行 id 判空
route.all("/book", async (ctx, next) => {
  const { id } = ctx.request.query;
  const { body } = ctx.request;

  // if (!id) {
  //   ctx.body = {
  //     code: 0,
  //     msg: "we need an id"
  //   };
  //   return false;
  // }
  ctx.id = id;

  // 过滤 body 属性字段
  let info = {};
  for (key in body) {
    console.log(key);
    if (config.bookCanConfig.indexOf(key) + 1) {
      info.key = body.key;
    }
  }
  ctx.info = info;

  next();
});

// 获取书籍
route.get("/book", async (ctx, next) => {
  const { id } = ctx;
  try {
    const bookRes = await MBook.findById(id);
    ctx.body = bookRes;
  } catch (e) {
    ctx.body = {
      code: 1,
      msg: "do not have this book"
    };
  }
});

// 上传书籍
route.post("/book", async (ctx, next) => {
  const { book, cover } = ctx.request.files;
  const { info } = ctx;

  // 获取书籍 md5 信息
  const bookMd5 = file.getFileMd5(book.path);

  // 非必要书籍属性的默认值
  const defBookInfo = {
    name: book.name.replace(/.epub$/, ""),
    author: "unknow",
    press: "unknow",
    catalog: [],
    class: [],
    like: 0,
    collect: 0,
    path: "",
    cover: "",
    md5: bookMd5
  };

  // 书籍文件存储
  // TODO: 获取上传文件后缀
  const bookFileOption = {
    filepath: path.join(env.put, "/book"),
    filename: `${bookMd5}${path.book.path}`
  };
  const bookPath = path.join(env.put, `/book/${bookMd5}.epub`);

  // 若书籍存在则不进行存储操作 直接使用文件
  const findRes = await MBook.findOne({ md5: bookMd5 });
  ctx.body = {
    res: findRes
  };
  return false;

  if (!file.fileExist(bookPath)) {
    console.log("save book");
    const bookRes = await file.putFile(book, bookFileOption);
    defBookInfo.path = `${env.get}/book/${bookMd5}`;

    // 书籍封面文件存储
    const coverFileOption = {
      filepath: path.join(env.put, "/book/cover"),
      filename: `${bookMd5}.jpg`
    };
    const coverRes = await file.putFile(cover, coverFileOption);
    defBookInfo.cover = `${env.get}/book/cover/${coverFileOption.filename}`;
  } else {
    defBookInfo.path = bookPath;
    defBookInfo.cover = path.join(env.put, `/book/cover/${bookMd5}.jpg`);
  }

  // 信息整合
  const bookInfo = Object.assign({}, info, defBookInfo);

  // 数据库存储处理
  const bookStoreRes = await MBook.create(bookInfo);

  ctx.body = { res: bookStoreRes };
  return false;
});

// 修改书籍信息
route.patch("/book", async (ctx, next) => {
  const { id } = ctx;
  const { info } = ctx;

  // 执行更新操作
  const updateRes = await MBook.findOneAndUpdate({ _id: id }, info);

  ctx.body = updateRes;
});

// 删除书籍及其信息
route.delete("/book", async (ctx, next) => {
  const { id } = ctx;

  const bookRes = await MBook.findOne({ _id: id });
  const bookRealPath = bookRes.path.replace(env.get, env.put);
  const coverRealPath = bookRes.cover.replace(env.get, env.put);

  // TODO: 逻辑整理
  // 执行删除书籍以及书籍封面
  let flag = { file: true, data: true };
  flag.file =
    (await file.delFile(bookRealPath)) && (await file.delFile(coverRealPath));

  // 删除数据库中的信息
  flag.data = await MBook.findOneAndDelete({ _id: bookRes._id });

  ctx.body = flag;
});

module.exports = route;
