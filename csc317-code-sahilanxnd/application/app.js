require("dotenv").config();

const createError = require("http-errors");
const express = require("express");
const favicon = require('serve-favicon');
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const handlebars = require("express-handlebars");
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const postRouter = require('./routes/posts');
const session = require('express-session');
const mysql = require('mysql2/promise');
const MySQLStore = require('express-mysql-session')(session);
const flash = require('express-flash');
const { getDbConfig } = require('./conf/db-config');

const app = express();

app.set("trust proxy", 1);

app.engine(
  "hbs",
  handlebars({
    layoutsDir: path.join(__dirname, "views/layouts"), //where to look for layouts
    partialsDir: path.join(__dirname, "views/partials"), // where to look for partials
    extname: ".hbs", //expected file extension for handlebars files
    defaultLayout: "layout", //default layout for app, general template for all pages in app
    helpers: {
      mediaSrc: function (value) {
        if (!value) return "";
        if (String(value).startsWith("http://") || String(value).startsWith("https://")) {
          return value;
        }
        const cleaned = String(value).replace(/^\/?public\//, "");
        return `/public/${cleaned}`;
      },
    },
  })
);

// express-mysql-session strips `ssl` from options, so pass a pool with TLS already configured.
const sessionPool = mysql.createPool(getDbConfig());
const sessionStore = new MySQLStore({}, sessionPool);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");



app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('csc 317 super secret'));
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use("/public", express.static(path.join(__dirname, "public")));

app.use(session({
  key: 'csid',
  secret: 'csc 317 super secret',
  store: sessionStore,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
  }
}));

app.use(flash());

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});


app.use("/", indexRouter); 
app.use("/users", usersRouter); 
app.use('/posts', postRouter);



/**
 * Catch all route, if we get to here then the 
 * resource requested could not be found.
 */
app.use((req, res, next) => {
  next(createError(404, `The route ${req.method} : ${req.url} does not exist.`));
})


/**
 * Error Handler, used to render the error html file
 * with relevant error information.
 */
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = err;
  console.log(err);
  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
