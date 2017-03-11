module.exports = {
	port: 80,
	base: '/rss',
	feeds: [{
		url: '/transformed',
		source: 'http://change.me/feed.rss',
		filters: [{
			key: 'description', // matches all URLs in feed item descriptions. Credit to Diego Perini (https://gist.github.com/dperini/729294)
			regex: /(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?/ig,
			unescape: true, // urls will be encoded in rss
			multi: true, // want to match all of them and create a new item for each
			replace: {
				link: (regexMatch, item) => regexMatch, // the item link should be the URL that it matched
				title: (regexMatch, item) =>	regexMatch // the title should correspond to the URL.
						.replace('http://', '') // remove http protocol
						.replace(/\[[^\]]*\]/g, '') // remove any [] groups
						.replace(/_/g, ' ') // replace occurances of _ with space
						.replace(/(\..*)/g, '') // remove any suffixes
			}
		}]
	}]
};
