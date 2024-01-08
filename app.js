const express = require('express')
const app = express()
const path = require('path')

app.use(express.json())

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const dbpath = path.join(__dirname, 'moviesData.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

const convertMovieDbObjectToResponseObject = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directirId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  }
}

const convertDirectorDbObjectToResponseObject = dbObject => {
  return {
    directirId: dbObject.director_id,
    directorName: dbObject.director_name,
  }
}

//returns list of all movie names in movie table
app.get('/movies/', async (request, response) => {
  const getMovieNamesQuery = `SELECT movie_name
     FROM movie ;`

  const moviesArray = await db.all(getMovieNamesQuery)
  response.send(
    moviesArray.map(eachMovie => ({movieName: eachMovie.movie_name})),
  )
})

//creates a new movie in movie table
app.post('/movies/', async (request, response) => {
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails

  const addMovieQuery = `INSERT INTO 
        movie (director_id, movie_name, lead_actor)
     VALUES 
        (
            '${directirId}' ,
            '${movieName}' ,
            '${leadActor}'
        );`

  const dbResponse = await db.run(addMovieQuery)
  response.send('Movie Successfully Added')
})

//get a movie from movie table based on movie id
app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params

  const getMovieQuery = `SELECT *
     FROM movie
     WHERE movie_id = ${movieId} ;`

  const movie = await db.get(getMovieQuery)
  response.send(convertMovieDbObjectToResponseObject(movie))
})

//updates details of movie in movie table based on movie id
app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails

  const updateMovieQuery = `UPDATE movie
   SET 
       director_id = '${directorId}' ,
       movie_name = '${movieName}',
       lead_actor = '${leadActor}'  
   WHERE 
       movie_id = ${movieId} ; `

  await db.run(updateMovieQuery)
  response.send('Movie Details Updated')
})

//delete movie from movie table
app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params

  const deleteMovieQuery = `DELETE FROM movie
     WHERE movie_id = ${movieId} ;`

  await db.run(deleteMovieQuery)
  response.send('Movie Removed')
})

//returns a list of directors from director table
app.get('/directors/', async (request, response) => {
  const getDirectorSListQuery = `SELECT *
     FROM director ;`

  const directorsArray = await db.all(getDirectorSListQuery)
  response.send(
    directorsArray.map(director =>
      convertDirectorDbObjectToResponseObject(director),
    ),
  )
})

//returns a list of all movie names directed by a specific director
app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params

  const getDirectorMovieQuery = `SELECT movie_name
     FROM movie 
     WHERE director_id = ${directorId} ;`

  const moviesArray = await db.all(getDirectorMovieQuery)
  response.send(
    moviesArray.map(eachMovie => ({movieName: eachMovie.movie_name})),
  )
})

module.exports = app
