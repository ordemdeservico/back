const mysql = require('../database/mysql');

module.exports = {
    getAllImagens: () => {
        return new Promise((resolve, reject) => {
            mysql.query('SELECT * FROM imagens ORDER BY data_postagem ASC',
            (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });  
        });
    },
    addImage: (link, nome, tipo, data_postagem, ordem_servico_id) => {
        return new Promise((resolve, reject) => {
            mysql.query("INSERT INTO imagens (link, nome, tipo, data_postagem, ordem_servico_id) VALUES (?, ?, ?, ?, ?)",
            [link, nome, tipo, data_postagem, ordem_servico_id],
            (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    }
}