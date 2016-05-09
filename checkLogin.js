//未登录
function noLogin(req,res,next){
    if(!req.session.user){
        console.log('抱歉,您还没登录!');
        return res.redirect('/login');
    }
    next();
}
function Login(req,res,next){
    if(req.session.user){
        console.log('您已经登录!');
        return res.redirect('/');
    }
    next();
}
exports.noLogin = noLogin;
exports.Login = Login;
