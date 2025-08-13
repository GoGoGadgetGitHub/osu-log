const { workerData, parentPort } = require("worker_threads");
const { pgp, db } = require('../database');
const path = require('path');
const fs = require('fs/promises');

const chunk = workerData.chunk;
const dir = workerData.dir;
const threadNumber = workerData.threadNumber;

work().then(() => {
  console.log(`${threadNumber}: ending`)
}).catch((e) => {
  console.log(e)
  console.log(`${threadNumber}: error`)
})


async function work() {

  console.log(`${threadNumber}: started`)

  const { ColumnSet, insert } = pgp.helpers;
  const columnTemplate = new ColumnSet(['id', 'bytes'], { table: 'maps' });
  let start = 0;
  let end;
  const clears = 20;
  const workPerClear = Math.floor(chunk.length / 20)
  let file, filePath;

  for (let i = 1; i <= clears; i++) {

    let data = [];
    end = i === clears ? chunk.length - 1 : start + workPerClear;

    console.log(start, end)

    for (let j = start; j <= end; j++) {
      file = chunk[j];
      filePath = path.join(dir, file);
      let stats

      try {
        stats = await fs.stat(filePath);
      } catch (err) {
        console.error(`${threadNumber}:Error getting file stats:`, err);
        return;
      }

      if (stats.isFile()) {
        console.log(`${threadNumber}:Processing file-${filePath}`);
        let bytes;
        try {
          bytes = await fs.readFile(filePath, 'utf8')
        }
        catch (err) {
          console.error(`${threadNumber}:Problem reading ${file}: ${err}`)
          return;
        }
        const id = path.basename(file, '.osu');
        data.push({ id, bytes });
      }
    }

    const query = insert(data, columnTemplate) + "ON CONFLICT DO NOTHING";
    try {
      await db.none(query);
    }
    catch (e) {
      //error code for existing record
      if (e.code === "23505") {
        console.log(e.detail)
      }
      console.error(e);
      return;
    }

    console.log(`${threadNumber}: ${i}/${clears}`);
    start = end + 1;
  }
};
