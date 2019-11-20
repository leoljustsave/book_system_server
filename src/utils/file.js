const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

/**
 * 存储文件到指定位置
 * @param {文件} file
 * @param {可选配置, filepath 为文件保存路径 / filename 为文件名} param1
 */
const putFile = (
  file,
  { filepath = path.join(__dirname, "../upload"), filename = file.name }
) => {
  // 判断是否为绝对路径
  // 非绝对路径需要处理处理存储路径
  if (["/", "."].includes(filepath[0])) {
    filepath = path.join(__dirname, filepath);
  }

  // 判断路径文件夹是否存在
  // TODO: 当前只判断了目标文件夹的状态 , 根文件夹没判断
  if (!fs.existsSync(filepath)) {
    fs.mkdirSync(filepath);
  }

  // 执行存储操作
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

/**
 * 删除指定文件
 * @param {需要被删除的文件路径} filepath
 */
const delFile = filepath => {
  // 处理路径
  if (["/", "."].includes(filepath[0])) {
    filepath = path.join(__dirname, filepath);
  }

  return new Promise((resolve, reject) => {
    // 判断路径是否存在
    if (!fs.existsSync(filepath)) {
      reject(false);
    }

    try {
      del(filepath);
      resolve(true);
    } catch (err) {
      reject(false);
    }
  });
};

/**
 * 循环删除有子文件或子文件夹的目标
 * @param {需要被删除的文件路径} filepath
 */
const del = filepath => {
  if (fs.statSync(filepath).isDirectory()) {
    files = fs.readdirSync(filepath);
    files.map(file => {
      let curPath = filepath + "/" + file;
      // 判断是文件夹还是文件
      if (fs.statSync(curPath).isDirectory()) {
        // recurse
        del(curPath);
      } else {
        // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(filepath);
  } else {
    fs.unlinkSync(filepath);
  }
};

/**
 * 判断目标是否存在
 * @param {文件路径} path
 */
const fileExist = path => {
  return fs.existsSync(path);
};

/**
 * 获取目标的 md5 值
 * @param {文件路径} filePath
 */
const getFileMd5 = filePath => {
  const fileBuffer = fs.readFileSync(filePath);
  const md5 = crypto.createHash("md5");
  const res = md5.update(fileBuffer).digest("hex");
  return res;
};

module.exports = { putFile, delFile, fileExist, getFileMd5 };
