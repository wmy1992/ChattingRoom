# ChattingRoom
using nodejs+web socket

最近在学习nodejs，在网上看到一篇很好的文章“Node.js + Web Socket 打造即时聊天程序嗨聊”，就按照原文步骤写了程序，在此记录遇到的问题。
原文地址：https://segmentfault.com/a/1190000000479518


1.this的用法：
源代码：
HiChat.prototype = {
    init: function() {//此方法初始化程序
        var that = this;//将this所指地址赋给that
        //建立到服务器的socket连接
        this.socket = io.connect();
        //监听socket的connect事件，此事件表示连接已经建立
        this.socket.on('connect', function() {
            //连接到服务器后，显示昵称输入框
            document.getElementById('info').textContent = 'get yourself a nickname :)';
            document.getElementById('nickWrapper').style.display = 'block';
            document.getElementById('nicknameInput').focus();
        });
        this.socket.on('system',function(nickname,userCount,type){
            var msg=nickname+(type==='login'?' joined':' left');
            that._displayNewMsg('system',msg,'red');//that 和 this是啥区别？此时this指向的对象为socket对象，而非Hichat原型对象。
            document.getElementById('status').textContent=userCount+(userCount>1?' users':' user')+' online';
        });
    }
};
之所以添加var that=this这行代码，主要和JavaScript中this关键字的用法有关。this指向的总是调用函数的那个对象，随着调用对象的改变，this值也会改变，所以需要使用that变量保存住Hichat对象的地址。

2.获取图片的base64位方法：
var reader = new FileReader(), htmlImage;
reader.onload = function(e) {
    htmlImage = '<img src="'+ e.target.result +'" />';    // 这里e.target.result就是base64编码
}
reader.readAsDataURL(file);

3.addEventListener(type,function(event),useCapture)
type:即事件类型，不需要加on
function(event)未完待续
