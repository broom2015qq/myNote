/**
 * Created by sunny on 16/4/2.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    username:String,
    password:String,
    email:String,
    createTime:{
        type:Date,
        default:Date.now()
    }
});
//笔记的数据模型
var noteSchema = new Schema({
    title:String,
    author:String,
    tag:String,
    content:String,
    createTime:{
        type:Date,
        default:Date.now()
    }
});
//将Schema发布为Model,名字为User,Note可以索引到
exports.User = mongoose.model('User',userSchema);
exports.Note = mongoose.model('Note',noteSchema);