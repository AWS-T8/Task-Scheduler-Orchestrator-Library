const fetch = require('node-fetch');

fetch('https://xmeme-backend-sanskar.herokuapp.com/memes')
	.then((res) => {
		if (res.status == 200) {
			return res.json();
		}
	})
	.then((result) => {
		console.log(result.data);
	});
