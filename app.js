const express = require('express'),
	winston = require('winston'),
	urljoin = require('url-join'),
	request = require('request'),
	xml2js = require('xml2js'),
	parseString = xml2js.parseString,
	jsonpath = require('jsonpath'),
	config = require('./conf/default'),
	requestID = require('express-request-id')(),
	uuid = require('uuid'),
	app = express(),
	builder = new xml2js.Builder({
		renderOpts: {
			pretty: false
		}
	});

const cache = {};

function generateGUID(req, item) {
	/* eslint no-param-reassign: off */
	const guidCache = cache[req.id] || [];
	let guid = item.guid[0]._;
	if (guidCache.length && guidCache.indexOf(guid) > -1) {
		// since we have more than one item based on this node we need a new guid
		guid += `_rss2rss_${uuid.v4()}`;
	}
	// set the value in the cache
	guidCache.push(guid);
	return guid;
}

function clearGUIDCache(req) {
	delete cache[req.id];
}

winston.level = 'debug';

if (!config.feeds || !config.feeds.length) {
	winston.error('No configured feeds to serve. Add some to config.feeds in conf/default.js and try again');
	process.exit(0);
}

function unescapeHTML(string) {
	return string
	.replace(/&amp;/g, '&')
	.replace(/&lt;/g, '<')
	.replace(/&gt;/g, '>')
	.replace(/&quot;/g, '"')
	.replace(/&#039;/g, "'");
}

function getNewItem(req, regexResult, originalItemNode, opts) {
	const item = JSON.parse(JSON.stringify(originalItemNode));

	// set the guid on the item
	item.guid[0]._ = generateGUID(req, item);

	// set custom values
	if (opts.replace && opts.replace.title) {
		item.title = opts.replace.title(regexResult, originalItemNode);
	}

	if (opts.replace && opts.replace.link) {
		item.link = [opts.replace.link(regexResult, originalItemNode)];
	}

	return item;
}

function getRegexMatches(node, opts) {
	// get all matches
	const filterResults = [];
	let matched;
	do {
		matched = opts.regex.exec(node);
		if (matched && matched[0]) {
			matched = matched[0];
			if (opts.unescape) {
				matched = unescapeHTML(matched);
			}
			filterResults.push(matched);
		}
	} while (matched && opts.multi);
	return filterResults;
}

function setFeedItems(xml, items) {
	const channel = jsonpath.query(xml, '$.rss.channel[0]')[0];
	channel.item = items;
}

function sendResponse(req, res, err, xml) {
	clearGUIDCache(req);
	if (err || !xml) {
		winston.error(err || 'No XML sent with response');
		return res.status(500).send();
	}
	res.contentType('application/rss+xml');
	return res.status(200).send(xml);
}

// set a request ID for caching
app.use(requestID);

config.feeds.forEach((feed) => {
	const url = urljoin(config.base || '', feed.url);
	winston.info('Configuring source', feed.source, 'on', url);
	app.get(url, (req, res) => {
		winston.info('request for', url);
		request(feed.source, (err, result) => {
			if (err) {
				return sendResponse(req, res, err);
			}
			if (!feed.filters || !feed.filters.length) {
				// send back original feed
				winston.info('No filters specified for feed');
				return sendResponse(res, null, result.body);
			}
			parseString(result.body, (parseErr, xmlObj) => {
				if (parseErr) {
					return sendResponse(req, res, parseErr);
				}
				const itemsToReturn = [];
				feed.filters.forEach((opts) => {
					const items = jsonpath.query(xmlObj, '$.rss.channel[0].item[*]');
					items.forEach((item) => {
						const node = item[opts.key || 'description'];
						if (!node) {
							return;
						}
						const regexMatches = getRegexMatches(node[0], opts);
						if (!regexMatches.length) {
							return;
						}
						regexMatches.forEach((filterResult) => {
							const newNode = getNewItem(req, filterResult, item, opts);
							itemsToReturn.push(newNode);
						});
					});
				});

				setFeedItems(xmlObj, itemsToReturn);
				const XMLString = builder.buildObject(xmlObj);
				return sendResponse(req, res, null, XMLString);
			});
		});
	});
});

app.listen(config.port || 80, () => {
	winston.info('rss2rss listening on port 80');
});
