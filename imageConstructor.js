const { createCanvas } = require('canvas');
const fs = require('fs').promises; // Используем промисы для работы с файлами
const path = require('path');

// Параметры изображения и текста
const canvasWidth = 1000;
const canvasHeight = 2500;
const fontSize = 40;
const lineHeight = fontSize * 1.5; // Высота строки

// Папка для сохранения изображений
const outputDir = path.join(__dirname, 'output');

// Функция для создания изображения с текстом
async function createImage(text, index) {
  const canvas = createCanvas(canvasWidth, canvasHeight);
  const context = canvas.getContext('2d');

  // Задаем белый фон
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvasWidth, canvasHeight);

  // Задаем цвет текста и размер шрифта
  context.fillStyle = '#000000';
  context.font = `${fontSize}px Arial`;

  // Отрисовываем текст на изображении
  const x = canvasWidth / 3;
  const y = (canvasHeight - lineHeight) / 8; // Центрируем текст по вертикали
  context.fillText(text, x, y);

  // Преобразуем изображение в буфер PNG
  const buffer = canvas.toBuffer('image/png');

  // Сохраняем изображение в файл
  const outputPath = path.join(outputDir, `data-${index}.png`);
  await fs.writeFile(outputPath, buffer);
  console.log(`Изображение ${index} сохранено по пути ${outputPath}`);
}

// Функция для разделения текста на части и создания изображений
async function splitTextAndCreateImages(text) {
  const sections = text.split('###'); // Разбиваем текст на секции с помощью указанного разделителя
  console.log(sections.length);

  for (let index = 0; index < sections.length; index++) {
    console.log('index', index);
    await createImage(sections[index], index);
  }
}

module.exports = { splitTextAndCreateImages };
