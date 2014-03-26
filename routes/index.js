
/*
 * GET home page.
 */

var crypto = require('crypto');
var User = require('user');
var MAdd = require('mAdd');
var Attention = require('attention');
var Comment = require('comment');



exports.index = function(req, res){
	if(req.session.user) {
		return 	res.redirect('/u/'+ req.session.user.email);
	}
	res.render('index', 
		{ 
			title: '首页', 
			user:req.session.user || null,
			err:req.flash('error').toString() || null,
			success:req.flash('success').toString() || null
		}
	);
};
exports.user = function(req,res) {
	if(!req.session.user) {
		return 	res.redirect('/');
	}
	var currentUser = req.params.user;
	var post = new MAdd(currentUser);

	post.get(currentUser,function(err,posts) {
		if(err) {
			req.flash('error',err.toString());
		}
		res.render('user',
			{
				title:'我的微博',
				user:req.session.user || null,
				posts:posts
			}
		);
	});
};
exports.mAdd = function(req,res) {
	var currentUser = req.session.user;
	var post = new MAdd(currentUser.email,req.body.mAddContent,currentUser.name);
	post.save(function(err) {
		if(err) {
			req.flash('error',err.toString());
			return res.redirect('/');
		}
		//req.flash('success','发表成功');
		res.redirect('/u/'+ currentUser.email);
	});
};

exports.delWB = function(req,res) {
	var currentUser = req.session.user;
	if(currentUser) {
		var wb_id = req.params.WB_id;

		MAdd.del(wb_id,function(err,doc) {
			if(err) {
				res.json({"status":0});
			} else{
				res.json({"status":1});
			}
		});
	}
	else {
		res.json({"status":0})
	}
	
};



exports.reg = function(req,res) {
	if(req.session.user) {
		return 	res.redirect('/u/'+ req.session.user.email);
	}
	res.render('reg',
		{
			title:'用户注册',
			user:req.session.user || null,
			err:req.flash('error').toString() || null,
			success:req.flash('success').toString() || null
		}
	);
};
exports.doReg = function(req,res) {
	if(req.body.uName==='' ||  req.body.email==='' || req.body.password==='' || req.body.passwordRepeat=='') {
		req.flash('error','请输入完整信息');
		return res.redirect('/reg');
	}

	if(req.body['password']!= req.body['passwordRepeat']) {
		req.flash('error','两次输入的密码不一致');
		return res.redirect('/reg');
	}

	var md5=crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('base64');
	var newUser = new User({
		name:req.body.uName,
		email:req.body.email,
		password:password
	});
	console.log(newUser);

	User.get(newUser.email,function(err,user) {
		if(user) {
			err = '邮箱已存在';
		}
		if(err) {
			req.flash('error',err.toString());
		}

		newUser.save(function(err) {
			if(err) {
				req.flash('error',err.toString());
				return res.redirect('/reg');
			}
			//delete newUser.name;
			req.session.user = newUser;
			//req.flash('success','注册成功');
			res.redirect('/');
		});
	});
};
exports.login = function(req,res) {
	if(req.session.user) {
		return 	res.redirect('/u/'+ req.session.user.email);
	}
	res.render('login',{
		title:'用户登录',
		user:req.session.user,
		error:req.flash('error').toString(),
		success:null
	});
};
exports.doLogin = function(req,res) {
	var email = req.body.email;
	var md5=crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('base64');

	var newUser = new User({
		email:email,
		password:password
	});

	User.get(newUser.email,function(err,user) {
		if(!user || newUser.password !=user.password) {
			req.flash('error','帐号不存在或密码错误');
			return res.redirect('/login');
		}
		req.session.user = user;
		//req.flash('success','登录成功');
		res.redirect('/u/' + req.body.email);
	});
};
exports.logout = function(req,res) {
	req.session.user = null;
	return res.redirect('/');
};

exports.explore = function(req,res) {
	if(!req.session.user) {
		return 	res.redirect('/');
	}

	User.getAll(req.session.user,function(err,users) {
		if(err) {
			console.log(err);
			return 	res.redirect('/');
		}

		res.render('explore',{
			title:'我的微博',
			user:req.session.user || null,
			allUser:users
		});
	});

	
};

exports.attention = function(req,res) {
	var attentionUserEmail = req.params.attentionUserEmail;
	var attentionCollection={
		from:req.session.user.email,
		to:attentionUserEmail
	};

	var newAttentionCollection = new Attention(attentionCollection);
	newAttentionCollection.save(function(err,msg) {
		console.log(msg);
		if(err) {
			res.json({"status":0});
		} else{
			res.json({"status":1});
		}
	});
};

exports.disAttention = function(req,res) {
	var attentionUserEmail = req.params.attentionUserEmail;
	var attentionCollection={
		from:req.session.user.email,
		to:attentionUserEmail
	};

	var newAttentionCollection = new Attention(attentionCollection);
	newAttentionCollection.cancel(function(err,msg) {
		if(err) {
			res.json({"status":0});
		} else{
			res.json({"status":1});
		}
	});
};

exports.addComment = function(req,res) {
	var comment = new Comment({
		wbId: req.params.WB_id,
		content: req.body.content,
		userId: req.session.user.email,
		userName: req.session.user.name
	});
	comment.save(function(err,doc) {
		if(err) {
			res.json({'status':0});
		} else {
			res.render('comment',{
				comments:doc
			});
		}
	});
};

exports.getComment = function(req,res) {
	var WB_id = req.params.WB_id;
	var currentUserId = req.session.user.email;
	Comment.getCommentByWBid(WB_id,currentUserId,function(err,doc) {
		if(err) {
			res.json({'status':0});
		} else {
			console.log(doc);
			res.render('comment',{
				comments:doc
			});
		}
	});
}

exports.delComment = function(req,res) {
	var commentId = req.params.commentId;
	console.log(commentId);
	if(req.session.user) {
		Comment.del(commentId,function(err,doc) {
			if(err) {
				res.json({'status':0});
			} else {
				res.json({'status':1});
			}
		});
	}
}