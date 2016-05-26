/**
 * Created by ASUS on 2016/5/21.
 */

window.onload=function(){
    var wechat=new Wechat();
    wechat.init();
}

var Wechat=function(){
    this.socket=null;
};

Wechat.prototype={
    init:function(){
        var that=this;
        this.socket=io.connect();
        console.log('test init()');
        this.socket.on('connect',function(){
            document.getElementById('info').textContent='please input your name';
            document.getElementById('nickWrapper').style.display='block';
            document.getElementById('nicknameInput').focus();
        });
        document.getElementById('loginBtn').addEventListener('click',function(){
            var nickname=document.getElementById('nicknameInput').value;
            if(nickname.trim().length!=0){
                that.socket.emit('login',nickname);//that and this means what
            }else{
                document.getElementById('nicknameInput').focus();
            }
        },false);
        this.socket.on('nickExisted',function(){
            document.getElementById('info').textContent="nickname already exist,choose another please";
        });
        this.socket.on('loginSuccess',function(){
            document.title="wechat | "+document.getElementById('nicknameInput').value;
            document.getElementById('loginWrapper').style.display='none';
            document.getElementById('messageInput').focus;
        });
        this.socket.on('system',function(nickname,userCount,type){
            var msg=nickname+(type==='login'?' joined':' left');
            that._displayNewMsg('system',msg,'red');//that 和 this是啥区别
           /* var p=document.createElement('p');
            p.textContent=msg;
            document.getElementById('historyMsg').appendChild(p);*/
            document.getElementById('status').textContent=userCount+(userCount>1?' users':' user')+' online';
        });
        document.getElementById('sendBtn').addEventListener('click',function(){
            var messageInput=document.getElementById('messageInput');
            var msg=messageInput.value;
            var color=document.getElementById('colorStyle').value;
            console.log('testColor1:'+color);
            messageInput.value='';
            messageInput.focus();
            if(msg.trim().length >0){
                that.socket.emit('postMsg',msg,color);
                //that._displayNewMsg('me',msg);如果有人取名为me咋办
            }
        },false);
        document.getElementById('sendImage').addEventListener('change',function(){
           if(this.files.length!=0){
               console.log("test this.files.length:"+this.files.length);
               var file=this.files[0];
               var reader=new FileReader();
               if(!reader){
                   that._displayNewMsg('system','your browser does not support file reader');
                   this.value='';
                   return;
               }
               var color=document.getElementById('colorStyle').value;
               reader.readAsDataURL(file);
               reader.onload=function(e){
                   console.log('test file reader e:'+e);
                   console.log('test file reader e.target.result:'+ e.target.result);
                   this.value='';
                   that.socket.emit('img', e.target.result,color);
                   //that._displayImage('me', e.target.result);
               }
               console.log('test image url');
           }
        },false);
        this.socket.on('newMsg',function(user,msg,color){
            that._displayNewMsg(user,msg,color);
        });
        this.socket.on('newImg',function(user,img,color){
            that._displayImage(user,img,color);
        });
        this._initialEmoji();
        document.getElementById('emoji').addEventListener('click',function(e){
            var emojiWrapper=document.getElementById('emojiWrapper');
            emojiWrapper.style.display='block';
            e.stopPropagation();//meaning?
        },false);
        document.body.addEventListener('click',function(e){
            var emojiWrapper=document.getElementById('emojiWrapper');
            if(e.target != emojiWrapper){
                emojiWrapper.style.display='none';
            }
        });
        document.getElementById('emojiWrapper').addEventListener('click',function(e){
            var target= e.target;
            if(target.nodeName.toLowerCase()=='img'){
                var messageInput=document.getElementById('messageInput');
                messageInput.focus();
                messageInput.value=messageInput.value+'[emoji:'+target.title+']';
            }
        },false);
        document.getElementById('nicknameInput').addEventListener('keyup',function(e){
            if(e.keyCode==13){
                var nickname=document.getElementById('nicknameInput').value;
                if(nickname.trim().length!=0){
                    that.socket.emit('login',nickname);
                }
            }
        },false);
        document.getElementById('messageInput').addEventListener('keyup',function(e){
            var messageInput=document.getElementById('messageInput');
            var msg=messageInput.value;
            var color=document.getElementById('colorStyle').value;
            if(e.keyCode==13 && msg.trim().length >0){
                messageInput.value='';
                messageInput.focus();
                that.socket.emit('postMsg',msg,color);
                //that._displayNewMsg('me',msg);如果有人取名为me咋办
            }
        },false);
        document.getElementById('clearBtn').addEventListener('click',function(){
            var historyMsg=document.getElementById('historyMsg');
            historyMsg.innerHTML='';
        },false);
    },
    _showEmoji:function(msg){
        var match,result=msg;
        var emojiIndex;
        var reg=/\[emoji:\d+\]/g;
        var totalEmojiNum=document.getElementById('emojiWrapper').children.length;
        while(match=reg.exec(msg)){
            emojiIndex=match[0].slice(7,-1);
            if(emojiIndex>totalEmojiNum || emojiIndex<0){
                result=result.replace(match[0],'[X]');
            }else{
                result=result.replace(match[0],'<img class="emoji" src="../content/emoji/'+emojiIndex+'.gif"\>');
            }
        }
        return result;
    },
    _displayNewMsg:function(user,msg,color){
        var container=document.getElementById('historyMsg');
        var msgToDisplay=document.createElement('p');
        var date=new Date().toTimeString().substr(0,8);
        msg=this._showEmoji(msg);
        console.log('testColor3:'+color);
        msgToDisplay.style.color=color || '#000';
        msgToDisplay.innerHTML=user+'<span class="timespan">('+date+'): </span>'+msg;
        container.appendChild(msgToDisplay);
        container.scrollTop=container.scrollHeight;//?
    },
    _displayImage:function(user,imageData,color){
        var container=document.getElementById('historyMsg');
        var msgToDisplay=document.createElement('p');
        var date=new Date().toTimeString().substr(0,8);
        msgToDisplay.style.color=color || '#000';
        msgToDisplay.innerHTML=user+'<span class="timespan">('+date+'):</span><br/>'+'<a href="'+imageData+'" target="_blank"><img src="'+imageData+'"/></a>';
        container.appendChild(msgToDisplay);
        container.scrollTop=container.scrollHeight;
    },
    _initialEmoji:function(){
        var emojiContainer=document.getElementById('emojiWrapper');
        var docFragment=document.createDocumentFragment();
        for(var i=69;i>0;i--){
            var emojiItem=document.createElement('img');
            emojiItem.src='../content/emoji/'+i+'.gif';
            emojiItem.title=i;
            docFragment.appendChild(emojiItem);
        }
        emojiContainer.appendChild(docFragment);
    }

}