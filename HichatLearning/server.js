/**
 * Created by ASUS on 2016/5/21.
 */
var express=require('express');
var app=express();
var server=require('http').createServer(app);
var io=require('socket.io').listen(server);//引入socket.io模块并绑定到服务器

app.use('/',express.static(__dirname+'/www'));//指定静态HTML文件的位置
server.listen(80);
var users=[];
io.on('connection',function(socket){
    socket.on('login',function(nickname){
        if(users.indexOf(nickname)!=-1){
            socket.emit('nickExisted');
        }else{
            socket.nickname=nickname;
            socket.userIndex=users.length;
            users.push(nickname);
            socket.emit('loginSuccess');
            io.sockets.emit('system',nickname,users.length,'login');
        }
    });
    socket.on('disconnect',function(){
       users.splice(socket.userIndex,1);
        socket.broadcast.emit('system',socket.nickname,users.length,'logout');//可以改成io.sockets.emit吗

    });
    socket.on('postMsg',function(msg,color){
        console.log('test color2:'+color);
        io.sockets.emit('newMsg',socket.nickname,msg,color);
    });
    socket.on('img',function(imgData,color){
        io.sockets.emit('newImg',socket.nickname,imgData,color);
    });
});