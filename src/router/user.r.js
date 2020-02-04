// node
const file = require("../utils/file");
const path = require("path");

// koa
const router = require("koa-router");

// util
const config = require("../config");
const model = require("../utils/model");
const moment = require("moment");

const route = new router();
const env = config.env.lizhi;
const MUser = model.getModel("user");
const MBook = model.getModel("book");
const MArticle = model.getModel("article");

/**
 * 用户登录
 * 0 - 登录成功
 * 1 - 参数缺失
 * 2 - 用户不存在
 * 3 - 密码错误
 */
route.post("/user/login", async ctx => {
  const { account, password } = ctx.request.body;
  if (!(account && password)) {
    return (ctx.body = {
      code: 1,
      msg: "参数不对"
    });
  }

  userRes = undefined;

  try {
    userRes = await MUser.findOne({ account: account });
  } catch (err) {
    userRes = undefined;
  }

  if (!userRes) {
    return (ctx.body = {
      code: 2,
      msg: "用户不存在"
    });
  }

  if (userRes.password !== password) {
    return (ctx.body = {
      code: 3,
      msg: "密码错误"
    });
  }

  global.token = userRes._id;
  return (ctx.body = {
    code: 0,
    msg: "登录成功",
    token: userRes._id
  });
});

/**
 * 获取用户信息
 * 0 - 获取用户信息成功
 * 1 - token 与登录用户不一致
 * 2 - token 不存在
 */
route.get("/user", async ctx => {
  const { token } = ctx.request.headers;

  // TODO: 坑 ?
  // if (`${token}` !== `${global.token}`) {
  // 	console.log('登录用户为: ', global.token, '请求用户为: ', token);
  // 	return (ctx.body = {
  // 		code: 1,
  // 		msg: "token 与登录用户不一致"
  // 	});
  // }

  const userRes = await MUser.findById(token);
  // 该 token 不存在
  if (!userRes) {
    return (ctx.body = {
      code: 401,
      msg: "token 不存在"
    });
  }

  // 过滤重要信息
  let { password, _id, ...data } = userRes._doc;
  ctx.body = {
    code: 0,
    msg: "获取用户信息成功",
    data: data
  };
});

/**
 * 用户注册
 * 0 - 注册成功
 * 1 - 参数缺失
 * 2 - 账号已存在
 */
route.post("/user", async ctx => {
  const { body, files } = ctx.request;
  const { avatar } = files;

  // TODO: 验证必要数据
  const { account, password } = body;
  if (!(account && password)) {
    return (ctx.body = {
      code: 1,
      msg: "参数缺失"
    });
  }

  const findRes = await MUser.findOne({ account });
  if (findRes) {
    return (ctx.body = {
      code: 2,
      msg: "该账号已存在"
    });
  }

  const defUserInfo = {
    avatar: "",
    readSet: {}
  };

  avatar.name = `${avatar.name}.jpg`;

  // 头像文件存储
  const avatarName = await file.commonFileSave(
    avatar,
    path.join(env.put, "/user/avatar")
  );
  defUserInfo.avatar = `${env.get}/user/avatar/${avatarName}`;

  // 整合数据
  // TODO: 数据加密
  const userInfo = Object.assign({}, body, defUserInfo);

  // TODO: 存储数据库, 返回 user 的 token
  const userRes = await MUser.create(userInfo);

  global.token = userRes._id;
  return (ctx.body = { code: 0, msg: "用户注册成功", token: userRes._id });
});

/**
 * 用户信息修改
 * 1 - token 与登录用户不一致
 * 2 - 不存在该用户
 */
route.patch("/user", async ctx => {
  const { token } = ctx.request.headers;

  // TODO: 坑 ?
  // 验证是否和登录用户的 token 一致
  // if (`${token}` !== `${global.token}`) {
  // 	console.log('登录用户为: ', global.token, '请求用户为: ', token);
  // 	return (ctx.body = {
  // 		code: 1,
  // 		msg: "token 与登录用户不一致"
  // 	});
  // }

  const userRes = MUser.findById(token);

  if (!userRes) {
    return (ctx.body = {
      code: 2,
      msg: "不存在该用户"
    });
  }

  const { body, files } = ctx.request;

  // 需要修改的数据
  const info = {};

  // 过滤信息
  for (key in body) {
    if (config.userCanConfig.includes(key)) {
      info[key] = body[key];
    }
  }

  // 是否有需要修改的头像信息
  if (files.avatar) {
    const { avatar } = files;
    const avatarName = await file.commonFileSave(
      avatar,
      path.join(env.put, "/user/avatar")
    );
    info.avatar = `${env.get}/user/avatar/${avatarName}`;
  }

  // 判断是否有信息要修改
  if (JSON.stringify(info) === "{}") {
    return (ctx.body = {
      code: 0,
      msg: "没有需要修改的信息"
    });
  }

  // TODO: 通过 token 查找信息 , 然后进行信息修改
  await MUser.findByIdAndUpdate(token, info);

  ctx.body = {
    code: 0,
    msg: "更新成功"
  };
});

