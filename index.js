/**
 * Created by sunny on 16/4/2.
 */
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var crypto = require('crypto');
var session = require('express-session');

var moment = require('moment');
//引入mongoose模块
var mongoose = require('mongoose');
var checkLogin = require('./checkLogin.js');
//引入模型:用户,笔记
var models = require('./models/models');
var User = models.User;
var Note = models.Note;
//使用mongoose连接服务,db名为notes
mongoose.connect('mongodb://localhost:27017/myNote');
mongoose.connection.on('error',console.error.bind(console,'连接数据库失败'));

var app = express();
app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');

app.use(express.static(path.join(__dirname,'public')));

//定义数据分析器
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

//建立session模型,当用户登录成功后，需要将用户信息存入到session中

app.use(session({
    secret: '1234',
    name: 'myNote',
    cookie: {maxAge: 1000 * 60 * 20},//设置session保存的时间为20分钟
    resave :false,
    saveUninitialized:true
    //自定义的存储引擎实例.将数据存储到文件中，MyFIleStore()第一个参数传入目录名，数据均存储到这个目录下，以Session ID命名。
    ////store: new myFileStore()
}));

//响应首页get请求
app.get('/',checkLogin.noLogin);
app.get('/',function(req,res){
    //console.log(req.session.user);

        Note.find({author: req.session.user.username})
            .exec(function (err, allNotes) {
            if (err) {
                console.log(err);
                return res.redirect('/');
            }
            res.render('index', {
                title: '首页',
                user: req.session.user,
                notes: allNotes
            });
        })

});
app.get('/register',checkLogin.Login);
app.get('/register',function(req,res){
    console.log('注册!');
    res.render('register',{
        user:req.session.user,
        title:'注册'

    });
});

//接受register页面表单提交的数据,post请求.
app.post('/register',function(req,res) {
    var resJson = {
        status: false,
        msg: '',
    };
    //req.body可以获得表单的每项数据
    var username = req.body.username, password = req.body.password, passwordRepeat = req.body.passwordRepeat;
    //console.log('username:'+username +'password:'+ password+'passwordRepeat:'+ passwordRepeat);
    //检查输入的用户名是否为空,使用trim去掉两端的空格
    if (username.trim().length == 0) {

        //console.log('用户名不能为空!');
        resJson.msg = '用户名不能为空!';
        resJson.status = false;
        return res.send(resJson);
        //return res.redirect('/register');

    }
    if (password.trim().length == 0) {
        //console.log('密码不能为空!');
        resJson.msg = '密码不能为空!';
        resJson.status = false;
        return res.send(resJson);
        //return res.redirect('/register');

    }
    //检查两次密码是否相同
    if (password != passwordRepeat) {
        //console.log('两次输入密码不一致!');
        resJson.msg = '两次输入密码不一致!';
        resJson.status = false;
        return res.send(resJson);
        //return res.redirect('/register');

    }
    if (password != passwordRepeat) {
        //console.log('两次输入密码不一致!');
        resJson.msg = '两次输入密码不一致!';
        resJson.status = false;
        return res.send(resJson);
        //return res.redirect('/register');

    }
    if (!username.match( /^[\u4E00-\u9FA5a-zA-Z0-9_]{3,20}$/)) {
        resJson.msg = '只能是汉字 英文字母 数字 下划线组成，3-20位';
        resJson.status = false;
        return res.send(resJson);
    }



    //检查用户名是否已经存在,若不存在,保存该条记录
    User.findOne({username:username},function(err,user){
        if(err){
            console.log(err);
            return res.redirect('/register');
        }
        if(user){
            //console.log('该用户已经存在');
            //return res.redirect('/register');
            resJson.msg = '该用户已经存在!';
            resJson.status = false;
            return res.send(resJson);
        }
        //对密码进行md5加密
        var md5 = crypto.createHash('md5'),
            md5password = md5.update(password).digest('hex');

        //新建user对象保存数据
        var newUser = new User({
            username:username,
            password:md5password
        });
        newUser.save(function(err,doc){
            if(err){
                //console.log(err);
                //return res.redirect('/register');
                resJson.msg = err;
                resJson.status = false;
                return res.send(resJson);
            }else{
                //console.log('注册成功!');
                //return res.redirect('/');
                resJson.msg = '注册成功!';
                resJson.status = true;
                req.session.user = newUser;
                return res.send(resJson);
            }

        });
    });
});




