const express = require('express');
const createError = require('http-errors');
require('express-async-errors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
dotenv.config();

const {Server} = require('socket.io');
const authRouter = require('./src/auth/auth.routes');
const userRouter = require('./src/users/users.routes');

const app = express();

const server = http.createServer(app);
const io = new Server(server);
app.use(morgan('dev'));
app.use(
	bodyParser.urlencoded({
		extended: false,
	}),
);
app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
	res.send('APP IS RUNNING');
});
app.use('/auth', authRouter);
app.use('/users', userRouter);

app.use((req, res, next) => {
	next(createError(404));
});

app.use((err, req, res) => {
	console.log(err.stack);
	res.status(err.status || 500).send(err.message);
});
io.on('connection', socket => {
	console.log('a user connected');

	//  call api get token from backend auth
	//  username
	//  passcode
	const resToken = new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve('4b803e0a-54a7-4572-a419-5a7a8660b062');
		}, 3000);
	});

	resToken
		.then(data => {
			socket.emit('tokenCheckAuth', {token: data});
		})
		.catch(err => {
			console.log(err);
			socket.disconnect();
		});
	socket.on('message', data => {
		// send token to Auth Server to Authentication
		const authSocket = require('net').Socket();
		authSocket.connect(3000);
		authSocket.write(data);
		authSocket.on('isAuthenticate', authData => {
			if (authData) {
				socket.emit('response', {
					// Token JWT in Client Backend to Client Frontend
				});
			}
		});
		socket.disconnect();
	});
});

server.listen(process.env.PORT, () => {
	console.log(`Express running → PORT ${server.address().port}`);
});
