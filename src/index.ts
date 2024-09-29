import express, { Request, Response, NextFunction } from "express";
import mysql from "mysql2/promise";

const app = express();

var firstEntry: boolean = false;

// Configura EJS como a engine de renderização de templates
app.set('view engine', 'ejs');
app.set('views', `${__dirname}/views`);

const connection = mysql.createPool({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "mudar123",
    database: "unicesumar"
});

// Middleware para verificar se já existe um email cadastrado no banco
const verififyUser = async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body;
    const emailQuery = "SELECT email FROM users WHERE email = ?"
    const [rows] = await connection.query(emailQuery, [body.email])
    console.log(rows)
    if (Array.isArray(rows) && rows.length === 0) {
        console.log("passou");
        next();
    } else {
        console.log("nao passou")
        res.send("email já existente. Tente outro")
    }

}


// Middleware para tirar espaços vazios do input
const formatBodyForm = (req: Request, res: Response, next: NextFunction) => {
    const body = req.body;
    for (const key in body) {
        if (Object.prototype.hasOwnProperty.call(body, key)) {
            const element = body[key];
            if (!body.senha) {
                body[key] = element.toString().trim();
            }
        }
    }
    next();
}

// Middleware para bloquear acesso a pagina "/" sem fazer login na primeira vez 
const isFirstEntry = (req: Request, res: Response, next: NextFunction) => {
    if (firstEntry === false) {
        res.redirect("/login")
    } else {
        next();
    }
}


// Middleware para permitir dados no formato JSON
app.use(express.json());
// Middleware para permitir dados no formato URLENCODED
app.use(express.urlencoded({ extended: true }));



app.get("/", isFirstEntry, async function (req: Request, res: Response) {
    res.render("home")
})

app.get('/users', async function (req: Request, res: Response) {
    const [rows] = await connection.query(`SELECT 
                                                    id,
                                                    name, 
                                                    email, 
                                                    papel, 
                                                    isAtivo is_ativo, 
                                                    DATE_FORMAT(created_at, '%d/%m/%Y') AS data_cadastro
                                                    FROM users;`);
    return res.render('users/index', {
        userData: rows
    });
});

app.get("/users/add", async function (req: Request, res: Response) {
    return res.render("users/form");
});

app.post("/users/save", formatBodyForm, verififyUser, async function (req: Request, res: Response) {
    try {
        const body = req.body;

        if (body.senha[0] !== body.senha[1]) {
            res.send("Erro na confirmação de senha")
        } else {
            if (body.isAtivo === undefined) {
                body.isAtivo = false;
            } else {
                body.isAtivo = true;
            }
            const insertQuery = "INSERT INTO users (name, email, senha, isAtivo, papel ) VALUES (?, ?, ?, ?, ?)";
            await connection.query(insertQuery, [body.name, body.email, body.senha[0], body.isAtivo, body.papel]);

            res.redirect("/users");
        }

    } catch (error) {
        res.status(500)
    }

});

app.post("/users/:id/delete", async function (req: Request, res: Response) {
    const id = req.params.id;
    const sqlDelete = "DELETE FROM users WHERE id = ?";
    await connection.query(sqlDelete, [id]);

    res.redirect("/users");
});


app.get("/login", (req: Request, res: Response) => {
    res.render("login/login.ejs")
})

app.post("/login", formatBodyForm, async (req: Request, res: Response) => {
    const body = req.body
    const queryUsers = "SELECT email, senha FROM users WHERE email = ? AND senha = ?"
    const [rows] = await connection.query(queryUsers, [body.email, body.senha])
    if (Array.isArray(rows) && rows.length === 0) {
        res.redirect("/login")
    } else {
        firstEntry = true;
        res.redirect("/")
    }

})



app.listen('3000', () => console.log("Server is listening on port 3000"));


