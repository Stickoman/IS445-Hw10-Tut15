require('dotenv').config()
const express = require('express')
const { Pool } = require('pg')
const app = express()

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: true }))

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 2
})

app.get('/', (req, res) => {
    res.redirect('/books')
})

app.get('/books', (req, res) => {
    pool.query('SELECT * FROM books ORDER BY id', (err, result) => {
        if (err) throw err
        res.render('data', { books: result.rows })
    })
})

app.get('/books/add', (req, res) => {
    res.render('_editor', { book: {}, action: '/books/add' })
})

app.post('/books/add', (req, res) => {
    const { title, author, comments } = req.body
    const sql = 'INSERT INTO books (title, author, comments) VALUES ($1, $2, $3)'
    pool.query(sql, [title, author, comments], (err, result) => {
        if (err) throw err
        res.redirect('/books')
    })
})

app.get('/books/edit/:id', (req, res) => {
    const id = req.params.id
    pool.query('SELECT * FROM books WHERE id = $1', [id], (err, result) => {
        if (err) throw err
        res.render('_editor', { book: result.rows[0], action: `/books/edit/${id}` })
    })
})

app.post('/books/edit/:id', (req, res) => {
    const id = req.params.id
    const { title, author, comments } = req.body
    const sql = 'UPDATE books SET title = $1, author = $2, comments = $3 WHERE id = $4'
    pool.query(sql, [title, author, comments, id], (err, result) => {
        if (err) throw err
        res.redirect('/books')
    })
})

app.get('/books/delete/:id', (req, res) => {
    const id = req.params.id
    pool.query('DELETE FROM books WHERE id = $1', [id], (err, result) => {
        if (err) throw err
        res.redirect('/books')
    })
})

app.listen(process.env.PORT || 3000, () => {
    console.log("Server started (http://localhost:3000/)")
})
