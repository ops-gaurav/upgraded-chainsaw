import express from 'express';
import path from 'path';
import resolver from './util/resolver';

const router = express.Router();

/* GET index page. */
router.get('/', (req, res, next) => {
  res.sendFile (resolver.htmlResolver.resolve('index.html'));
});

router.get ('/admin', (req, res) => {
  if (req.isAuthenticated () && req.user.doc.type == 'admin') {
    res.sendFile (resolver.htmlResolver.resolve('admin.html'));
  } else res.render ('error', {message: 'Unauthorized access'});
});

router.get ('/user', (req, res) => {
  if (req.isAuthenticated ()  && req.user.doc.type == 'user')
    res.sendFile (resolver.htmlResolver.resolve ('user.html'));
  else
    res.render ('error', {message: 'Unauthorized access'});
})

export default router;
