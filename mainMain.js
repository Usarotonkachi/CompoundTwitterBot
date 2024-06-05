const cron = require('node-cron');
const { exec } = require('child_process');

const dayTasks = {
  0: 'tasks/governance.js',
  1: 'tasks/topSuppliedData.js',
  2: 'tasks/suppliedData.js',
  3: 'tasks/APRMarkets.js',
  4: 'tasks/totalBorrowed.js',
  5: 'tasks/utilization.js',
  6: 'tasks/topBorrowed.js',
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
