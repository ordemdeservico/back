const Minio = require("minio");
const { v4: uuidv4 } = require("uuid");
const mysql = require("../database/mysql");
const path = require("path");
dotenv = require("dotenv");
dotenv.config();

const s3 = new Minio.Client({
  endPoint: "localhost",
  port: 2020,
  useSSL: false,
  accessKey: process.env.ACCESS_KEY,
  secretKey: process.env.SECRET_KEY,
});

const mimeTypes = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".bmp": "image/bmp",
  ".webp": "image/webp",
};

async function uploadToS3(file, filename, metaData) {
  return new Promise((resolve, reject) => {
    s3.putObject(
      process.env.BUCKET_NAME,
      filename,
      file.buffer,
      metaData,
      function (err, res) {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      }
    );
  });
}

async function insertDatabase(os_id, filename, img_type) {
  const query =
    "INSERT INTO os_img (os_id, img_key, img_type) VALUES (?, ?, ?)";
  await mysql.execute(query, [os_id, filename, img_type]);
}

exports.uploadImagem = async (files, os_id, img_type) => {
  try {
    const uploadPromises = files.map(async (file) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const filename = `${uuidv4()}${ext}`;

      const metaData = {
        "Content-Type": mimeTypes[ext] || "application/octet-stream",
      };

      await uploadToS3(file, filename, metaData);
      await insertDatabase(os_id, filename, img_type);

      return { message: "Imagem enviada com sucesso!" };
    });

    const responses = await Promise.all(uploadPromises);
    return responses;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.findAllImages = () => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM os_img";
    mysql.query(query, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

exports.findImageById = (id) => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM os_img WHERE id = ?";
    mysql.query(query, [id], (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results[0]);
      }
    });
  });
};

exports.findImageByOsId = (os_id) => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM os_img WHERE os_id = ?";
    mysql.query(query, [os_id], (error, results) => {
      if (error) {
        reject(error);
      } else {
        const type1 = results.filter((img) => img.img_type == 1);
        const type2 = results.filter((img) => img.img_type == 2);

        convertUrl({ type1, type2 }).then((updatedData) => {
          resolve(updatedData);
        });
      }
    });
  });
};

async function convertUrl(data) {
  for (let type in data) {
    for (let item of data[type]) {
      try {
        const url = await getImagem(item.img_key);
        if (url) {
          item.img_key = url;
        }
      } catch (err) {
        console.log(err);
      }
    }
  }
  return data;
}
async function getImagem(img_key) {
  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: img_key,
    Expires: 60 * 60, 
  };
  try {
    const url = await s3.presignedGetObject(params.Bucket, params.Key);
    return url;
  } catch (err) {
    console.log(err);
    return null;
  }
}
