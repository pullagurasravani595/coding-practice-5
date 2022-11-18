const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, async () => {
      console.log("server run at http://localhost/:3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
  }
};
initializeDBAndServer();

const convertDBObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.leadActor,
  };
};

app.get("/movies/", async (request, response) => {
  try {
    const getMovieQuery = `SELECT * FROM movie ORDER BY movie_id;`;
    const moviesArray = await db.all(getMovieQuery);
    response.send(
      moviesArray.map((eachObject) =>
        convertDBObjectToResponseObject(eachObject)
      )
    );
  } catch (e) {
    console.log(`DB error ${e.message}`);
  }
});

//create movie row
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const createMovieQuery = `
        INSERT INTO 
            movie (director_id, movie_name, lead_actor)
        VALUES (${directorId}, '${movieName}', '${leadActor}');`;
  await db.run(createMovieQuery);
  response.send("Movie Successfully Added");
});

//read particular movie
app.get("/movies/:movieId/", async (request, response) => {
  try {
    const { movieId } = request.params;
    console.log(movieId);
    const movieQuery = `
            SELECT
              *
            FROM
              movie
            WHERE
              movie_id = ${movieId};`;
    const dbResponse = await db.get(movieQuery);
    response.send(convertDBObjectToResponseObject(dbResponse));
  } catch (e) {
    console.log(`db error: ${e.message}`);
  }
});
