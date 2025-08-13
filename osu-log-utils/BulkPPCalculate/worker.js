const { Difficulty, Beatmap } = require("rosu-pp-js");
const { db, pgp } = require("../database.js");
const { workerData, parentPort } = require("worker_threads");

const ids = workerData.chunk;
const threadNumber = workerData.threadNumber;

work().then(() => {
	console.log(`${threadNumber}: ending`);
}).catch((e) => {
	console.log(e);
	console.log(`${threadNumber}: error`);
});

async function work() {
	const { update, ColumnSet } = pgp.helpers;
	const perfs = [];
	const columnTemplate = new ColumnSet([
		"?id",
		{
			name: "max_performance",
			cast: "jsonb",
		},
	], { table: "maps" });

	for (let { id } of ids) {
		//console.log(`Thread ${threadNumber} is working on map ${id}`)

		let bytes;
		try {
			({ bytes } = await db.one(
				`select bytes from maps where id like '${id}';`,
			));
		} catch (e) {
			console.log(`Thread ${threadNumber} crashed... :`, e);
		}

		const beatmap = new Beatmap(bytes);
		maxNMPerf = new Difficulty().calculate(beatmap);
		maxCLPerf = new Difficulty({ mods: "CL" }).calculate(beatmap);
		perfs.push({ id, max_performance: { nm: maxNMPerf, cl: maxCLPerf } });
		beatmap.free();
	}

	console.log(`Thread ${threadNumber} has started updating the db...`);

	try {
		db.query(update(perfs, columnTemplate) + " WHERE v.id = t.id");
	} catch (e) {
		console.log(`Thread ${threadNumber} crashed while updating... :`, e);
	}
}
