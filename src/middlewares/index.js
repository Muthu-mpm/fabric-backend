const passport = require("passport");

const VerifyToken =async (req, res, next) => {
	try {
        console.log("verify token");
		var data =await passport.authenticate("jwt",  function(err, user, info) {
            console.log(err,user,info);
            if (err) { return next(err); }
            if (!user) { return res.redirect('/login'); }
            req.logIn(user, function(err) {
              if (err) { return next(err); }
              return res.redirect('/users/' + user.username);
            });
          })
        console.log(req.user,data);
			{
                console.log("inside verify");
                // res.status(401).json({
                //     error: 'Unauthorized API call.'
                // });
                // res.end();
            }
	}
	catch (err) {
        console.log(err);
        res.status(202).json({
            error: message
        });
        res.end();
	}

}
exports.VerifyToken = VerifyToken