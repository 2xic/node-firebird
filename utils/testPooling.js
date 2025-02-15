const Firebird = require("../lib");
const {
  promisePool,
  pool,
  selectTransaction,
  sleep,
} = require("./testUtils.js");

(async () => {
  while (true) {
    console.log("Trying to select ...");
    const result = await promisePool(pool)
      .catch((err) => {
        console.error(err);
        process.exit(0);
      })
      .then((database) => {
        return selectTransaction(database);
      });
    console.log(JSON.stringify(result));
    console.log(pool.dbinuse);

    for (let i = 3; 0 < i; i--) {
      console.log(`Retrying in ... ${i}`);
      await sleep(1000);
    }
  }
})();
