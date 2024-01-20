const db = require("../config/database");
let express = require("express");
let router = express.Router();

/* GET home page. */
router.get("/", async function (req, res, next) {
  const { rows: wished } = await db.query(
    "SELECT * FROM places WHERE visited=false"
  );
  const { rows: visited } = await db.query(
    "SELECT * FROM places WHERE visited=true"
  );
  res.render("index", { wished, visited });
});

router.get("/wished", async function (req, res, next) {
    const {rows:wished} = await db.query(
      "SELECT * FROM places WHERE visited=false"
);
   res.render("wished", {wished});
});

router.get("/visited", async function (req, res, next) {
    const {rows:visited} = await db.query(
      "SELECT * FROM places WHERE visited=true"
);
   res.render("visited", {visited});
});

module.exports = router;