app.get('/login',checkLogin.Login);
app.get('/login',function(req,res){
    console.log('登录!');
    res.render('login',{
        user:req.session.user,
        title:'登录',
        message:''
    });
});



//登录的逻辑代码
app.post('/login',function(req,res){
    var resJson = {
        status: false,
        msg: ''
    };
    //req.body可以获得表单的每项数据
    var username = req.body.username,
        password =  req.body.password;
    if (username.trim().length == 0) {

        //console.log('用户名不能为空!');
        resJson.msg = '用户名不能为空!';
        resJson.status = false;
        return res.send(resJson);
        //return res.redirect('/register');

    }
    if (password.trim().length == 0) {
        //console.log('密码不能为空!');
        resJson.msg = '密码不能为空!';
        resJson.status = false;
        return res.send(resJson);
        //return res.redirect('/register');

    }

    //检查用户名是否已经存在,若不存在,
    User.findOne({username:username},function(err,user){
        if(err){
            //console.log(err);
            resJson.msg = err;
            resJson.status = false;
            return res.send(resJson);
            //return res.redirect('/login');
        }
        console.log(username);

        if(!user){
            //console.log('该用户不存在');
            resJson.msg = '该用户不存在';
            resJson.status = false;
            return res.send(resJson);

            //res.render('login',{
            //    message:'该用户不存在'
            //});
            //return res.redirect('/login');
        }




        //对密码进行md5加密
        var md5 = crypto.createHash('md5'),
            md5password = md5.update(password).digest('hex');

        if(user.password!==md5password){
            //console.log('密码错误!');
            resJson.msg = '密码错误!';
            resJson.status = false;
            return res.send(resJson);
            //return res.redirect('/login');
        }
        //console.log('登录成功!');
        user.password = null;
        delete user.password;
        req.session.user = user;
        resJson.msg = '登录成功!';
        resJson.status = true;
        return res.send(resJson);

    });
});


app.get('/quit',function(req,res){
    req.session.user = null;
    console.log('退出!');
    return res.redirect('/login');
});

app.get('/post',checkLogin.noLogin);
app.get('/post',function(req,res){
    console.log(req.session.user);
    res.render('post',{
        user:req.session.user,
        title:'发布'
    });
});

app.post('/post',checkLogin.noLogin)
//发布的逻辑代码
app.post('/post',function(req,res){
    //req.body可以获得表单的每项数据
    var note = new Note({
        title :req.body.title,
        author:req.session.user.username,
        tag: req.body.tag,
        content:req.body.content

    });

    note.save(function(err,doc){
        if(err){
           console.log(err);
            return res.redirect('/post');
        }
        console.log('文章发表成功!');
        return res.redirect('/');
    })
});

//查看笔记详情
app.get('/detail/:_id',checkLogin.noLogin);
app.get('/detail/:_id',function(req,res){
    console.log('查看笔记!');
    Note.findOne({_id:req.params._id}).exec(function(err,art){
            if(err){
                console.log(err);
                return res.redirect('/');
            }
            if(art){
                res.render('detail',{
                    user:req.session.user,
                    title: '笔记详情',
                    art:art,
                    moment:moment
                });
            }
        });

});

//编辑笔记界面
app.get('/editor/:_id',checkLogin.noLogin);
app.get('/editor/:_id',function(req,res){
    console.log('修改笔记!');
    Note.findOne({_id:req.params._id}).exec(function(err,art){
        if(err){
            console.log(err);
            return res.redirect('/');
        }
        if(art){
            res.render('editor',{
                user:req.session.user,
                title: '编辑笔记',
                //art存储笔记信息
                art:art,
                moment:moment
            });
        }
    });

});


//提交修改后的笔记
app.post('/editor/:_id',checkLogin.noLogin)
//发布的逻辑代码
app.post('/editor/:_id',function(req,res){
    //提示信息
    var resJson ={
        status:false,
        msg:'',
        data:null

    };

    Note.update({
        _id:req.params._id
    }, {
        $set: {
            title :req.body.title,
            tag: req.body.tag,
            content:req.body.content
        }
    },function(err){
        if(err){
            resJson.msg='修改失败';
            resJson.status=false;
        }else{
            resJson.msg='修改成功';
            resJson.status=true;
        }
        res.send(resJson);
    });
});













//监听3000端口
app.listen(3000,function(req,res){
    console.log('app is running at port 3000');
});