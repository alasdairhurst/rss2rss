# rss2rss
Express server which takes existing RSS feeds, applies transformations then re-hosts them.

[![bitHound Overall Score](https://www.bithound.io/github/alasdairhurst/rss2rss/badges/score.svg)](https://www.bithound.io/github/alasdairhurst/rss2rss)
[![bitHound Dependencies](https://www.bithound.io/github/alasdairhurst/rss2rss/badges/dependencies.svg)](https://www.bithound.io/github/alasdairhurst/rss2rss/master/dependencies/npm)
[![bitHound Dev Dependencies](https://www.bithound.io/github/alasdairhurst/rss2rss/badges/devDependencies.svg)](https://www.bithound.io/github/alasdairhurst/rss2rss/master/dependencies/npm)
[![bitHound Code](https://www.bithound.io/github/alasdairhurst/rss2rss/badges/code.svg)](https://www.bithound.io/github/alasdairhurst/rss2rss)

## How to use

node app.js

### Configuration

inside conf/ rename default.example.js to default.js

| key   	| description                                	|
|-------	|--------------------------------------------	|
| port  	| port to run the server on. defaults to 80  	|
| base  	| route to host feeds on. defaults to root / 	|
| feeds 	| array of hosted feeds                      	|

Feed:

| key     	| description                         	|
|---------	|-------------------------------------	|
| url     	| url to host the feed on             	|
| source  	| source of the rss feed to transform 	|
| filters 	| array of filters                    	|

Filter:

| key      	| description                                                                                                                                                                                                	|
|----------	|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------	|
| key      	| key on the rss feed items to apply the regex to                                                                                                                                                            	|
| regex    	| regex to run on the specified key                                                                                                                                                                          	|
| unescape 	| set to true if the regex matches need to be unescaped before applying transformations                                                                                                                      	|
| multi    	| can there be multiple regex matches per feed item                                                                                                                                                          	|
| replace  	| transformation functions to be called on each matched item. should return the new value. can be applied to *link* or *value* Function has two parameters:  match - regex match, item - corresponding item from rss feed 	|

## TODO
- command line arguments (log level, port, etc...)
- ability to require module and transform rss feeds programmatically
- unit tests
- extra item key transformations
- ability to combine multiple feeds
- better logging
