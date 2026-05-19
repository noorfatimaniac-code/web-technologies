module.exports = {
  isLoggedIn: (req, res, next) => {
    if (req.session && req.session.user) {
      return next();
    }
    req.flash('error', 'You must be logged in to do that.');
    res.redirect('/auth/login');
  },
  
  isAdmin: (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role === 'admin') {
      return next();
    }
    req.flash('error', 'Access Denied: You do not have permission to view this page.');
    res.redirect('/');
  }
};
