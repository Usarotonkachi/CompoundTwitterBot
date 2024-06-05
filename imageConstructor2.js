const { createCanvas } = require('canvas');
const { CanvasEmoji } = require("canvas-emoji");
const fs = require('fs');
const path = require('path');

// Параметры изображения и текста
const canvasWidth = 1000;
const canvasHeight = 2500;
const fontSize = 40;
const lineHeight = fontSize * 1.5; // Высота строки

// Папка для сохранения изображений
const outputDir = path.join(__dirname, 'output');

// Функция для удаления папки и ее содержимого
function clearOutputDir() {
  if (fs.existsSync(outputDir)) {
    fs.rmdirSync(outputDir, { recursive: true }); // Удаляем папку со всем содержимым
  }
  fs.mkdirSync(outputDir); // Создаем пустую папку заново
}

// Функция для создания изображения с текстом
function createImage(text, index) {
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

  // Сохраняем изображение в файл
  const outputPath = path.join(outputDir, `image-${index}.png`);
  const out = fs.createWriteStream(outputPath);
  const stream = canvas.createPNGStream();
  stream.pipe(out);
  out.on('finish', () => console.log(`Изображение ${index} сохранено по пути ${outputPath}`));
}

// Функция для разделения текста на части и создания изображений
function splitTextAndCreateImages(text) {
  const sections = text.split('###'); // Разбиваем текст на секции с помощью указанного разделителя

  console.log(sections.length);

  sections.forEach((section, index) => {
    console.log('index', index);
    createImage(section, index);
  });
}

// Очищаем папку output перед созданием новых изображений
clearOutputDir();

// Считываем текст из файла и создаем изображения
const filePath = 'supplied.txt';
let text = '';

// Считываем данные из файла синхронно
try {
  // Чтение данных из файла и запись в переменную text
  text = fs.readFileSync(filePath, 'utf8');
  console.log('Содержимое файла', filePath, ':', text);
  // Теперь можно продолжать выполнение кода с использованием переменной text

} catch (err) {
  console.error('Ошибка при чтении файла:', err);
}

splitTextAndCreateImages(text);
