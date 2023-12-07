const router = require("express").Router();

//users
router.use("/users", require("./user"));

// categories
router.use("/api", require('./blogComLikCat'))

// document:
router.use('/documents', require('./document'))



module.exports = router;
