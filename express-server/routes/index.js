var express = require('express');
var router = express.Router();
var User = require('../models').User;
var Notice = require('../models').Notice;
var Banner = require('../models').Banner;
var Qna = require('../models').Qna;
var Faq = require('../models').Faq;
var Destination = require('../models').Destination;
const passport = require('passport');
var fs = require('fs');

var multer = require('multer'); // express에 multer모듈 적용 (for 파일업로드)
var upload = multer({ dest: 'uploads/' });
var bannerStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'banner/');
	},
	filename: (req, file, cb) => {
		cb(null, `banner_${Date.now()}`);
	},
});
var banner = multer({ storage: bannerStorage });

/* GET home page. */
router.get('/', function (req, res, next) {
	if (req.isAuthenticated()) {
		res.send(req.session.userID);
	} else {
		res.status(403).send('로그인 필요');
	}
});

router.post('/upload', upload.single('cover'), function (req, res) {
	console.log(req.file);

	res.send('Uploaded! : ' + req.file);
});

router.post('/changeinfo', function (req, res, next) {
	User.findAll({
		where: {
			id: req.body.userID,
		},
	})
		.then(result => {
			if (result[0].dataValues.password === req.body.current) {
				if (req.body.new !== '') {
					//비밀번호 변경하는 경우
					User.update(
						{
							password: req.body.new,
							name: req.body.name,
							email: req.body.email,
							gender: req.body.gender,
							birth: req.body.birth,
						},
						{
							where: { id: req.body.userID },
						}
					)
						.then(result => {
							res.status(200).json(result);
						})
						.catch(err => {
							console.error(err);
							next(err);
						});
				} else {
					//비밀번호는 바꾸지 않는 경우
					User.update(
						{
							name: req.body.name,
							email: req.body.email,
							gender: req.body.gender,
							birth: req.body.birth,
						},
						{
							where: { id: req.body.userID },
						}
					)
						.then(result => {
							res.status(200).json(result);
						})
						.catch(err => {
							console.error(err);
							next(err);
						});
				}
			} else res.status(202).send('current password incorrect');
		})
		.catch(err => {
			console.error(err);
			next(err);
		});
});

router.post('/signup', function (req, res, next) {
	console.log('in post req, /signup');
	console.log(User);
	User.findAll({
		where: {
			userID: req.body.id,
		},
	}).then(result => {
		console.log('signup id 조회');
		console.log(result);
	});
	User.create({
		name: req.body.username,
		userID: req.body.id,
		password: req.body.password,
		email: req.body.email,
		gender: req.body.sex,
		birth: req.body.birth,
		isAdult: req.body.adult,
	})
		.then(result => {
			console.log(result);
			res.status(201).json(result);
		})
		.catch(err => {
			console.log('in signup error handler');
			console.error(err);
			next(err);
		});
});

router.post('/add_destination', function (req, res, next) {
	console.log('in post req, /add_destination');
	console.log(Destination);
	Destination.create({
		customerName: req.body.customerName,
		customerContact: req.body.customerContact,
		postcode: req.body.postcode,
		roadAddress: req.body.roadAddress,
		jibunAddress1: req.body.jibunAddress1,
		jibunAddress2: req.body.jibunAddress2,
		extraAddress: req.body.extraAddress,
		addressOwner: req.body.addressOwner,
	})
		.then(result => {
			console.log(result);
			res.status(201).json(result);
		})
		.catch(err => {
			console.log('error while destination add');
			console.error(err);
			next(err);
		});
});

router.post('/edit_destination', function (req, res, next) {
	console.log('in post req, /edit_destination');
	console.log(Destination);
	Destination.update(
		{
			customerName: req.body.customerName,
			customerContact: req.body.customerContact,
			postcode: req.body.postcode,
			roadAddress: req.body.roadAddress,
			jibunAddress1: req.body.jibunAddress1,
			jibunAddress2: req.body.jibunAddress2,
			extraAddress: req.body.extraAddress,
			addressOwner: req.body.addressOwner,
		},
		{
			where: { id: req.body.id },
		}
	)
		.then(result => {
			res.status(200).json(result);
		})
		.catch(err => {
			console.log(err);
			next(err);
		});
});

router.post('/delete_destination', function (req, res, next) {
	console.log('in post req, /delete_destination');
	console.log(Destination);
	Destination.destroy({
		where: { id: req.body.id },
	})
		.then(result => {
			res.status(200).json(result);
		})
		.catch(err => {
			console.log(err);
			next(err);
		});
});

