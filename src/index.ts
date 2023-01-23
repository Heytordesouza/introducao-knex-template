import express, { Request, Response } from 'express'
import cors from 'cors'
import { db } from './database/knex'

const app = express()

app.use(cors())
app.use(express.json())

app.listen(3003, () => {
  console.log(`Servidor rodando na porta ${3003}`)
})

app.get("/ping", async (req: Request, res: Response) => {
    try {
        res.status(200).send({ message: "Pong!" })
    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

// Prática 1 : 

// Crie dentro da pasta src/database o arquivo knex.ts
// Referencie o material assíncrono 
// (e lembre-se de editar o nome do caminho para o arquivo .db)

// Para garantir que está tudo certo, crie um endpoint
// que busca pelas bandas na tabela bands utilizando queries no formato
//  raw

app.get('/bands', async (req:Request, res: Response) => {

      try{
        const result = await db.raw(`SELECT * FROM bands`)

        res.status(200).send({bandas: result})

       } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

// Agora crie um endpoint que insere uma nova banda na tabela bands
// Lembre-se de validar os dados de entrada para não estressar 
// a conexão com o banco de dados desnecessariamente

app.post('/bands', async (req:Request, res: Response) => {

    try {
    // const id = req.body.id 
    // const name = req.body.name

    const { id, name } = req.body

    if(!id || !name){
        res.status(400)
        throw new Error("Id ou name inválido")
    }

    if(typeof id !== "string"){
        res.status(400)
        throw new Error("Id deve ser um texto")
    }

    if(typeof name !== "string"){
        res.status(400)
        throw new Error("name deve ser um texto")
    }

    // se der tudo certo, podemos fazer a query

    await db.raw(`
        INSERT INTO bands(id, name)
        VALUES("${id}", "${name}")
    `)
        
    res.status(200).send("Banda cadastrada com sucesso")

    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

//Prática 03 :
// Dessa vez implemente o endpoint de edição de bandas na tabela bands
// Lembre-se de referenciar o material assíncrono,
//  existe um exemplo de PUT nele


app.put('/bands/:id', async (req:Request, res: Response) => {

    try {
        const id = req.params.id

        const newId = req.body.id
        const newName = req.body.name

        if(newId !== undefined) {

            if (typeof newId !== "string") {
                res.status(400)
                throw new Error ("id deve ser string")
            }

            if(newId.length <1 ){
                res.status(400)
                throw new Error ("id deve ter no mínimo 1 caractere")
            }
        }

        

        if(newName !== undefined) {

            if (typeof newName !== "string") {
                res.status(400)
                throw new Error ("id deve ser string")
            }

            if(newName.length <3 ){
                res.status(400)
                throw new Error ("name deve ter no mínimo 3 caracteres")
            }
        }

        

        const [band] = await db.raw(`
            SELECT * FROM bands
            WHERE id = "${id}";
        `) // desestruturamos para encontrar o primeiro item do array

        // se existir, aí sim podemos editá-lo

        if(band){
            await db.raw(`
            UPDATE bands
            SET 
                id = "${newId || band.id}", 
                name = "${newName || band.name}"
            WHERE id = "${id}";
         `) 

        } else {
            res.status(404)
            throw new Error ("Id não encontrado")
        }

        res.status(200).send("Edição feita com sucesso")
        
    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})



//Exercicio de fixação:

app.get("/songs", async (req: Request, res: Response) => {

    try {

        const result = await db.raw(`
            SELECT * FROM songs;
        `)

        res.status(200).send(result)
    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

app.post("/songs", async (req: Request, res: Response) => {
    try {
        const id = req.body.id
        const name = req.body.name
        const bandId = req.body.bandId

        if (typeof id !== "string") {
            res.status(400)
            throw new Error("'id' inválido, deve ser string")
        }

        if (typeof name !== "string") {
            res.status(400)
            throw new Error("'name' inválido, deve ser string")
        }

        if (typeof bandId !== "string") {
            res.status(400)
            throw new Error("'bandId' inválido, deve ser string")
        }

        if (id.length < 1 || name.length < 1 || bandId.length < 1) {
            res.status(400)
            throw new Error("'id', 'name' e 'bandId' devem possuir no mínimo 1 caractere")
        }

        await db.raw(`
            INSERT INTO songs (id, name, band_id)
            VALUES ("${id}", "${name}", "${bandId}");
        `)

        res.status(200).send("Música cadastrada com sucesso")
    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

app.put("/songs/:id", async (req: Request, res: Response) => {
    try {
        const id = req.params.id

        const newId = req.body.id
        const newName = req.body.name
        const newBandId = req.body.bandId

        if (newId !== undefined) {

            if (typeof newId !== "string") {
                res.status(400)
                throw new Error("'id' deve ser string")
            }

            if (newId.length < 1) {
                res.status(400)
                throw new Error("'id' deve possuir no mínimo 1 caractere")
            }
        }

        if (newName !== undefined) {

            if (typeof newName !== "string") {
                res.status(400)
                throw new Error("'name' deve ser string")
            }

            if (newName.length < 1) {
                res.status(400)
                throw new Error("'name' deve possuir no mínimo 1 caractere")
            }
        }

        if (newBandId !== undefined) {

            if (typeof newBandId !== "string") {
                res.status(400)
                throw new Error("'name' deve ser string")
            }

            if (newBandId.length < 1) {
                res.status(400)
                throw new Error("'name' deve possuir no mínimo 1 caractere")
            }
        }

        const [song] = await db.raw(`
            SELECT * FROM songs
            WHERE id = "${id}";
        `)

        if (song) {
            await db.raw(`
                UPDATE songs
                SET
                    id = "${newId || song.id}",
                    name = "${newName || song.name}",
                    band_id = "${newBandId || song.band_id}"
                WHERE
                    id = "${id}";
            `)
        } else {
            res.status(404)
            throw new Error("'id' não encontrada")
        }

        res.status(200).send({ message: "Atualização realizada com sucesso" })
    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

app.delete("/songs/:id", async (req: Request, res: Response) => {
    try {
        const idToDelete = req.params.id

        const [song] = await db.raw(`
        SELECT * FROM songs
        WHERE id = "${idToDelete}";
    `)
        if (song) {

            // se chegou até aqui é porque podemos deletar
            await db.raw(`
         DELETE FROM songs
                 WHERE id = "${idToDelete}";
     `)
            res.status(200).send({ message: "Música deletada com sucesso" })
        } else {
            res.status(404)
            throw new Error("Música não encontrada");

        }
    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})