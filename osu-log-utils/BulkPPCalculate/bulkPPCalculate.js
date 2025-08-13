import { db } from '../database.js';
import { Worker } from 'worker_threads';

export async function start() {

	let query = 'select id from maps;';
	const result = await db.manyOrNone(query);
	const count = result.length;

	const threadCount = 24

	const chunks = [];

	let i = 0;
	let partSize = Math.floor(count / threadCount);
	let chunk;
	while (i < count) {
		chunk = result.slice(i, i + partSize);
		chunks.push(chunk);
		i += partSize;
	}

	const promises = [];
	let threadNumber = 0;
	for (chunk of chunks) {
		promises.push(createWorker(chunk, threadNumber))
		threadNumber += 1;
	}
	await Promise.all(promises);
};

function createWorker(chunk, threadNumber) {
	return new Promise((resolve, reject) => {
		const worker = new Worker("/home/saai/Documents/lern/web/osu-web-app-utils/BulkPPCalculate/worker.js", {
			workerData: { chunk, threadNumber }
		});

		worker.on("message", (data) => {
			resolve(data);
		});
		worker.on("error", (msg) => {
			reject(`An error occured: ${msg}`);
		});

	})
}
