
var express = require('express');
var mongodb = require('mongodb');
var bodyParser = require('body-parser');
var app = express();
var nodemailer = require("nodemailer");
var md5 = require('md5');
var http = require('http');
var session = require('express-session');
var cookieParser = require('cookie-parser');

app.use(cookieParser());
app.use(session({secret:'wj;oeifj;wa',
				saveUninitialized:true,
				resave:true}));


//Configuration
/*
	Here we are configuring our SMTP Server details.
	STMP is mail server which is responsible for sending and recieving email.
*/
var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "iseeking101@gmail.com",
        pass: "iseeking20155"
    }
});
/*------------------SMTP Over-----------------------------*/
// create application/json parser
var jsonParser = bodyParser.json();

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: true });



var mongodbURL = 'mongodb://iseeking101:iseeking2015@ds027318.mongolab.com:27318/iseeking';
var myDB;

mongodb.MongoClient.connect(mongodbURL, function(err, db) {
	if (err) {
		console.log(err);
	} else {
		myDB = db;
		console.log('connection success');
	}
});



/*登出
http.get("/logout", function(req, res){
    //刪除session
    req.session.destroy(function(error){
        res.send("成功刪除session");
    });
});
*/

app.get('/', function(req, res) {
	
 
	var html = '<p>welcome tracking of missing uncle!</p>'+'<form action="/updateMember" method="post">' +
               'Enter your name:' +
               '<input type="text" name="user" placeholder="user" />' +
			   '<input type="text" name="userName" placeholder="userName" />' +
			   '<input type="text" name="userPhone" placeholder="userPhone" />' +
			   '<input type="text" name="userAddress" placeholder="userAddress" />' +
			   '<input type="text" name="reward" placeholder="reward" />' +
			   '<input type="text" name="location" placeholder="location" />' +
			   '<input type="text" name="longitude" placeholder="longitude" />' +
			   '<input type="text" name="latitude" placeholder="latitude" />' +
			   
			   //'<input type="text" name="groupMember" placeholder="..." />' +
			   
               '<br>' +
               '<button type="submit">Submit</button>' +
            '</form>';
    
    
	res.status(200).send(html);
	res.end();
});
app.post('/getOld',urlencodedParser,function(req,res){
	 
	
	var whereName = {"user" : req.body.user,old_detail:{$exists:true}};
	var collection = myDB.collection('login');
	collection.find(whereName).toArray(function(err, docs) {
		if(err){
			res.status(406).send(err);
			res.end();
		}else{
			if (typeof docs[0] !== 'undefined' && docs[0] !== null ) { 
			res.type('application/json');
			var jsonData = JSON.stringify(docs);
			var jsonObj = JSON.parse(jsonData);
			console.log(jsonObj[0].old_detail.userName);
			res.status(200).send(docs);
			res.end();
			}else{
				res.type('text/plain');
				res.status(200).send("no detail");
				res.end();
			}
		}
	});
});

