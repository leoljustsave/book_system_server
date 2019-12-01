const router = require("koa-router");
const file = require("../utils/file");
const model = require("../utils/model");
const path = require("path");
const config = require("../config");

const route = new router();
const MBook = model.getModel("book");
const env = config.env.lizhi;

/**
 * 获取书籍信息
 * 0 - 获取成功
 * 1 - 参数缺失
 * 2 - 获取书籍失败
 * 3 - 书籍不存在
 */
route.get("/book", async ctx => {
	const { id } = ctx.request.query;
	let bookRes;

	if (!id) {
		return (ctx.body = {
			code: 1,
			msg: "参数缺失"
		});
	}

	try {
		bookRes = await MBook.findById(id);
		if (!bookRes) {
			return (ctx.body = {
				code: 3,
				msg: "书籍不存在"
			});
		}
	} catch (e) {
		return (ctx.body = {
			code: 2,
			msg: "获取书籍失败"
		});
	}

	ctx.body = {
		code: 0,
		msg: "书籍获取成功",
		data: bookRes
	};
});

/**
 * 书籍上传
 * 0 - 上传成功
 * 1 - 参数缺失
 */
route.post("/book", async ctx => {
	const { book, cover } = ctx.request.files;
	const { body } = ctx.request;
	const info = {};

	// 所需参数
	// TODO: 可优化
	const { name, author, press, tag, desc, catalog } = body;
	if (!(name && author && press && desc && tag && catalog)) {
		return (ctx.body = { code: 1, msg: "参数缺失" });
	}

	// 获取书籍 md5 信息
	const bookMd5 = file.getFileMd5(book.path);

	// 非必要书籍属性的默认值
	// TODO: 书名过滤后缀
	const defBookInfo = {
		name: book.name.replace(/.epub$/, ""),
		md5: bookMd5
	};

	// 书籍封面文件存储
	const coverName = await file.commonFileSave(
		cover,
		path.join(env.put, "/book/cover")
	);
	info.cover = `${env.get}/book/cover/${coverName}`;

	// 书籍本体存储
	// 若书籍存在则不进行存储操作 直接使用文件
	// TODO: 同一用户重复上传
	const findBookRes = await MBook.findOne({ md5: bookMd5 });

	if (!findBookRes) {
		const bookName = await file.commonFileSave(
			book,
			path.join(env.put, "/book")
		);
		info.path = `${env.get}/book/${bookName}`;
	} else {
		info.path = findBookRes.path;
	}

	// 数据库存储处理
	const bookInfo = Object.assign({}, info, defBookInfo);
	await MBook.create(bookInfo);

	ctx.body = { code: 0, msg: "书籍上传成功" };
});

// 修改书籍信息
route.patch("/book", async ctx => {
	const { body, files } = ctx.request;
	const { id } = body;
	let info = {};

	// id 信息缺失
	if (!id) {
		return (ctx.body = { code: 1, msg: "缺失书籍 id" });
	}

	// 书籍不存在
	if (!(await MBook.findById(id))) {
		return (ctx.body = { code: 2, msg: "该书籍不存在" });
	}

	// 过滤信息
	for (key in body) {
		if (config.bookCanConfig.includes(key)) {
			info[key] = body[key];
		}
	}

	// 查看是否有修改封面
	if (files.cover) {
		const { cover } = files;
		const coverName = await file.commonFileSave(
			cover,
			path.join(env.put, "/book/cover")
		);
		info.cover = `${env.get}/book/cover/${coverName}`;
	}

	// 执行更新操作
	await MBook.findByIdAndUpdate(id, info);

	ctx.body = { code: 0, msg: "书籍信息更新成功" };
});

// 删除书籍及其信息
route.delete("/book", async ctx => {
	console.log(ctx.request.body);
	const { id } = ctx.request.body;

	if (!id) {
		return (ctx.body = { code: 1, msg: "id 参数缺失" });
	}

	// 获取相关信息并找出具体存储路径
	// const bookRes = await MBook.findById(id);

	// if (!bookRes) {
	// 	return (ctx.body = { code: 2, msg: "此书籍不存在" });
	// }

	// const bookRealPath = bookRes.path.replace(env.get, env.put);
	// const coverRealPath = bookRes.cover.replace(env.get, env.put);

	// TODO: 逻辑整理
	// 执行删除书籍以及书籍封面
	// await file.delFile(bookRealPath);
	// await file.delFile(coverRealPath);

	// 删除数据库中的信息
	flag.data = await MBook.findByIdAndRemove(id);

	ctx.body = {
		code: 0,
		msg: "书籍删除成功"
	};
});

module.exports = route;
