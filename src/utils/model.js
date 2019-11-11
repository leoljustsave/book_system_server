const mongoose = require("mongoose");

const DB_URL = "mongodb://localhost:27017/book_system";

mongoose.connect(DB_URL, { useUnifiedTopology: true, useNewUrlParser: true });

// 连接成功
mongoose.connection.on("connected", function() {
  console.log("mongodb connecting...");
});

// 连接失败
mongoose.connection.on("error", function(err) {
  console.log("mongodb connect fail by: " + err);
});

const models = {
  book: {
    name: { type: String, require: true },
    author: { type: String, require: false },
    press: { type: String, require: true },
    desc: { type: String, require: true },
    catalog: { type: Array, require: true },
    class: { type: Array, require: true },
    like: { type: Number, require: false },
    collect: { type: Number, require: false },
    cover: { type: String, require: false },
    path: { type: String, require: false }
  },
  user: {
    name: { type: String, require: true },
    avatar: { type: String, require: true },
    account: { type: String, require: true },
    password: { type: String, require: true },
    likeTag: { type: Array, require: false },
    article: { type: Array, require: false },
    readSet: { type: Object, require: false },
    collectBook: { type: Array, require: false },
    uploadBook: { type: Array, require: false }
  }
};

for (let m in models) {
  mongoose.model(m, new mongoose.Schema(models[m]));
}

module.exports = {
  getModel: function(name) {
    return mongoose.model(name);
  }
};