app.post('/groupService',urlencodedParser,function(req,res){
	var user = req.body.user;
	var collection = myDB.collection('login');
	//1 for add groupMember.
	var groupMemberv = req.body.groupMember;
	if(req.body.status == "1"){
		
		collection.find().toArray(function(err,docs){
		if(err){
			res.status(406).send(err);
			res.end();
		}else{
			var jsonData = JSON.stringify(docs);
			var jsonObj = JSON.parse(jsonData);
			var e ="";
			console.log("in find");
			for(var i =0 ; i < jsonObj.length ;i++){
				
				if ( jsonObj[i].user == groupMemberv ){
					e = "exist";
					console.log("e="+e);
					break;
				} 	
				console.log("in for"+i);
			}
			
			if ( e == "exist") { 
				console.log("in exist");
				// $in means there are fit words in field
				collection.find({"user":user, "old_detail.groupMember":{ $in:[groupMemberv]}}).toArray(function(err, docs) {
				    if(err){
				    	res.send("There was a problem adding the information to the database.");
						console.log(err);
				    	
				    }else{
				        if (typeof docs[0] !== 'undefined' && docs[0] !== null ) { 
							res.type("text/plain");
							res.status(200).send("exist");
							res.end();	
						}else{
							collection.update({"user":user,"old_detail.groupMember":{$ne:groupMemberv}}, {$push: {"old_detail.groupMember":groupMemberv}},  function(err) {
				  				if(err){
									res.send("There was a problem adding the information to the database.");
									console.log(err);		
								}else{
									res.type("text/plain");
									res.status(200).send("ok");
									res.end();	
								}
							});
						}
				    }
				});
			}else{
				res.type("text/plain");
				res.status(200).send("no user");
				res.end();
			}
		}
		});
	
	}
	//2 for getAllGroupMember.
	if(req.body.status == "2"){
		var whereName = {"user" : user, "old_detail.groupMember":{$exists:true}};
		collection.find(whereName).toArray(function(err,docs){
			if(err){
				res.status(406).send(err);
				res.end();
			}else{
				if (typeof docs[0] !== 'undefined' && docs[0] !== null ) { 
					res.type('application/json');
					var jsonData = JSON.stringify(docs);
					var jsonObj = JSON.parse(jsonData);
					console.log(jsonObj[0].detail.userName);
					res.status(200).send(docs);
					res.end();
				}else{
					res.type('text/plain');
					res.status(200).send("no detail");
					res.end();
				}
			}
		});
	}
	if(req.body.status =="3"){
		var oldNames ="";
			collection.find({"old_detail.groupMember": {$in:[user]}}).toArray(function(err, docs) {
				if(err){
					res.status(406).send(err);
					res.end();
				}else{
					if (typeof docs[0] !== 'undefined' && docs[0] !== null ) { 
							res.type("application/json");
							// var jsonData = JSON.stringify(docs);
							// var jsonObj = JSON.parse(jsonData);
							// for(var i = 0 ; i < docs.length ; i++){
								
							// 	oldNames += jsonObj[i].old_detail.oldName;
							// 	if(i<(docs.length)-1){
							// 		oldNames += ",";
							// 	}
							// }
							res.status(200).send(docs);
							res.end();
					}else{
						res.type("text/plain");
						res.status(200).send("nothing");
						res.end();
					}
				}
			});
	}
	//判斷某物件裡有沒有資料
	// if(req.body.status == "4" ){
	// 	//查beaconid 有沒有登入,沒有就不能進入群組
	// 	collection.find({"user":req.body.user}).toArray(function(err, docs) {
	// 			if(err){
	// 				res.status(406).send(err);
	// 				res.end();
	// 			}else{
	// 				if ( typeof docs[0].old_detail.beaconId !== 'undefined' && docs[0].old_detail.beaconId !== null && docs[0].old_detail.beaconId !== ""  ) { 
	// 						res.type("text/plain");
	// 						 //var jsonData = JSON.stringify(docs);
	// 						 //var jsonObj = JSON.parse(jsonData);
	// 						// for(var i = 0 ; i < docs.length ; i++){
								
	// 						// 	oldNames += jsonObj[i].old_detail.oldName;
	// 						// 	if(i<(docs.length)-1){
	// 						// 		oldNames += ",";
	// 						// 	}
	// 						// }
	// 						//console.log("beaconId= "+docs[0].old_detail.beaconId+" ,  "+  (typeof docs[0].old_detail.beaconId)+" ,user = "+docs[0].user );
	// 						res.status(200).send("ok");
	// 						res.end();
	// 				}else{
	// 					res.type("text/plain");
	// 					res.status(200).send("nothing");
	// 					res.end();
	// 				}
	// 			}
	// 		});
		
	// }
	
});

