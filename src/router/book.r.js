const router = require("koa-router");
const file = require("../utils/file");
const model = require("../utils/model");
const path = require("path");
const config = require("../config");

const route = new router();
const MBook = model.getModel("book");
const MCover = model.getModel("cover");
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
  await next();
});

// 获取书籍
route.get("/book", async (ctx, next) => {
  const { id } = ctx;
  try {
    const bookRes = await MBook.findById(id);
    if (bookRes) {
      ctx.body = {
        code: 0,
        msg: "get book success"
      };
    } else {
      ctx.body = {
        code: 0,
        msg: "no this book"
      };
    }
  } catch (e) {
    ctx.body = {
      code: 1,
      msg: "get book error"
    };
  }
});

// 上传书籍
route.post("/book", async (ctx, next) => {
  const { book, cover } = ctx.request.files;
  const { info } = ctx;
  const bookExt = path.extname(book.name);
  const coverExt = path.extname(cover.name);

  // 获取书籍 / 封面的 md5 信息
  const bookMd5 = file.getFileMd5(book.path);
  const coverMd5 = file.getFileMd5(cover.path);

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

  // 若书籍存在则不进行存储操作 直接使用文件
  // TODO: 同一用户重复上传
  const findBookRes = await MBook.findOne({ md5: bookMd5 });
  const findCoverRes = await MCover.findOne({ md5: coverMd5 });

  if (!findCoverRes) {
    console.log("save cover");

    // 书籍封面文件存储
    const coverMd5Name = `${coverMd5 + coverExt}`;
    const coverFileOption = {
      filepath: path.join(env.put, "/book/cover"),
      filename: coverMd5Name
    };
    await file.putFile(cover, coverFileOption);
    await MCover.create({ name: cover.name, path: "", md5: coverMd5 });
    defBookInfo.cover = `${env.get}/book/cover/${coverMd5Name}`;
  } else {
    defBookInfo.cover = findCoverRes.path;
  }

  if (!findBookRes) {
    console.log("save book");

    // 书籍文件存储
    const bookMd5Name = `${bookMd5 + bookExt}`;
    const bookFileOption = {
      filepath: path.join(env.put, "/book"),
      filename: bookMd5Name
    };
    await file.putFile(book, bookFileOption);
    defBookInfo.path = `${env.get}/book/${bookMd5Name}`;

    // 书籍封面文件存储
    const coverMd5Name = `${coverMd5 + coverExt}`;
    const coverFileOption = {
      filepath: path.join(env.put, "/book/cover"),
      filename: coverMd5Name
    };
    await file.putFile(cover, coverFileOption);
    defBookInfo.cover = `${env.get}/book/cover/${coverMd5Name}`;
  } else {
    defBookInfo.path = findBookRes.path;
  }

  // 数据库存储处理
  const bookInfo = Object.assign({}, info, defBookInfo);
  const bookStoreRes = await MBook.create(bookInfo);

  ctx.body = { code: 0, msg: "save success" };
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
