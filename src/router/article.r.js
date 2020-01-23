const router = require("koa-router");
const model = require("../utils/model");
const url = require("url");
const queryString = require("query-string");

const route = new router();
const MBook = model.getModel("book");
const MUser = model.getModel("user");
const MArticle = model.getModel("article");
const MArticleData = model.getModel("articleData");

// 获取文章列表
route.get("/article", async ctx => {
  const query = queryString.parse(url.parse(ctx.request.url).search);
  let pageSize = +query.pageSize || 20;

  // 获取指定数量文章
  const articleRes = await MArticle.find({})
    .limit(pageSize)
    .sort({ time: -1 });

  ctx.body = {
    code: 0,
    msg: "获取成功",
    data: articleRes
  };
});

/**
 * 获取具体文章内容信息
 * 0 - 获取成功
 * 1 - 参数缺失
 * 2 - 获取文章出错
 * 3 - 文章不存在
 */
route.get("/article/:id", async ctx => {
  const { id } = ctx.params;

  let articleRes;
  let contentRes;

  try {
    articleRes = await MArticle.findById(id);
    if (!articleRes) {
      return (ctx.body = {
        code: 3,
        msg: "文章不存在"
      });
    }

    contentRes = await MArticleData.findById(articleRes.articleId);
    if (!contentRes) {
      return (ctx.body = {
        code: 3,
        msg: "文章不存在"
      });
    }
  } catch (e) {
    return (ctx.body = {
      code: 2,
      msg: "获取文章出错"
    });
  }

  ctx.body = {
    code: 0,
    msg: "文章获取成功",
    data: { article: articleRes, content: contentRes }
  };
});

/**
 * 添加文章
 * 0 - 添加成功
 * 1 - 参数缺失
 * 2 - 不存在该书籍
 * 3 - 不存在该用户
 */
route.post("/article", async ctx => {
  const { body } = ctx.request;
  const { token } = ctx.request.headers;

  // 所需参数
  // TODO: 可优化
  let { title, desc, tag, bookId, content } = body;
  if (!(title && desc && tag && bookId && content)) {
    return (ctx.body = { code: 1, msg: "参数缺失" });
  }

  // 通过 bookId 查找书名
  let bookRes = undefined;
  try {
    bookRes = await MBook.findById(bookId);
  } catch (err) {
    console.log("err");
  }

  if (!bookRes) {
    return (ctx.body = { code: 2, msg: "不存在该书籍" });
  }

  // 通过 bookId 查找书名
  let userRes = undefined;
  try {
    userRes = await MUser.findById(token);
  } catch (err) {
    console.log("err");
  }

  if (!userRes) {
    return (ctx.body = { code: 3, msg: "不存在该用户" });
  }

  // 数据相关处理以及整合
  tag = JSON.parse(tag);
  let info = { title, desc, tag, bookId };
  const defArticleInfo = {
    authorId: token,
    author: userRes.account,
    book: bookRes.name
  };

  // 存储文章内容到 articleData 中 , 获取返回 id 存储到 article 中
  const articleDataRes = await MArticleData.create({ content });
  info.articleId = articleDataRes._id;

  Object.assign(info, defArticleInfo);
  await MArticle.create(info);

  ctx.body = { code: 0, msg: "文章添加成功" };
});

module.exports = route;
