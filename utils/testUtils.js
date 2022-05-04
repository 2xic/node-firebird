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

async function promisePool() {
  return new Promise((resolve, reject) => {
    pool.get(function (err, database) {
      if (err) {
        reject(err);
      } else {
        resolve(database);
      }
    });
  });
}

async function selectTransaction(database) {
  const iAmStuck = setTimeout(() => {
    console.log("im stuck selecting!!!!!");
  }, 5000);

  return new Promise((resolve, reject) => {
    database.transaction(
      Firebird.ISOLATION_REPEATABLE_READ_60_SECONDS_TIMEOUT,
      (error, transaction) => {
        if (error) {
          reject(error);
        } else {
          transaction.query("SELECT * FROM MYDATA", function (err, result) {
            if (err){
              reject(err);
            }
            transaction.commit();
            resolve(result, transaction);
          });
        }
      }
    );
  })
    .then((result) => {
      clearTimeout(iAmStuck);
      return result;
    })
    .finally(() => {
      database.detach();
    });
}

async function writeTransaction(database) {
  const iAmStuck = setInterval(() => {
    console.log("im stuck UPDATING !!!!");
  }, 5000);

  return new Promise((resolve, reject) => {
    database.transaction(
      Firebird.ISOLATION_REPEATABLE_READ_60_SECONDS_TIMEOUT,
      (error, transaction) => {
        if (error) {
          reject(error);
        } else {
          transaction.query(
            "UPDATE MYDATA set ID = 2 WHERE ID = 1",
            function (err, result) {
              if (err) {
                reject(err);
              }
              resolve(result, transaction);
            }
          );
        }
      }
    );
  }).then(async (result) => {
    // We do not clear the connection because we want a deadlock.
    await sleep(300);
    clearInterval(iAmStuck);
    return result;
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
  selectTransaction,
  writeTransaction,
  promisePool,
  pool,
  sleep,
};
