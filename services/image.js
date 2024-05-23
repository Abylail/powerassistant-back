import * as fs from "node:fs";
import "dotenv/config"
import generateRandomHash from "../helpers/generateRandomHash.js";

/**
 * Загрузка картинки
 * @param imageBase64 {string} - base64
 * @param dirName {string} - название папки которую все надо сохранять
 * @return {Promise} - ссылка файла или null(если ошибка)
 * */
export const uploadFile = (imageBase64, dirName="images") => new Promise(resolve => {
    const fileName = generateRandomHash(20);

    const dirPath = `${process.env.FILE_PATH}/${dirName}/`;
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath);

    // Расширение файла
    const extension = imageBase64.split(';')[0].split('/')[1];

    // Ссылка которая сохранится в базе
    const dataFilePath = `/${dirName}/${fileName}.${extension}`

    const base64NoPrefix = imageBase64.substr(imageBase64.indexOf(',') + 1);

    const filePath = `${dirPath}${fileName}.${extension}`;
    fs.writeFile(filePath, base64NoPrefix, "base64", err => {
        if (err) return resolve(null);
        else resolve(dataFilePath);
    })
})

/**
 * Удалить картинку
 * @return {Promise} - успешно ли
 * */
export const removeFile = imagePath => new Promise(resolve => {
    fs.unlink(`${process.env.FILE_PATH}${imagePath}`, (err) => {
        if (err) return resolve(false);
        else return resolve(true);
    });
})