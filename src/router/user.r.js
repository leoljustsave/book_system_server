// node
const file = require("../utils/file");
const path = require("path");

// koa
const router = require("koa-router");

// util
const config = require("../config");
const model = require("../utils/model");

const route = new router();
const env = config.env.lizhi;
const MUser = model.getModel("user");

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

	const userRes = await MUser.findOne({ account: account });
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
			code: 2,
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
	console.log(body);
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

module.exports = route;
