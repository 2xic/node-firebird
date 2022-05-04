const Firebird = require("../lib");
const {
  promisePool,
  pool,
  sleep,
  writeTransaction,
} = require("./testUtils.js");

(async () => {
  while (true) {
    console.log("Trying to get a deadlock ...");
    const result = await promisePool(pool)
      .catch((err) => {
        console.error(err);
        process.exit(0);
      })
      .then((database) => {
        return writeTransaction(database);
      });
    console.log(JSON.stringify(result));
    console.log(pool.dbinuse);

    await sleep(1000);
  }
})();