router.post('/destination', function (req, res, next) {
	console.log('in /destination POST req');
	console.log(req.body.id);
	Destination.findAll({
		where: {
			addressOwner: req.body.id,
		},
	}).then(result => {
		console.log(result);
		res.status(201).json(result);
	});
});

router.post('/login', passport.authenticate('local'), function (req, res) {
	res.status(201).send(req.user);
});

router.get('/login', function (req, res, next) {
	console.log(req.isAuthenticated());
	if (req.isAuthenticated()) {
		res.json(req.user);
	} else {
		res.send('not logged in');
	}
});

router.get('/logout', (req, res) => {
	req.logout();
	delete req.user;
	res.status(201).send('logout 성공');
});

// router.post('/login', (req, res, next) => {
//     passport.authenticate('local', (authError, user, info) => {
//         console.log(info);
//         console.log('in route, index.js /login');
//         res.status(201).json(req.user);
//         return req.login(user, loginError => {
//             if(loginError){
//                 console.error(loginError);
//             }
//         });
//     })(req, res, next);

// })

router.get('/test', function (req, res, next) {
	Destination.findAll({
		where: {
			addressOwner: 1,
		},
	}).then(result => {
		console.log(result);
	});
	res.render('index', { title: 'Test' });
});

router.post('/userInfo', function (req, res, next) {
	User.findOne({ where: { userID: req.body.userID } })
		.then(response => {
			console.log('in userInfo');
			res.send(response);
		})
		.catch(err => {
			console.error(err);
		});
});

router.post('/notice', function (req, res, next) {
	const { title, contents } = req.body;
	console.log(title, contents);
	Notice.create({
		title,
		contents,
	})
		.then(response => {
			console.log('공지사항 등록 성공');
			res.send('공지사항 등록 성공');
		})
		.catch(err => {
			console.error(err);
		});
});
router.post('/faq', function (req, res, next) {
	const { title, contents } = req.body;
	Faq.create({
		title,
		contents,
	})
		.then(response => {
			console.log('FAQ 등록 성공');
			res.send('FAQ 등록 성공');
		})
		.catch(err => {
			console.error(err);
		});
});
router.post('/qna', function (req, res, next) {
	const { title, contents } = req.body;
	Qna.create({
		title,
		contents,
	})
		.then(response => {
			console.log('QnA 등록 성공');
			res.send('QnA 등록 성공');
		})
		.catch(err => {
			console.error(err);
		});
});
router.post('/banner', banner.single('banner'), function (req, res, next) {
	Banner.create({
		title: req.body.title,
		path: req.file.path,
		start: req.body.start,
		end: req.body.end,
	});
	res.send('banner 값 전송 성공' + req.file);
});

router.get('/notice', function (req, res, next) {
	Notice.findAll()
		.then(result => {
			res.send(result);
		})
		.catch(err => {
			console.error(err);
		});
});

router.get('/faq', function (req, res, next) {
	Faq.findAll()
		.then(result => {
			res.send(result);
		})
		.catch(err => {
			console.error(err);
		});
});

router.get('/qna', function (req, res, next) {
	Qna.findAll()
		.then(result => {
			res.send(result);
		})
		.catch(err => {
			console.error(err);
		});
});

router.get('/banner', function (req, res) {
	Banner.findAll().then(result => {
		res.send(result);
	});
});

router.get('/bannerImage', function (req, res, next) {
	// Banner.findAll()
	// 	.then(result => {
	// 		res.send(
	// 			result
	// 				.filter(el => {
	// 					const temp = new Date();
	// 					const today = temp.setHours(temp.getHours() + 9);
	// 					const target = new Date(el.end);
	// 					if (today < target) {
	// 						return el;
	// 					}
	// 				})
	// 				.reverse()
	// 				.slice(0, 5)
	// 				.map(el => el.path)
	// 				.map(el => {
	// 				})
	// 				.reverse()
	// 		);
	// 	})
	// 	.catch(err => {
	// 		console.error(err);
	// 	});
	Banner.findOne({ where: { id: 1 } }).then(result => {
		fs.readFile(result.path, function (error, data) {
			res.writeHead(200, { 'Content-Type': 'text/html' });
			res.end(data);
		});
	});
});

router.get('/main', function (req, res) {
	const data = {};
	Notice.findAll().then(result => {
		console.log(result);
	});
});
module.exports = router;
