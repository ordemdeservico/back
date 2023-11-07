const express = require('express');
const router = express.Router();
const imagemController = require('../controllers/imagem-controller');
const login = require('../middleware/login');
const roles = require('../middleware/roles');
const multer = require('multer');

const path = require('path');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
		uploadDir = path.resolve(__dirname, '../../uploads');
        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        let data = new Date().toISOString().replace(/:/g, '-') + '-';
        cb(null, data + file.originalname)
    }
});

const upload = multer({
    storage: storage,
    limits: {
    	fileSize: 1024 * 1024 * 5
    }
});

router.get('/', login.verifyToken, imagemController.getAllImagens);

router.post('/post', login.verifyToken, upload.single('imagem'), imagemController.addImagem);

module.exports = router;