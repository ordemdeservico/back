const imagemService = require('../services/imagem-service');

module.exports = {
    getAllImagens: async (req, res) => {
        let json = {
            error: '',
            result: []
        };

        let imagens = await imagemService.getAllImagens();

        if (imagens) {
            json.result = imagens;
        }
        res.json(json);
    },
    addImagem: async (req, res) => {
        let json = {
            error: '',
            result: []
        };
    
        let link = req.file.path
        let nome = req.file.originalname
        let tipo = req.file.mimetype
        let data_postagem = req.body.data_postagem
        let ordem_servico_id = req.body.ordem_servico_id
    
        try {
            await imagemService.addImage(link, nome, tipo, data_postagem, ordem_servico_id);
            json.result = {
                message: "Imagem adicionada com sucesso!"
            }
        } catch (error) {
            console.log(error)
        }
        res.json(json)
    }
}
