const fs = require('fs/promises');
const path = require('path');
const { Worker, workerData } = require("worker_threads")

//I need to break the list of file names into 24 chunks, then as a chunk is ready to be handed to a thread, i need to
//instantiate it

function createWorker(dir, chunk, threadNumber) {
  return new Promise((resolve, reject) => {
    const worker = new Worker("./worker.js", {
      workerData: { dir, chunk, threadNumber }
    });

    worker.on("message", (data) => {
      resolve(data);
    });
    worker.on("error", (msg) => {
      reject(`An error occured: ${msg}`);
    });

  })
}

initialInsert().then(() => {
  console.log("Done");
})

async function initialInsert() {

  const directoryPath = '/mnt/data-linux/osumaps/2025_06_01_osu_files';

  let files;
  try {
    files = await fs.readdir(directoryPath);
  } catch (err) {
    console.error('Error reading directory:', err);
    return;
  }

  const threadCount = 24
  const filesPerThread = Math.floor(files.length / threadCount);

  let start = 0;
  let chunk;
  const chunks = [];
  for (let i = 1; i <= threadCount; i++) {
    if (i === threadCount) {
      chunk = files.slice(start, files.length);
      chunks.push(chunk);
      break
    }
    chunk = files.slice(start, filesPerThread * i);
    chunks.push(chunk);
    start = filesPerThread * i;
  };

  let promises = [];
  let counter = 1;
  for (chunk of chunks) {
    promises.push(createWorker(directoryPath, chunk, counter));
    counter += 1;
  }

  await Promise.all(promises);
  //And we pray
}
