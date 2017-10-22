const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');

if (process.env.NODE_ENV !== 'production') {
	require('dotenv').load();
}

const routes = require('./routes');
const app = express();

const PORT = process.env.PORT || 3000;



app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser);
app.use(express.static(path.resolve(__dirname, '../public')));
app.use('/', routes);

app.listen(PORT, () => {
	console.info(`Server listening on port: ${PORT}`);
});
