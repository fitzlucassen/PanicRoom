function ClientController(view){this.socket={},this.view=view}function ErrorView(){this.divError=$("#error-view")}function MainView(){}function appendCharacterTaken(users,u,element){element.children("span").text()==users[u].character&&element.append('<div class="characterTaken characterTaken-'+users[u].id+'"><p>'+users[u].name+"</p></div>")}function moreThanFourPlayers(array){var cpt=0;for(var a in array)array.hasOwnProperty(a)&&""!=array[a].character&&cpt++;return cpt>=4}function findInArray(array,val){for(var a in array)if(array.hasOwnProperty(a)&&array[a].id==val)return a}function debugArray(array){for(var a in array)console.log(a+" -> "+array[a])}$(document).ready(function(){var View=new MainView,ErrView=new ErrorView,Client=new ClientController(View);Client.initialize(),$("body").on("click","#getMyName",function(){var patt=/[a-zA-Z\-\']+/;return patt.test($("#newName").val())?(Client.newUser($("#newName").val()),void $("#popin-grayback").fadeOut("slow")):(ErrView.manageLoginError(),!1)}),$("body").on("click","#popin, #popin-grayback",function(e){e.stopPropagation(),$(this).hasClass("grayback")&&$("#popin-grayback").fadeOut("slow")}),$("body").on("mouseover",".personnage li",function(){$this=$(this),$(".personnage li").each(function(){$this[0]!=$(this)[0]&&$(this).stop().animate({opacity:"0.6"},200)})}).on("mouseleave",".personnage li",function(){$(".personnage li").stop().animate({opacity:"1"},200)}),$("body").on("click","ul.personnage li, .characterTaken",function(e){e.stopPropagation(),$(this).hasClass("characterTaken")||($(".characterTaken-"+$(".userID").val()).remove(),Client.characterChoosen($(this).children("span").text(),$(".userID").val()))}),$("body").on("click",".btn",function(){Client.play()})});var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(input){var chr1,chr2,chr3,enc1,enc2,enc3,enc4,output="",i=0;for(input=Base64._utf8_encode(input);i<input.length;)chr1=input.charCodeAt(i++),chr2=input.charCodeAt(i++),chr3=input.charCodeAt(i++),enc1=chr1>>2,enc2=(3&chr1)<<4|chr2>>4,enc3=(15&chr2)<<2|chr3>>6,enc4=63&chr3,isNaN(chr2)?enc3=enc4=64:isNaN(chr3)&&(enc4=64),output=output+this._keyStr.charAt(enc1)+this._keyStr.charAt(enc2)+this._keyStr.charAt(enc3)+this._keyStr.charAt(enc4);return output},decode:function(input){var chr1,chr2,chr3,enc1,enc2,enc3,enc4,output="",i=0;for(input=input.replace(/[^A-Za-z0-9\+\/\=]/g,"");i<input.length;)enc1=this._keyStr.indexOf(input.charAt(i++)),enc2=this._keyStr.indexOf(input.charAt(i++)),enc3=this._keyStr.indexOf(input.charAt(i++)),enc4=this._keyStr.indexOf(input.charAt(i++)),chr1=enc1<<2|enc2>>4,chr2=(15&enc2)<<4|enc3>>2,chr3=(3&enc3)<<6|enc4,output+=String.fromCharCode(chr1),64!=enc3&&(output+=String.fromCharCode(chr2)),64!=enc4&&(output+=String.fromCharCode(chr3));return output=Base64._utf8_decode(output)},_utf8_encode:function(string){string=string.replace(/\r\n/g,"\n");for(var utftext="",n=0;n<string.length;n++){var c=string.charCodeAt(n);128>c?utftext+=String.fromCharCode(c):c>127&&2048>c?(utftext+=String.fromCharCode(c>>6|192),utftext+=String.fromCharCode(63&c|128)):(utftext+=String.fromCharCode(c>>12|224),utftext+=String.fromCharCode(c>>6&63|128),utftext+=String.fromCharCode(63&c|128))}return utftext},_utf8_decode:function(utftext){for(var string="",i=0,c=0,c2=0;i<utftext.length;)c=utftext.charCodeAt(i),128>c?(string+=String.fromCharCode(c),i++):c>191&&224>c?(c2=utftext.charCodeAt(i+1),string+=String.fromCharCode((31&c)<<6|63&c2),i+=2):(c2=utftext.charCodeAt(i+1),c3=utftext.charCodeAt(i+2),string+=String.fromCharCode((15&c)<<12|(63&c2)<<6|63&c3),i+=3);return string}};!function(){"use strict";angular.module("Room25App").controller("CharacterCtrl",function($scope,$http,$location){$scope.characters=[],$scope.readyToPlay=-1,$http({method:"GET",url:"characters.json"}).success(function(data){$scope.characters=data}).error(function(data,status,headers,config){console.log(data),console.log(status),console.log(headers),console.log(config)}),$scope.$watch("readyToPlay",function(newValue){"1"===newValue&&($scope.readyToPlay=newValue,$location.path("/game"))},!0)})}(),ClientController.prototype.initialize=function(){this.socket=io.connect("http://localhost:1337"),that=this,this.socket.on("connectedUser",function(object){that.view.appendUserID(object.me),that.view.refreshUsers(object.users)}),this.socket.on("disconnectedUser",function(user){that.view.deleteUser(user)}),this.socket.on("newCharacter",function(object){that.view.deleteCharacter(object.id,object.name,object.pseudo)}),this.socket.on("cantPlay",function(){that.view.deleteButton()}),this.socket.on("letsPlay",function(){that.view.showButton()}),this.socket.on("play",function(object){that.view.redirectToGame(object)})},ClientController.prototype.newUser=function(name){this.socket.emit("readyToPlay",{name:name})},ClientController.prototype.characterChoosen=function(name,id){this.socket.emit("characterChoosen",{name:name,id:id})},ClientController.prototype.play=function(){this.socket.emit("emitPlay")},ErrorView.prototype.manageLoginError=function(){$("#newName").css({color:"red","box-shadow":"0 0 5px red","-webkit-box-shadow":"0 0 5px red","-moz-box-shadow":"0 0 5px red","-o-box-shadow":"0 0 5px red"}),$("#newName").attr("placeholder","Requis, lettre uniquement. ' et - autorisés.")},function(){"use strict";angular.module("Room25App").controller("GameCtrl",function($scope,$http){$scope.tuiles=[],$http({method:"GET",url:"tuiles.json"}).success(function(data){$scope.tuiles=data}).error(function(data,status,headers,config){console.log(data),console.log(status),console.log(headers),console.log(config)})})}(),function(){"use strict";var app=angular.module("Room25App",["ngRoute"]);app.config(function($routeProvider){$routeProvider.when("/",{templateUrl:"Views/home.html"}).when("/game",{templateUrl:"Views/game.html",reloadOnSearch:!1}).otherwise({redirectTo:"/"})}),app.controller("MainCtrl",function(){})}(),MainView.prototype.appendUserID=function(user){$(".userID").val(user.id)},MainView.prototype.deleteCharacter=function(id,name,pseudo){$("ul.personnage li").each(function(){$(this).children("span").text()==name&&$(this).append('<div class="characterTaken characterTaken-'+id+'"><p>'+pseudo+"</p></div>")})},MainView.prototype.deleteUser=function(user){$(".characterTaken-"+user.id).remove()},MainView.prototype.refreshUsers=function(users){for(var u in users)users.hasOwnProperty(u)&&""!==users[u].character&&$("ul.personnage li").each(appendCharacterTaken,users,u,$(this))},MainView.prototype.showButton=function(){$(".btn").fadeIn(200,function(){$(".btn").css("display","block")})},MainView.prototype.deleteButton=function(){$(".btn").fadeOut(200)},MainView.prototype.redirectToGame=function(object){$(".readyToPlay").val(1),$(".readyToPlay").trigger("change");var that=this;setTimeout(function(){that.showPlayers(object)},500)},MainView.prototype.showPlayers=function(object){for(var u in object.users)object.users.hasOwnProperty(u)&&$(".gameContainer").append('<div class="character">'+object.users[u].name+"</div>")};var express=require("express"),http=require("http"),app=express(),server=http.createServer(app).listen(1337),io=require("socket.io").listen(server),users=[],nbUser=-1,User=function(name){this.id=0,this.name=name,this.position={x:2,y:2},this.character=""};io.sockets.on("connection",function(socket){console.log("Nouvel utilisateur");var me=!1;socket.on("readyToPlay",function(name){me=new User(name.name),me.id=++nbUser,users.push(me),socket.emit("connectedUser",{me:me,users:users}),console.log("L'utilisateur "+me.id+" : "+me.name+" s'est connecté")}),socket.on("characterChoosen",function(object){me.character=object.name,console.log("L'utilisateur "+me.id+" : "+me.name+" a choisi le personnage "+object.name),io.sockets.emit("newCharacter",{id:object.id,name:object.name,pseudo:me.name}),moreThanFourPlayers(users)&&(console.log("Le jeu peut démarrer"),io.sockets.emit("letsPlay"))}),socket.on("emitPlay",function(){io.sockets.emit("play",{me:me,users:users})}),socket.on("disconnect",function(){return me?(console.log("L'utilisateur "+me.id+" : "+me.name+" s'est déconnecté"),users.splice(findInArray(users,me.id),1),debugArray(users),io.sockets.emit("disconnectedUser",me),void(moreThanFourPlayers(users)||io.sockets.emit("cantPlay"))):!1})}),exports=module.exports=server,exports.use=function(){app.use.apply(app,arguments)};