app.post('/getMember',urlencodedParser,function(req,res){
	 
	
	var whereName = {"user" : req.body.user,detail:{$exists:true}};
	var collection = myDB.collection('login');
	collection.find(whereName).toArray(function(err, docs) {
		if(err){
			res.status(406).send(err);
			res.end();
		}else{
			if (typeof docs[0] !== 'undefined' && docs[0] !== null ) { 
			res.type('application/json');
			var jsonData = JSON.stringify(docs);
			var jsonObj = JSON.parse(jsonData);
			console.log(jsonObj[0].detail.userName);
			res.status(200).send(docs);
			res.end();
			}else{
				res.type('text/plain');
				res.status(200).send("no detail");
				res.end();
			}
		}
	});
});
app.post('/updateOld',urlencodedParser,function(req,res){
	var user = req.body.user;
	var oldName = req.body.oldName;
	var oldCharacteristic = req.body.oldCharacteristic;
	var oldhistory = req.body.oldhistory;
	var oldclothes = req.body.oldclothes;
	var oldaddr = req.body.oldaddr;
	var beaconId = req.body.beaconId;
 	var collection = myDB.collection('login');
	var whereName = {"user": user};
//
	collection.update(whereName, {$set: {"old_detail.oldName":oldName,"old_detail.oldCharacteristic":oldCharacteristic,"old_detail.oldhistory":oldhistory,"old_detail.oldclothes":oldclothes,"old_detail.oldaddr":oldaddr}},  function(err) {
      if(err){
		    res.send("There was a problem adding the information to the database.");
		    console.log(err);		
		}else{
			res.type("text/plain");
			res.status(200).send("ok");
			res.end();	
		}
    });
});
app.post('/updateBeaconId',urlencodedParser,function(req,res){
	var user = req.body.user;
	var beaconId = req.body.beaconId;
 	var collection = myDB.collection('login');
	var whereName = {"user": user};
	collection.find().toArray(function(err,docs){
		if(err){
			res.status(406).send(err);
			res.end();
		}else{
			var jsonData = JSON.stringify(docs);
			var jsonObj = JSON.parse(jsonData);
			var e ="";
			console.log("in find");
			for(var i =0 ; i < jsonObj.length ;i++){
				
				if ( jsonObj[i].old_detail.beaconId == beaconId ){
					e = "exist";
					console.log("e="+e);
					break;
				} 	
				console.log("in for"+i);
			}
			
			if ( e == "exist") { 
			console.log("in exist");
			res.type("text/plain");
			res.status(200).send("exist");
			res.end();
			}else{
				collection.update(whereName, {$set: {"old_detail.beaconId":beaconId}},  function(err) {
					if(err){
					res.send("There was a problem adding the information to the database.");
					console.log(err);		
					}else{
					res.type("text/plain");
					res.status(200).send("ok");
					res.end();	
					}	
				});
			}
		}
		
	});
});
app.post('/updateMember',urlencodedParser,function(req,res){
	var user = req.body.user;
	var userName = req.body.userName;
	var userPhone = req.body.userPhone;
	var userAddress = req.body.userAddress;
	var reward = req.body.reward;
	var location = req.body.location;
	var longitude = parseFloat(req.body.longitude);
    var latitude = parseFloat(req.body.latitude);
 	var collection = myDB.collection('login');
	var whereName = {"user": user};
	
    if (!isNaN(longitude)) {
    	//is number part
           longitude = parseFloat(req.body.longitude);
    }else {
	       longitude = null;
    }
    if (!isNaN(latitude)) {
    	//is number part
           latitude = parseFloat(req.body.latitude);
    }else {
	       latitude = null;
    }
	
	collection.update(whereName, {$set: {"detail.userName":userName,"detail.userPhone":userPhone,"detail.userAddress":userAddress,"detail.reward":reward,"detail.location":location,"detail.longitude":longitude,"detail.latitude":latitude}},  function(err) {
      if(err){
		    res.send("There was a problem adding the information to the database.");
		    console.log(err);		
		}else{
			res.type("text/plain");
			res.status(200).send("ok");
			res.end();	
		}
    });
});


app.post('/login',urlencodedParser,function(req,res){
	
  //確認session有無user在沒有就執行登入，有就直接回傳
  if(req.session.user){
	  res.type('text/plain');
	  res.status(200).send("1");  
  }
  else{
  //sess.cookie.maxAge = 5000;
  //user存入session
 // req.session.user = req.body.user;
  //抓取post 參數
  var user_name = req.body.user;
  var user_password = md5(req.body.password);
  if (!req.body) return res.sendStatus(400);
  //設定query條件
  var whereMf ={"user": user_name,"password": user_password};
  var collection = myDB.collection('login');
	collection.find(whereMf).toArray(function(err, docs) {
		if (err) {
			res.status(406).send(err);
			res.end();
		} else {
			var jsonData = JSON.stringify(docs);
			var jsonObj = JSON.parse(jsonData);
			var rt = "0";
			//如果不是undefined或不是null表示有查到資料，則回傳
			if (typeof docs[0] !== 'undefined' && docs[0] !== null) { 
				if(jsonObj[0].comfirm == 0){
					rt = "2"; console.log("帳號無開通");
					res.type('text/plain');
					res.status(200).send(rt); 
					res.end();
				}else{
					rt = "1"; console.log("login");
					res.type('text/plain');
					res.status(200).send(rt);  
					res.end();
				}
				
			}else{
				rt = "0";
				res.type('text/plain');
				res.status(200).send(rt);  
				res.end();
			}
		}
	});
  }
});


