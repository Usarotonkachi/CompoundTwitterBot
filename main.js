const cron = require('node-cron');
const { exec } = require('child_process');

const tasks = [
  'tasks/governance.js',
  'tasks/topSuppliedData.js',
  'tasks/suppliedData.js',
  'tasks/APRMarkets.js',
  'tasks/totalBorrowed.js',
  'tasks/utilization.js',
  'tasks/topBorrowed.js',
];

function scheduleTasks() {
  // Запуск задачи каждые 10 минут
  cron.schedule('*/10 * * * *', () => {
    const currentMinute = new Date().getMinutes();
    const scriptIndex = Math.floor(currentMinute / 10) % tasks.length;
    const taskFile = tasks[scriptIndex];

    if (taskFile) {
      exec(`node ${taskFile}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing task for minute ${currentMinute}:`, error);
          return;
        }
        if (stderr) {
          console.error(`Error output for task ${currentMinute}:`, stderr);
          return;
        }
        console.log(`Output for task ${currentMinute}:`, stdout);
      });
    } else {
      console.error(`No task defined for minute ${currentMinute}`);
    }
  });
}

scheduleTasks();
