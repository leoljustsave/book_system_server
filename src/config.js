const env = {
	lizhi: {
		get: "www.resource.com:8000",
		put: "D:/mine_za/NGINX-RESOURCE"
	}
};

const userCanConfig = [
	"name",
	"likeTag",
	"likeBook",
	"article",
	"uploadBook",
	"readBook",
	"collectBook",
	"avatar",
	"readSet"
];

const bookCanConfig = ["name", "cover", "author", "press", "desc", "class"];

module.exports = { env, userCanConfig, bookCanConfig };
