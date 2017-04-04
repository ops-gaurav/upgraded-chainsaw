import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import Debug from 'debug';
import express from 'express';
import logger from 'morgan';
// import favicon from 'serve-favicon';
import path from 'path';
import expressSession from 'express-session';
import sassMiddleware from 'node-sass-middleware';
import passport from 'passport';
import flash from 'connect-flash';

import index from './routes/index';
import user from './routes/user-router';
import order from './routes/orders-router';
import product from './routes/products-router';
import category from './routes/category_router';
// import AltRoute from './routes/user_alt_route';

const app = express();
const debug = Debug('shop:app');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use (expressSession ({secret: 'winteriscoming', resave: false, saveUninitialized: true, cookie: {maxAge: 1000000000000}}));
app.use(cookieParser());

app.use ( passport.initialize() );
app.use ( passport.session() );
app.use (flash ());

app.use(express.static(path.join(__dirname, 'public')));
app.use (express.static (path.join (__dirname, 'bower_components')));
// path to angular templates
app.use (express.static (path.join (__dirname, 'public/javascripts/angular/templates')));

app.use ('/', index);
app.use ('/user', user);
app.use ('/order', order);
app.use ('/product', product);
app.use ('/category', category);

/**
 * EXPERIMENTAL
 */
// app.use ('/alt', AltRoute);

export default app;
