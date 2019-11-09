const fs = require("fs");
const path = require("path");

const putFile = (file, filepath, filename) => {
  // 处理存储路径
  filepath = path.join(__dirname, "../", filepath);

  if (!fs.existsSync(filepath)) {
    fs.mkdirSync(filepath);
  }

  // 进行存储操作
  return new Promise((resolve, reject) => {
    try {
      const reader = fs.createReadStream(file.path);
      const writer = fs.createWriteStream(`${filepath}/${filename}`);
      reader.pipe(writer);
      resolve({ name: filename, path: filepath });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { putFile };
