var express = require('express'); 
var router = express.Router();

router.get('/', (req, res, next) => {
    res.render('index');
});

// NOVO
router.get('/message', (req, res, next) => {
    res.json('index');
});
// NOVO

module.exports = router; 

  