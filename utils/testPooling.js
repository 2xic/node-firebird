const Firebird = require("../lib");

var options = {
  host: "localhost",
  port: 3050,
  database: "/databases/firebird.fdb",
  user: "DEMO",
  password: "demo",
  lowercase_keys: false,
  role: null,
  pageSize: 4096,
  retryConnectionInterval: 1000,
};

var pool = Firebird.pool(5, options);

process.on("SIGTERM", () => {
  pool.destroy();
});

async function promisePool () {
  return new Promise((resolve, reject) => {
    pool.get(function (err, db) {
      if (err) {
        reject(err);
      } else {
        db.query("SELECT * FROM NEWTABLE", function (err, result) {
          console.log(result ? `Got results ${JSON.stringify(result)}` : `No results ${JSON.stringify(err)}`);
          db.detach();
        });
        resolve();
      }
    });
  });
}

(async () => {
  while (true) {
    console.log("Trying to select ...");
    await promisePool(pool).catch((err) => {
      console.error(err);
    });
    for (let i = 5; 0 < i; i--){
      console.log(`Retrying in ... ${i}`)
      await sleep(1000);
    }
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
})();
