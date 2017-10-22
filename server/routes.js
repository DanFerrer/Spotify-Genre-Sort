const Spotify = require('spotify-web-api-node');
const express = require('express');
const router = new express.Router();

const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = process.env;

const scopes = ['user-read-email', 'user-library-read', 'playlist-modify-public'];
const stateKey = 'spotify_auth_state';

const spotifyApi = new Spotify({
	clientId: CLIENT_ID,
	clientSecret: CLIENT_SECRET,
	redirectUri: REDIRECT_URI
});

console.log(spotifyApi);

function generateRandomString(length) {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	for (let i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}

	return text;
}

async function handleToken(code) {
	const data = await spotifyApi.authorizationCodeGrant(code);
	const { expires_in, access_token, refresh_token } = data.body;

	spotifyApi.setAccessToken(access_token);
	spotifyApi.setRefreshToken(refresh_token);

	console.log(await spotifyApi.getMe());
	return "done";
}

router.get('/login', (req, res) => {
	const state = generateRandomString(16);
	res.cookie(stateKey, state);
	res.redirect(spotifyApi.createAuthorizeURL(scopes, state));
});

router.get('/callback', (req, res) => {
	const { code = null, state = null } = req.query;
	const storedState  = req.cookies ? req.cookies[stateKey] : null;
	
	if (state === null || state !== storedState) {
		res.redirect('/#/error/state_mismatch');
	} else {
		res.clearCookie(stateKey);
		
		handleToken(code)
			.then(() => res.redirect(`/#/user/${access_token}/${refresh_token}`))
			.catch((err) => res.redirect('/#/error/invalid token'));
	}
});

module.exports = router;
