
var express = require('express');
var mongodb = require('mongodb');
var GCMmongodb = require('mongodb');
var bodyParser = require('body-parser');
var app = express();
var nodemailer = require("nodemailer");
var md5 = require('md5');
var http = require('http');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var gcm = require('node-gcm');
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
var mongodbGCMURL = 'mongodb://iseeking101:iseeking2015@ds045064.mongolab.com:45064/android-gcm-push-db';
var gcmDB;

GCMmongodb.MongoClient.connect(mongodbGCMURL, function(err, db) {
	if (err) {
		console.log(err);
	} else {
		gcmDB = db;
		console.log('gcmdb connection success');
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
	
 
	var html = '<p>welcome tracking of missing uncle!</p>'+'<form action="/send" method="post">' +
               'Enter your name:' +
               '<input type="text" name="user" placeholder="user" />' +
			   '<input type="text" name="oldName" placeholder="oldName" />' +
			   '<input type="text" name="oldCharacteristic" placeholder="oldCharacteristic" />' +
			   '<input type="text" name="oldhistory" placeholder="oldhistory" />' +
			   '<input type="text" name="oldaddr" placeholder="oldaddr" />' +
			   '<input type="text" name="beaconId" placeholder="beaconId" />' +
			   '<input type="text" name="groupMember" placeholder="groupMember" />' +
			   '<input type="text" name="statusv" placeholder="statusv" />' +
			   '<input type="text" name="oldclothes" placeholder="oldclothes" />' +
      //         '<input type="text" name="user" placeholder="user" />' +
			   //'<input type="text" name="userName" placeholder="userName" />' +
			   //'<input type="text" name="userPhone" placeholder="userPhone" />' +
			   //'<input type="text" name="userAddress" placeholder="userAddress" />' +
			   //'<input type="text" name="reward" placeholder="reward" />' +
			   //'<input type="text" name="location" placeholder="location" />' +
			   '<input type="text" name="longitude" placeholder="longitude" />' +
			   '<input type="text" name="latitude" placeholder="latitude" />' +
			   
			   //'<input type="text" name="groupMember" placeholder="..." />' +
			   
               '<br>' +
               '<button type="submit">Submit</button>' +
            '</form>';
    
    
	res.status(200).send(html);
	res.end();
});

app.post('/updateStatusv',urlencodedParser,function(req, res){
	var collection = myDB.collection('login'); 
	var beaconId = req.body.beaconId;
    function setStatusvUpdate(){
		
    	collection.update({"old_detail.beaconId":beaconId},{$set:{"old_detail.$.statusv":"0"}},function(err) {
    	  if(err){
    	  	console.log(err);
    	  	res.send(err);
    	  	res.end();
    	  }else{
    	  	console.log("update statusv ok ");	
    	  	res.send("ok");
    	  	res.end();
    	  }
    	});
    }
    setStatusvUpdate();
});




//gcm
app.post('/send',urlencodedParser,function(req,res){

  //req.body.longitude,req.body.latitude
    
	var registration_ids = [];
	var message = new gcm.Message({
		id: 1,
		collapseKey: 'demo',
		data: {
		
		},
		notification: {
			title: "Hello, World",
			icon: "ic_launcher",
			body: "This is a notification that will be displayed ASAP."
		}
	});
	
	var gcm_connection = new gcm.Sender("AIzaSyD7ri5BkzqDX4ZzZDK9XfSnAjpw-Md8Ptc");

	//要從手機post過來的參數
	var user = req.body.user
	var beaconId =req.body.beaconId
	var oldName = req.body.oldName
    var longitude = parseFloat(req.body.longitude);
    var latitude = parseFloat(req.body.latitude);
	// var longitude = 121.3329606;
 //   var latitude = 24.9941045;
	// var oldName = "鄒雅雯";
	var GCMcollection = gcmDB.collection('pushassociations');
    var collection = myDB.collection('login'); 
    var leftLongitude = longitude - 1.0;
    var rightLongitude = longitude + 1.0;
    var leftLatitude = latitude - 1.0;
    var rightLatitude = latitude + 1.0; 
    //console.log("leftLongitude = "+leftLongitude +" rightLongitude = "+ rightLongitude
    //    + " leftLatitude = "+leftLatitude +" rightLatitude = " + rightLatitude); 
    //查詢user位置是否在範圍內 將user 帳號擺入陣列
    //aa方法處理完成後呼叫gcmpush

   function setStatusvUpdate(){
		
    	collection.update({"old_detail.beaconId":beaconId},{$set:{"old_detail.$.statusv":"1"}},function(err) {
    	  if(err){
    	  	console.log(err);
    	  	res.send(err);
    	  	res.end();
    	  }else{
    	  	console.log("update statusv ok ");	
    	  	// res.send("ok");
    	  	// res.end();
    	  	
    	  }
    	});
    }
	message.addData("message",oldName+"  在您的附近走失了，請幫忙注意，謝謝!");
	message.addData("longitude" , longitude);
	message.addData("latitude", latitude);
	// registration_ids.push("APA91bHOQez8fEHFZWLr97fvb7HxxfXcUPOHQ_XCEs1KSX0bmY8Xeq5SPqrdLgdrC5GCR6NG7m0bvxJoOVxw4mK5VHA3NSwXyuc7ibzNeick_0CuPutlQcUtmorgAoE9gXUFt0hWHRsw");
	// registration_ids.push("APA91bHOQez8fEHFZWLr97fvb7HxxfXcUPOHQ_XCEs1KSX0bmY8Xeq5SPqrdLgdrC5GCR6NG7m0bvxJoOVxw4mK5VHA3NSwXyuc7ibzNeick_0CuPutlQcUtmorgAoE9gXUFt0hWHRsw");
	// registration_ids.push("APA91bGmIcsXRlgYgQaRysqUVMlfCbsuKCXbHJJsyd2_R8xWataHDns-pDXp_JuIbg8dbio0eEMBtGuDacBKGDbhQMQ0ElpG-Rzwuq42FOkiihLA56B9PaimHlnMGJS5PJoM-G28Mj8J");
	// registration_ids.push("APA91bGtoeHyBr7wan-DcwzUY_ejvS3Jdpz75Pb1pMNPRDFS9EW-UlXqr7pFGKWZElbfS8g2fpW-11yYlp3Rf_278u_Li1pclyg7w1gYC42AL27U3IyaoJdZEPgSkFoEau_9JK7IpsFZ");
	// registration_ids.push("APA91bGkoM8GDTXgDqVnYKWFHkmg8ld_y8YtD6Bg33oPugppeo7wgj7bZoFsWNRe-cmWJrc9zMvZwboGLBkydqcNSQMnAVxoL-i_nHMlwjBkknPaNipyRpyRQHdu7CDtqlxAMSOmlul2");
	// registration_ids.push("APA91bGtoeHyBr7wan-DcwzUY_ejvS3Jdpz75Pb1pMNPRDFS9EW-UlXqr7pFGKWZElbfS8g2fpW-11yYlp3Rf_278u_Li1pclyg7w1gYC42AL27U3IyaoJdZEPgSkFoEau_9JK7IpsFZ");
	// gcm_connection.send(message, registration_ids, 4, function(err, result) {
	// 							if (err) {  res.send(err);}
	// 							if(result){
	// 							console.log(result);
	// 							}
	// 						});	
    function aa(callback,docs){
    	var user = [];
 		for(var i = 0 ; i< docs.length ; i++){
 			user.push(docs[i].user);
 		}
    	callback(user);
    }
    function bb(user){
    	console.log("bb.user = "+user);
    	
		GCMcollection.find({"user":{ $in:user}}).toArray(function(err,docs2){
                	if(err){
                		res.send(err);
                		res.end();
                	}else{
                		if (typeof docs2[0] !== 'undefined' && docs2[0] !== null ) { 
                			// for (var i =0;i<docs2.length;i++){
                			// 	console.log("token:"+docs2[i].token);
                			// 	registration_ids.push(docs2[i].token);	
                			// }
                			ba(function(registration_ids){ cc(registration_ids);},docs2);
							
                		}else{
                			console.log("gcm no user around");
                		}
					}	
                });
		
    }	
    function cc(registration_ids){
    	console.log(registration_ids);
   			gcm_connection.send(message, registration_ids, 4, function(err, result) {
								if (err) {  res.send(err);}
								if(result){
								console.log(result);
								res.status('200').send('ok');
								res.end();
								}
							});	
    }
    function ba(callback,docs2){
    		for (var i =0;i<docs2.length;i++){
                console.log("token:"+docs2[i].token);
               	registration_ids.push(docs2[i].token);	
            }
       	callback(registration_ids);
    }

    var where = {"detail.longitude":{"$gt":leftLongitude,"$lt":rightLongitude},"detail.latitude":{"$gt":leftLatitude,"$lt":rightLatitude}};
    collection.find(where).toArray(function(err,docs){
        if(err){
            console.log(err);
            return err;
        }else{
       		if (typeof docs[0] !== 'undefined' && docs[0] !== null ) { 
       				//發gcm 流程: aa 將docs內user取出做成array傳入bb，bb比對user取得各token放入ba加入token陣列，最後傳給c 發送GCM
       				 aa(function(user){bb(user);},docs);
     //  		//	setNearbyUserToAry(docs);
     //       for(var i = 0 ; i< docs.length ; i++){
            	
     //           console.log(docs[i].user);
     //           var user = docs[i].user;
            	
     //           GCMcollection.find({"user":user}).toArray(function(err,docs2){
     //           	if(err){
     //           		res.send(err);
     //           		res.end();
     //           	}else{
     //           		if (typeof docs2[0] !== 'undefined' && docs2[0] !== null ) { 
					// 		var token = docs2[0].token;
					// 		console.log(docs2);
					// 		registration_ids.push(token);
					// 		// gcm_connection.send(message, registration_ids, 4, function(err, result) {
					// 		// 	if (err) { throw err }
					// 		// 	if(result){
					// 		// 	console.log(result);
					// 		// 	}
					// 		// });
					// 		console.log(i);
     //           		}else{
     //           			res.send('gcm onthing');
     //           			res.end();
                			
     //           		}
					// }	
     //           });
     //       }
     //       // 修改狀態為走失 statusv=1
		    	setStatusvUpdate();
           	    
       		}else{
        	    res.send("nothing");
				res.end();
       		}
        }
	}); 
});



app.post('/getMissingOld',urlencodedParser,function(req,res){
	var collection = myDB.collection('login');
	var whereStatus = {"status":"1"};
	collection.find({"old_detail.statusv":"1"}).toArray(function(err,docs){
		if(err){
			res.status(406).send(err);
			res.end();
		}else{
			if (typeof docs[0] !== 'undefined' && docs[0] !== null ) { 
				var old_detail
				res.type('application/json');
				//只列失蹤老人
				// for(var i =0;i<docs.length;i++){
				// 	for(var j =0;j<docs[i].old_detail.length;j++){
				// 		if(docs[i].old_detail[j].statusv=="0"){
							
				// 		}
				// 	}
				// }
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

//取得我所有的老人資料 對應 setMyOldMan()方法
app.post('/getOld',urlencodedParser,function(req,res){
	 
	
	var collection = myDB.collection('login');
	collection.find({"user" : req.body.user,old_detail:{$exists:true}}).toArray(function(err, docs) {
		if(err){
			res.status(406).send(err);
			res.end();
		}else{
			if (typeof docs[0] !== 'undefined' && docs[0] !== null ) { 
			res.type('application/json');
			// var jsonData = JSON.stringify(docs);
			// var jsonObj = JSON.parse(jsonData);
			var old_detail = docs[0].old_detail;
			res.status(200).send(old_detail);
			res.end();
			}else{
				res.type('text/plain');
				res.status(200).send("no detail");
				res.end();
			}
		}
	});
});
//有多個老人群組的加入方法
app.post('/addOld',urlencodedParser,function(req, res) {
   	var user = req.body.user;
	var oldName = req.body.oldName;
	var oldCharacteristic = req.body.oldCharacteristic;
	var oldhistory = req.body.oldhistory;
	var oldclothes = req.body.oldclothes;
	var oldaddr = req.body.oldaddr;
	var beaconId = req.body.beaconId;
 	var collection = myDB.collection('login');
 	var statusv = req.body.statusv;
 	console.log("beaconId = " + beaconId);
	collection.find({"old_detail.beaconId":beaconId}).toArray(function(err, docs) {
	    if(err){
	    	res.send(err);
	    	res.end();
	    }else{
	    	if (typeof docs[0] !== 'undefined' && docs[0] !== null ) {
	    		res.type("text/plain");
				res.status(200).send("exist");
				res.end();
	    	}else{
	    		collection.update({"user":user}, {$push: {"old_detail":{"beaconId":beaconId,
				"oldName":oldName,
				"oldCharacteristic":oldCharacteristic,
				"oldhistory":oldhistory,
				"oldclothes":oldclothes,
				"oldaddr":oldaddr,
				"groupMember":[],"statusv":"0"}}},  function(err) {
				if(err){
					console.log(err);	
					res.send(err);
					res.end();
				}else{
					res.type('text/plain');
					res.send("OK");
					res.end();
				}
			});
	    	}
	    }
	});
});
app.post('/checkBeaconId',urlencodedParser,function(req,res){
	var user = req.body.user;
	var beaconId = req.body.beaconId;
 	var collection = myDB.collection('login');
 	//查詢是否有人使用過這個beaconId
	collection.find({"old_detail.beaconId":beaconId}).toArray(function(err, docs) {
	    if(err){
	    	res.send(err);
	    	res.end();
	    }else{
	    	if (typeof docs[0] !== 'undefined' && docs[0] !== null ) {
	    		res.type("text/plain");
				res.status(200).send("exist");
				res.end();
	    	}else{
	    		
				res.type("text/plain");
				res.status(200).send("ok");
				res.end();	
			}
	    }
	});
});
app.post('/getOldAll',urlencodedParser,function(req, res){
	var user = req.body.user;
	var beaconId = req.body.beaconId;
	var collection = myDB.collection('login');
	collection.find({"user":user,"old_detail.beaconId":beaconId}).toArray(function(err, docs) {
	    if(err){
	    	res.send(err);
	    	res.end();
	    }else{
			var jsonOldDetail= jsonOldDetail = docs[0].old_detail;

	    	res.type("application/json");
	    	res.send(jsonOldDetail);
	    	res.end();
	    }
	});
});

app.post('/getMyFollow',urlencodedParser,function(req, res) {
	var collection = myDB.collection('login');
	var user = req.body.user;
	
    	collection.find({"old_detail.groupMember":{ $in:[user]}}).toArray(function(err, docs) {
		    if(err){
		    	res.status(406).send(err);
		    	res.end();
		    }else{
			   if (typeof docs[0] !== 'undefined' && docs[0] !== null ) { 
			   		res.status(200)
			   		res.send(docs);
			   		res.end();
			   }else{
			   		res.type('text/plain');
					res.status(200).send("no detail");
					res.end();
			   }
		    }
		});
	
})
//取得指定beaconid 老人資料
app.post('/getOldOne',urlencodedParser,function(req, res){
	var user = req.body.user;
	var beaconId = req.body.beaconId;
	var collection = myDB.collection('login');
	collection.find({"user":user,"old_detail.beaconId":beaconId}).toArray(function(err, docs) {
	    if(err){
	    	res.send(err);
	    	res.end();
	    }else{
			var jsonOldDetail;
			var endv;
			for(var i =0 ; i < docs.length ;i++){
				jsonOldDetail = docs[i].old_detail;
				for(var j = 0 ;j<jsonOldDetail.length;j++){
					if(jsonOldDetail[i].beaconId == beaconId){
						endv = jsonOldDetail[i];
						break;
					}
				}
			
			}
	    	res.type("application/json");
	    	res.send(endv);
	    	res.end();
	    }
	});
});
app.post('/groupService',urlencodedParser,function(req,res){
	var user = req.body.user;
	var beaconId =req.body.beaconId;
	var collection = myDB.collection('login');
	//1 for add groupMember.
	var groupMemberv = req.body.groupMember;
	var statusv = req.body.statusv;
	if(statusv == "1"){
		
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
			//如果有此帳號則
			if ( e == "exist") { 
				console.log("in exist");
				// {foo: {"$elemMatch": {shape: "square", color: "purple"}}
				// $in means there are fit words in field  ,{"old_detail.groupMember":{ $in:[groupMemberv]}}
				//查詢old_detail中同時包含 beaconid 相同 及 有同樣的groupMember
				// {old_detail:{"$elemMatch":{"beaconId":beaconId,"groupMember":{ $in:[groupMemberv]}}}}
				collection.find({old_detail:{"$elemMatch":{"beaconId":beaconId,"groupMember":{ $in:[groupMemberv]}}}}).toArray(function(err, docs) {
				    if(err){
				    	res.send("There was a problem adding the information to the database.$in is wrong");
						console.log(err);
				    	
				    }else{
				        if (typeof docs[0] !== 'undefined' && docs[0] !== null ) { 
							res.type("text/plain");
							res.status(200).send("exist");
							res.end();	
						}else{
							//指定前面query的結果 用$ 指定陣列位置 
							collection.update({"user":user,"old_detail.beaconId":beaconId}, {$push:{"old_detail.$.groupMember":groupMemberv}},  function(err) {
					  			if(err){
									res.send("There was a problem adding the information to the database.$ne is wromg");
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
	if(statusv == "2"){
		//"old_detail.groupMember":{$exists:true}
		//此查詢會回傳old_detail內的第一筆資料{"user":user,"old_detail.beaconId":beaconId},{"old_detail.$":1}
		collection.find( {"user":user,"old_detail.beaconId":beaconId,"old_detail.groupMember":{$exists:true}}).toArray(function(err,docs){
			if(err){
				res.status(406).send(err);
				res.end();
			}else{
				if (typeof docs[0] !== 'undefined' && docs[0] !== null ) { 
					res.type('application/json');
					// var jsonData = JSON.stringify(docs);
					// var jsonObj = JSON.parse(jsonData);
					// console.log(jsonObj[0].detail.userName);
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
	//取得groupMember中含有自己帳號的老人資料 返回給app
	
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
	res.send("no status !");
	res.end();
});
//已修正返回使用者帳號
app.post('/getWhoFollowMe',urlencodedParser,function(req, res) {
   var collection = myDB.collection('login');
   
		//尋找login裡任groupMember裡面含有d帳號的使用者帳號 返回給app 
		collection.find({"old_detail.groupMember": {$in:[req.body.user]}}).toArray(function(err,docs){
			if(err){
				res.status(406).send(err);
				res.end();
			}else{
				if (typeof docs[0] !== 'undefined' && docs[0] !== null ) { 
					res.type('application/json');
					// var jsonData = JSON.stringify(docs);
					// var jsonObj = JSON.parse(jsonData);
					// console.log(jsonObj[0].detail.userName);
					res.status(200).send(docs);
					res.end();
				}else{
					res.type('text/plain');
					res.status(200).send("no detail");
					res.end();
				}
			}
		});
			// collection.find({"user":user}).toArray(function(err, docs) {
			// 	if(err){
			// 		res.send(err);
			// 		res.end();
			// 	}else{
			// 		if (typeof docs[0] !== 'undefined' && docs[0] !== null ) { 
			// 				res.status(200).send(docs);
			// 				res.end();
			// 		}else{
			// 			res.type("text/plain");
			// 			res.status(200).send("nothing");
			// 			res.end();
			// 		}
			// 	}
			// });
	
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

	collection.update({"user":user,"old_detail.beaconId":beaconId}, {$set: {"old_detail.$.oldName":oldName,"old_detail.$.oldCharacteristic":oldCharacteristic,"old_detail.$.oldhistory":oldhistory,"old_detail.$.oldclothes":oldclothes,"old_detail.$.oldaddr":oldaddr}},  function(err) {
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
//修改beaconId---暫不使用
app.post('/updateBeaconId',urlencodedParser,function(req,res){
	var user = req.body.user;
	var beaconId = req.body.beaconId;
 	var collection = myDB.collection('login');
 	//查詢是否有人使用過這個beaconId
	collection.find({"old_detail.beaconId":beaconId}).toArray(function(err, docs) {
	    if(err){
	    	res.send(err);
	    	res.end();
	    }else{
	    	if (typeof docs[0] !== 'undefined' && docs[0] !== null ) {
	    		res.type("text/plain");
				res.status(200).send("exist");
				res.end();
	    	}else{
	    		collection.update({"user":user,"old_detail.beaconId":beaconId}, {$set: {"old_detail.$.beaconId":beaconId}},  function(err) {
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
	// collection.find().toArray(function(err,docs){
	// 	if(err){
	// 		res.status(406).send(err);
	// 		res.end();
	// 	}else{
	// 		var jsonData = JSON.stringify(docs);
	// 		var jsonObj = JSON.parse(jsonData);
	// 		var e ="";
	// 		console.log("in find");
	// 		for(var i =0 ; i < jsonObj.length ;i++){
				
	// 			if ( jsonObj[i].old_detail.beaconId == beaconId ){
	// 				e = "exist";
	// 				console.log("e="+e);
	// 				break;
	// 			} 	
	// 			console.log("in for"+i);
	// 		}
			
	// 		if ( e == "exist") { 
	// 		console.log("in exist");
	// 		res.type("text/plain");
	// 		res.status(200).send("exist");
	// 		res.end();
	// 		}else{
	// 			collection.update(whereName, {$set: {"old_detail.beaconId":beaconId}},  function(err) {
	// 				if(err){
	// 				res.send("There was a problem adding the information to the database.");
	// 				console.log(err);		
	// 				}else{
	// 				res.type("text/plain");
	// 				res.status(200).send("ok");
	// 				res.end();	
	// 				}	
	// 			});
	// 		}
	// 	}
		
	// });
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
	//經緯度是"null"將其指定為null，接收的經緯度是字串 將其轉為float
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
	  res.end();
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
		"old_detail":[/*{
			"beaconId":"",
			"oldName":"",
			"oldPic":null,
			"oldCharacteristic":"",
			"oldhistory":"",
			"oldclothes":"",
			"oldaddr":"",
			"groupMember":[],
			"status":"0"
			
		}*/]
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