// 用户收藏书籍
route.patch("/user/collect", async ctx => {
  let { token } = ctx.request.headers;
  let { bookId, type } = ctx.request.body;

  if (!token) {
    return (ctx.body = { code: 401 });
  }

  let userDoc = await MUser.findById(token);

  // 0 - 去除; 1 - 添加
  if (!userDoc.collectBook.includes(bookId) && type) {
    userDoc.collectBook.push(bookId);
  } else if (!type) {
    userDoc.collectBook.pull(bookId);
  }

  await userDoc.save();

  ctx.body = {
    code: 0,
    msg: "success"
  };
});

// 用户点赞书籍
route.patch("/user/like", async ctx => {
  let { token } = ctx.request.headers;
  let { bookId, type } = ctx.request.body;

  if (!token) {
    return (ctx.body = { code: 401 });
  }

  let userDoc = await MUser.findById(token);

  // 0 - 去除; 1 - 添加
  if (!userDoc.likeBook.includes(bookId) && type) {
    userDoc.likeBook.push(bookId);
  } else if (!type) {
    userDoc.likeBook.pull(bookId);
  }

  await userDoc.save();

  ctx.body = {
    code: 0,
    msg: "success"
  };
});

// 用户阅读该书籍
route.patch("/user/readSet", async ctx => {
  let { token } = ctx.request.headers;
  let { setting } = ctx.request.body;

  if (!token) {
    return (ctx.body = { code: 401 });
  }

  let userDoc = await MUser.findById(token);
  userDoc.readSet = Object.assign({}, userDoc.readSet, setting);

  await userDoc.save();

  ctx.body = {
    code: 0,
    msg: "success"
  };
});

// 用户收藏书籍信息
route.get("/user/collection", async ctx => {
  const { token } = ctx.request.headers;
  let res = [];

  if (!token) {
    return (ctx.body = {
      code: 401
    });
  }

  const user = await MUser.findById(token);
  const collection = user.collectBook;
  const read = user.readBook;

  res = await Promise.all(
    collection.map(async collect => {
      // 根据 bookId 通过 Book 数据库查找
      let collectRes = await MBook.findById(collect);
      let { _id, name, cover, author } = collectRes;
      let readRecord = read.filter(item => item._id === collect);
      readRecord = readRecord[0];

      return {
        percent: readRecord.percent,
        date: readRecord.date,
        _id,
        name,
        cover,
        author
      };
    })
  );

  ctx.body = {
    code: 0,
    data: res
  };
});

// 获取用户阅读记录
route.get("/user/readHistory", async ctx => {
  const { token } = ctx.request.headers;
  let res = [];

  if (!token) {
    return (ctx.body = {
      code: 401
    });
  }

  const user = await MUser.findById(token);
  const readBook = user.readBook;

  res = await Promise.all(
    readBook.map(async item => {
      let id = item._id;
      let bookRes = await MBook.findById(id, {
        _id: 1,
        name: 1,
        cover: 1,
        author: 1
      });
      bookRes.percent = item.percent;
      bookRes.date = item.date;

      return bookRes;
    })
  );

  ctx.body = {
    code: 0,
    data: res
  };
});

// 获取用户写的读后感
route.get("/user/article", async ctx => {
  const { token } = ctx.request.headers;
  let res = [];

  if (!token) {
    return (ctx.body = {
      code: 401
    });
  }

  let articleRes = await MArticle.find({ authorId: token });

  ctx.body = {
    code: 0,
    data: articleRes
  };
});

// 更新用户阅读记录
route.patch("/user/updateRecord", async ctx => {
  const { token } = ctx.request.headers;
  const { bookId, cfi, percent } = ctx.request.body;

  if (!token) {
    return (ctx.body = {
      code: 0
    });
  }

  let userDoc = await MUser.findById(token);
  if (!userDoc) {
    return (ctx.body = {
      code: 0
    });
  }

  let temp = userDoc.readBook.map(item => {
    if (item._id === bookId) {
      item.cfi = cfi;
      item.percent = percent;
      item.date = moment().format("YYYY-MM-DD");
    }
    return item;
  });

  // TODO: 喵喵喵 ?
  // 直接保存会无效 和内部机制有关 ?
  userDoc.readBook = [];
  userDoc.readBook = temp;

  await userDoc.save();

  ctx.body = {
    code: 0,
    msg: "success"
  };
});

module.exports = route;