app.get('/comfirm',function(req,res){
	var mf = req.query.mf
	var user_name = req.query.user
	var collection = myDB.collection('login');
	var whereName = {"user": user_name,"mf": mf};
	collection.update(whereName, {$set: {"comfirm":1}},  function(err) {
      if(err){
		    res.send("There was a problem adding the information to the database.");
		    console.log(err);		
		}else{
			res.type("text/plain");
			res.status(200).send("帳號已開通");
			res.end();	
		}
    });
});
app.post('/testMail',urlencodedParser,function(req,res){
	var content = "帳號:"+ req.body.user + "  您好，請點網址開通帳號: http://beacon-series.herokuapp.com/comfirm?"
	var mailOptions={
		to : req.body.email,
		subject : "認證信",
		text : content
	}	
	smtpTransport.sendMail(mailOptions, function(error, response){
			if(error){
				console.log(error);	
				res.send(error);
			}else{
			res.send("OK");	
			console.log("Message sent: " + response.message);		
			}
			});
});
app.post('/register',urlencodedParser,function(req,res){
	console.log("in register app");
    var user_name = req.body.user;
	var user_password = req.body.password;
	var user_email = req.body.email;
	var mf = md5(Math.random());
	var collection = myDB.collection('login');
	var content = "帳號:"+ user_name + "  您好，請點網址開通帳號: http://beacon-series.herokuapp.com/comfirm?mf=" + mf + "&user="+user_name
	var mailOptions={
		to : user_email,
		subject : "認證信",
		text : content
	}
	console.log(user_name);
	collection.find({"user":user_name}).toArray(function(err,docs){
		if(err){
			res.status(406).send(err);
			res.end();
		}else{
			//有查到資料 ,代表帳號已被使用
			if (typeof docs[0] !== 'undefined' && docs[0] !== null ) {
				res.type("text/plain");
				res.status(200).send("exist");
				res.end();
			}else{
				collection.insert({
		"id":"",
        "user" : user_name,
        "password" : md5(user_password),
		"email" : user_email,
		"comfirm" : 0,
		"mf" : mf,
		"pic":"",
		"myGroup":[],
		"detail" : {
			"userName":"",
			"userPhone":"",
			"userAddress":"",
			"reward":"",
			"location":"",
			"longitude" :null ,
			"latitude" : null,
		},
		"old_detail":{
			"beaconId":"",
			"oldName":"",
			"oldCharacteristic":"",
			"oldhistory":"",
			"oldclothes":"",
			"oldaddr":"",
			"groupMember":[]
			
		}
    }, function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        }
        else {
			console.log("data inserted");
            // If it worked, set the header so the address bar doesn't still say /adduser
            res.type("text/plain");
			res.status(200).send("OK");
			smtpTransport.sendMail(mailOptions, function(error, response){
			if(error){
				console.log(error);		
			}else{
			console.log("Message sent: " + response.message);		
			}
			});
			res.end();
            // And forward to success page
            
        }
    });
				
			}
				
		}	

	});
	
});


/*
app.get('/api/test', function(request, response) {
	var user_name = request.query.user;
	var user_password = request.query.password;
	
	var collection = myDB.collection('login');
	collection.find({}).toArray(function(err, docs) {
		if (err) {
			response.status(406).send(err);
			response.end();
		} else {
			response.type('application/json');
			response.status(200).send(docs);
			response.end();
		}
	})
});
*/
var port = process.env.PORT || 3000; // process.env.PORT for Heroku
http.createServer(app).listen(port);

