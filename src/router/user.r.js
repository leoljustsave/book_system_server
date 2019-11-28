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
route.post("/user/login", async (ctx, next) => {
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

// 获取用户信息
route.get("/user", async (ctx, next) => {
	const { token } = ctx.request.headers;
	const userRes = await MUser.findById(token);
	// 过滤重要信息
	let { password, _id, account, ...data } = userRes._doc;
	ctx.body = data;
});

// 用户注册
route.post("/user", async (ctx, next) => {
	const { body, files } = ctx.request;
	const { avatar } = files;

	// TODO: 验证必要数据
	const { account, password, name } = body;
	if (!(account && password && name)) {
		return (ctx.body = {
			code: 1,
			msg: "参数缺失"
		});
	}

	const defUserInfo = {
		avatar: "",
		readSet: {}
	};
	const avatarExt = path.extname(avatar.name);
	const avatarMd5 = file.getFileMd5(avatar.path);

	// 头像文件存储
	const avatarMd5Name = `${avatarMd5 + avatarExt}`;
	const avatarFileOption = {
		filepath: path.join(env.put, "/user/avatar"),
		filename: avatarMd5Name
	};
	await file.putFile(avatar, avatarFileOption);
	defUserInfo.avatar = `${env.get}/user/avatar/${avatarMd5Name}`;

	// 整合数据
	// TODO: 数据加密
	const userInfo = Object.assign({}, body, defUserInfo);

	// TODO: 存储数据库, 返回 user 的 token
	const userRes = await MUser.create(userInfo);

	global.token = userRes._id;
	return (ctx.body = {
		code: 0,
		msg: "add user success",
		token: userRes._id
	});
});

// 用户信息修改
route.patch("/user", (ctx, next) => {
	const token = ctx.request.header;

	if (token !== global.token) {
		return (ctx.body = {
			code: 1,
			msg: "与登录用户不一致"
		});
	}

	const userRes = MUser.findById(token);

	console.log(userRes);
	return false;

	const { body, files } = ctx.request;
	// 需要修改的数据
	const info = {};

	// 是否有需要修改的基础信息
	if (JSON.stringify(body) !== "{}") {
		// body 不为空
		for (key in body) {
			// TODO: 判断是否有不可修改的字段
			if (config.userCanConfig.includes(key)) {
				info.key = body.key;
			}
		}
	}

	// 是否有需要修改的头像信息
	if (files.avatar) {
		info.avatar = files.avatar;
	}

	// 判断是否有信息要修改
	if (JSON.stringify(info) === "{}") {
		return (ctx.body = {
			code: 0,
			msg: "没有需要修改的信息"
		});
	}
	// TODO: 通过 token 查找信息 , 然后进行信息修改
	const updateRes = MUser.findByIdAndUpdate(token, info);
	console.log(updateRes);
});

module.exports = route;
