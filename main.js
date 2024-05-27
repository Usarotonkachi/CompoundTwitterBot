const cron = require('node-cron');
const { exec } = require('child_process');

const dayTasks = {
  0: 'sunday.js',
  1: 'monday.js',
  2: 'tuesday.js',
  3: 'wednesday.js',
  4: 'thursday.js',
  5: 'friday.js',
  6: 'saturday.js',
};

function scheduleDailyTask() {
  // Запуск задачи каждый день в 12:00 (полдень)
  cron.schedule('0 12 * * *', () => {
    const today = new Date().getDay();
    const taskFile = dayTasks[today];

    exec(`node ${taskFile}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing task for day ${today}:`, error);
        return;
      }
      if (stderr) {
        console.error(`Error output for task ${today}:`, stderr);
        return;
      }
      console.log(`Output for task ${today}:`, stdout);
    });
  });
}

scheduleDailyTask();
