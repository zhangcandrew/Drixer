/*!
* ADDb Script Library
* APi documentation: <http://addb.absolutdrinks.com/docs/clients/addb-js>
*/
/**
* The ADDb Script Library provides a simple APi
* To perform queries against the ADDb <http://addb.absolutdrinks.com>
* @module addb
*/
/**
* This is the root singleton class for all addb queries and actions
* @class addb
* @static
*/
var addb = function() {
var configuration = {
host: 'addb.absolutdrinks.com',
assetsHost: 'assets.absolutdrinks.com',
queryExecuting: null,
defaultPageSize: 25,
developer: true
};
return {
/**
* Initializes the addb class, needs to be called once to provide app id
* @method init
* @param {object} options configuration of the addb
*/
init: function(options) {
for (var key in options) {
configuration[key] = options[key];
}
},
/**
* The current configuration object
* @property {Object} configuration
*/
configuration: configuration,
/**
* Begin a query for actions
* @method actions
* @param {String} language the language branch the response should be in
* @return {addb.GenericQuery}
*/
actions: function(language) {
return new addb.GenericQuery(language, 'actions');
},
/**
* Begins a query for drinks
* @method drinks
* @param {String} language the language branch the response should be in
* @param {Object} options object hash of filtering (for those who don't want to use fluent syntax)
* @return {addb.DrinksQuery}
*/
drinks: function(language, options) {
return new addb.DrinksQuery(language, options);
},
/**
* Begins a query for Drink Types
* @method drinkTypes
* @param {String} language the language branch the response should be in
* @return {addb.GenericQuery}
*/
drinkTypes: function(language) {
return new addb.GenericQuery(language, 'drinktypes');
},
/**
* Begins a query for glasses
* @method glasses
* @param {String} language the language branch the response should be in
* @return {addb.GenericQuery}
*/
glasses: function(language) {
return new addb.GenericQuery(language, 'glasses');
},
/**
* Begins a query for I'll Have Ones
* @method illHaveOnes
* @param {String} language the language branch the response should be in
* @return {addb.IllHaveOnesQuery}
*/
illHaveOnes: function(language) {
return new addb.IllHaveOnesQuery(language);
},
/**
* Begins a query for Ingredients
* @method ingredients
* @param {String} language the language branch the response should be in
* @param {Object} options
* @return {addb.IngredientsQuery}
*/
ingredients: function(language) {
return new addb.GenericQuery(language, 'ingredients');
},
/**
* Begins a query for Ingredient Types
* @method ingredientTypes
* @param {String} language the language branch the response should be in
* @return {addb.GenericQuery}
*/
ingredientTypes: function(language) {
return new addb.GenericQuery(language, 'ingredienttypes');
},
/**
* Begins a query for occasions
* @method occasions
* @param {String} language the language branch the response should be in
* @return {addb.OccasionsQuery}
*/
occasions: function(language) {
return new addb.OccasionsQuery(language);
},
/**
* Begins a query for tastes
* @method tastes
* @param {String} language
* @return {addb.GenericQuery}
*/
tastes: function(language) {
return new addb.GenericQuery(language, 'tastes');
},
/**
* Begins a query for tools
* @method tools
*/
tools: function(language) {
return new addb.GenericQuery(language, 'tools');
},
/**
* Begins a query for user collections
* @method userCollections
* @param {String} language the language branch the response should be in
* @return {addb.UserCollectionsQuery}
*/
userCollections: function (language, authToken) {
return new addb.UserCollectionsQuery(language, authToken);
}
};
} ();
Array.prototype.parse = function (showHidden) {
var result = [];
for (var i = 0; i < this.length; i++) {
var current = this[i];
if (!showHidden && current.type == 'ice' || current.type == 'decoration')
continue;
current.text = current.text.split('[').join('').split('*').join('').split(']').join('');
result.push(current);
}
return result;
}
/**
* The Util Class contains a set of utility functions
* @namespace addb
* @class Util
* @static
*/
addb.Util = function() {
return {
/**
* Adds a trailing slash to any string, if there aren't already
* @param {String} str the string to add a slash to
*/
appendTrailingSlash: function(str) {
if (!str) {
throw new Error('You didn\'t provide a string to append the slash to');
}
if (str[str.length-1] !== '/') {
return str += '/';
}
return str;
},
/**
* Formats a string to an entitys image depeding on provided parameters
* @param {String} resourceType the type of the resource you want an image url to
* @param {String} id the id of the entity
* @param {Number} width the measurement of the image width, in pixels (optional)
* @param {Number} height the measuremtent of the image height, in pixels (optional)
* @param {String} format the format of the image (either 'jpg' or 'png')
* @param {Number} compression the compression of the image, if the format was set to 'jpg'
* @return {String} the formatted src to the image
*/
getImageUrl: function(resourceType, id, width, height, format, compression) {
if (!resourceType) throw new Error("You must provide a resource type");
if (!id) throw new Error("You must provide a id of the entity");
var imageUrl = ('https:' == document.location.protocol ? 'https://' : 'http://') + addb.configuration.assetsHost;
imageUrl += '/' + resourceType;
if (width || height) {
if (!width || !height || typeof width !== 'number' || typeof height !== 'number') {
throw new Error('If you provide a size, you must provide both "width" and "height" and they must both be numbers');
}
imageUrl += '/' + width + 'x' + height;
}
imageUrl += '/' + id;
if (compression) {
if (format != 'jpg') {
throw new Error('You must set format to "jpg" if you want to provide compression');
}
if (typeof compression !== 'number' || compression < 1 || compression > 100) {
throw new Error('The compression must be a number betweet 1 - 100');
}
imageUrl += '(' + compression + ')';
}
if (format) {
if (format != 'jpg' && format != 'png') {
throw new Error('Currently we only support "jpg" or "png"');
}
imageUrl += '.' + format;
}
else {
imageUrl += '.png';
}
return imageUrl;
},
/**
* Simple inheritance helper
* @method inherit
* @return {Object}
*/
inherit: function(superClass) {
function proto() {}
proto.prototype = superClass.prototype;
return new proto();
}
};
}();
/**
* The parser is used for transforming entity references
* in texts.
*
* @namespace addb
* @class Parser
* @static
*/
addb.parser = {
/**
* Transforms the provided string with the provided transformer
* @method transform
* @param {String} the string to transform
* @param {function} the transformer
* @returns {String} the transformed string
*/
transform: function(str, tranformer) {
var regex = /\[([^|]+)\|([^|]+)\|([^|]+)\]/gm;
var newString = str, match;
while (match = regex.exec(str)) {
newString = newString.replace(match[0], tranformer(match[1], match[2], match[3]));
}
return newString;
},
/**
* Entirely cleans a string from references
* @method clean
* @param {String} the string to transform
* @returns {String} tje transformed string
*/
clean: function(str) {
return this.transform(str, function(name, type, id) {
return name;
});
}
};
/*
UrlBuilder
Contains the code to build an url against the ADDb
*/
addb.UrlBuilder = function(initialUrl) {
this.reset(initialUrl);
};
// Returns the current Url
addb.UrlBuilder.prototype.url = function() {
var url = addb.Util.appendTrailingSlash(this.theUrl);
for(var i=0; i<this.parameters.length;i++) {
url += (i === 0) ? '?' : '&';
url += this.parameters[i].name + '=' + this.parameters[i].value;
}
return url;
};
// Adds parameter to the urlBuilder
addb.UrlBuilder.prototype.addParameter = function(name, value) {
if (typeof value == 'undefined') return;
for(var i=0; i<this.parameters.length;i++) {
if (this.parameters[i].name === name) {
this.parameters[i].value = value;
return;
}
}
// Add a new parameter
this.parameters.push({
name: name,
value: value
});
};
/**
* Appends the provided string to the url to be called
* @method append
* @param {String} string
*/
addb.UrlBuilder.prototype.append = function(string) {
this.theUrl += string;
};
// Adds a segment to the current url
addb.UrlBuilder.prototype.appendSegment = function(segment) {
if(this.theUrl && this.theUrl[this.theUrl.length-1] != '/' && segment && segment[0] != '/')
this.theUrl += '/';
this.theUrl += segment;
};
// Appends a key value filter. ie. "somekey/somevalue"
addb.UrlBuilder.prototype.appendKeyValueFilter = function(key, value) {
this.appendSegment(key + '/' + value);
};
addb.UrlBuilder.prototype.reset = function (initialUrl) {
this.parameters = [];
var host = addb.configuration.host.replace(/https?:\/\//, '');
this.theUrl = ('https:' == document.location.protocol ? 'https://' : 'http://') + host;
if (initialUrl)
this.appendSegment(initialUrl);
};
addb.Callbacks = 0;
/**
* The callback class handles the functionality to make the
* JSONP work. With simple generated callback names.
*
* @namespace addb
* @class Callback
* @constructor
*/
addb.Callback = function(queryBuilder, callback) {
if (!callback || typeof callback !== 'function') {
throw new Error('You didn\'t provide a callback or your callback wasn\'t a function');
}
this.registerCallbackInWindow(this.generateName(), queryBuilder, callback);
addb.Callbacks++;
};
addb.Callback.prototype = {
/**
* Generates a name for the callback. This is done this way to increase the
* chances that the request is cached by the ADDb:s cache and Akamai
* @method generateName
* @return {String} the generated name
*/
generateName: function() {
var name = 'addbCallback';
name += addb.Callbacks;
return name;
},
/**
* Installs the callback into the page
* @method registerCallbackInWindow
* @param {addb.GenericQuery} queryBuilder
* @param {function} callback
*/
registerCallbackInWindow: function(name, queryBuilder, callback) {
if (!addb.configuration.appId) {
throw new Error('You must specify an appId');
}
queryBuilder.addParameter('appId', addb.configuration.appId);
// If any callback event is specified call it
if (addb.configuration.queryExecuting) {
addb.configuration.queryExecuting(queryBuilder);
}
queryBuilder.addParameter('callback', name);
var callbackName = name;
var resourceType = queryBuilder.initialUrl;
// Prepare the responder in the global scope
window[callbackName] = function(response) {
// Add image Url to the entities
if (response.totalResult) {
for(var i=0; i < response.result.length; i++) {
response.result[i].image = function(width, height, format, compression) {
var obj = this.data || this;
return addb.Util.getImageUrl(resourceType, obj.id, width, height, format, compression);
};
}
} else {
response.image = function(width, height, format, compression) {
return addb.Util.getImageUrl(resourceType, response.id, width, height, format, compression);
};
}
var tag = document.getElementById(callbackName);
tag.parentNode.removeChild(tag);
callback(response);
delete window[callbackName];
};
var script = document.createElement('script');
script.id = name;
script.type = "text/javascript";
script.async = true;
script.src = encodeURI(queryBuilder.url());
// append it to the head since old versions of IE likes this the most.
document.getElementsByTagName('head')[0].appendChild(script);
}
};
/**
* Base class for all queries against the ADDb.
* This class contains the functions that is common
* for all the query builders
*
* @namespace addb
* @class GenericQuery
* @constructor
* @param {String} language the language branch the result should be in (defaults to 'en')
* @param {String} initialUrl the base url of this resource.
* @extends addb.UrlBuilder
*/
addb.GenericQuery = function (language, initialUrl) {
addb.UrlBuilder.call(this, initialUrl);
this.addParameter('lang', language);
this.addParameter('pageSize', addb.configuration.defaultPageSize);
this.lang = language;
this.initialUrl = initialUrl;
};
addb.GenericQuery.prototype = addb.Util.inherit(addb.UrlBuilder);
/**
* Loads the entity of the specified id.
* @method load
* @param {String} id the id of the entity you want to load
* @param {function} callback the callback method
*/
addb.GenericQuery.prototype.load = function(id, callback) {
if (!addb.configuration.appId) {
alert("ADDb Error: You must initialize and provide an app Id");
return;
}
this.reset(this.initialUrl);
this.addParameter('lang', this.lang);
this.appendSegment(id);
new addb.Callback(this, callback);
};
/**
* Loads the set that matches the current builded url.
* @method loadSet
* @param {function} callback the callback that should be run when the query is executed
*/
addb.GenericQuery.prototype.loadSet = function(callback) {
if (!addb.configuration.appId) {
throw new Error('ADDb Error: You must initialize and provide an app Id');
return;
}
new addb.Callback(this, callback);
};
/**
* Searches the ADDb for entities matching name provided in query.
* Useful when building for an example an AutoComplete AJAX search.
* @method quickSearch
* @param {String} query the query against ADDb
* @param {function} callback
*/
addb.GenericQuery.prototype.quickSearch = function(query, callback) {
this.reset(this.initialUrl);
this.addParameter('lang', this.lang);
this.addParameter('quickSearch', query);
new addb.Callback(this, callback);
};
/**
* Creates a dynamic query on the entity provided
* @method find
* @param {Object} options
* @param {function} callback
*/
addb.GenericQuery.prototype.find = function(options, callback) {
if (!options || options.length == 0) {
throw new Error('You must provide some find options');
return;
}
if (!addb.configuration.appId) {
throw new Error('You must initialize and provide an app Id');
return;
}
this.reset(this.initialUrl);
this.addParameter('lang', this.lang);
var query = '';
for (var key in options) {
query += key[0].toUpperCase() + key.slice(1) + ':';
query += options[key];
query += ' AND ';
}
query = query.substring(0, query.length - 5);
this.addParameter('find', query);
new addb.Callback(this, callback);
};
/**
* Makes the result of the query skip to the provided index.
* @method skip
* @param {number} amount the index you want to start at.
* @return {this} returns the query builder to allow more chaining
*/
addb.GenericQuery.prototype.skip = function(amount) {
this.addParameter('start', amount);
return this;
};
/**
* Sets the page size of the query
* @method take
* @params {number} amount the amount of items you want each page to have.
* @return {this} returns the query builder to allow more chaining
*/
addb.GenericQuery.prototype.take = function(amount) {
this.addParameter('pageSize', amount);
return this;
};
/**
* The Drinks Query contains the methods to create a query for Drinks.
* As all the queries a fluent syntax is default usage, meaning that
* you chain toghether the conditions of your query and then execute it.
*
* @namespace addb
* @class DrinksQuery
* @extends addb.GenericQuery
*/
addb.DrinksQuery = function(language, options) {
addb.GenericQuery.call(this, language, 'drinks');
if (options) {
this.filter(options);
}
}
addb.DrinksQuery.prototype = addb.Util.inherit(addb.GenericQuery);
/**
* Adds a filter by ingredients to the query
*
* @method withIngredient
* @param {String} ingredient the id or id's chained togheter with 'or' or 'and'
* @return {addb.DrinksQuery}
*/
addb.DrinksQuery.prototype.withIngredient = function(ingredient) {
this.appendKeyValueFilter('with', ingredient);
return this;
};
/**
* Adds a filter by ingredient type to the query
*
* @method withType
* @param {String} ingredientsType the id or id's chained togheter with 'or' or 'and'
* @return {addb.DrinksQuery}
*/
addb.DrinksQuery.prototype.withType = function(ingredientsType) {
this.appendKeyValueFilter('withtype', ingredientsType);
return this;
};
/**
* Adds a filter by occasion to the query
*
* @method forOccasion
* @param {String} occasion the id or id's chained togheter with 'or' or 'and'
* @return {addb.DrinksQuery}
*/
addb.DrinksQuery.prototype.forOccasion = function(occasion) {
this.appendKeyValueFilter('for', occasion);
return this;
};
/**
* Adds a filter by tool to the query
*
* @method madeWith
* @param {String} tool the id or id's chained togheter with 'or' or 'and'
* @return {addb.DrinksQuery}
*/
addb.DrinksQuery.prototype.madeWith = function(tool) {
this.appendKeyValueFilter('madeWith', tool);
return this;
};
/**
* Adds a filter for tastes to the query
*
* @method tasting
* @param {String} taste the id or id's chained togheter with 'or' or 'and'
* @return {addb.DrinksQuery}
*/
addb.DrinksQuery.prototype.tasting = function(taste) {
this.appendKeyValueFilter('tasting', taste);
return this;
};
/**
* Adds a filter for drink types to the query
*
* @method ofType
* @param {String} ofType the id.
* @return {addb.DrinksQuery}
*/
addb.DrinksQuery.prototype.ofType = function(drinkType) {
this.appendKeyValueFilter('oftype', drinkType);
return this;
};
/**
* Adds a filter by rating to the drinks query
*
* @method rating
* @param {String} rating the rating to filter eg. 'gt50'(greater than 50) or 'lte30' (less or equal than 30)
* @return {addb.DrinksQuery}
*/
addb.DrinksQuery.prototype.rating = function(rating) {
this.appendKeyValueFilter('rating', rating);
return this;
}
/**
* Adds a filter by serving glass
*
* @method servedIn
* @param {String} glass the glass type id
* @return {addb.DrinksQuery}
*/
addb.DrinksQuery.prototype.servedIn = function(glass) {
this.appendKeyValueFilter('servedin', glass);
return this;
}
/**
* Adds a filter if the drink is alcoholic or not
*
* @method alcoholic
* @param {Boolean} isAlcoholic whether the drinks should contain alcohol or not
* @return {addb.DrinksQuery}
*/
addb.DrinksQuery.prototype.alcoholic = function(isAlcoholic) {
this.appendKeyValueFilter('alcoholic', isAlcoholic ? 'yes' : 'no');
return this;
};
/**
* Adds a filter by if the drink is carbonated
*
* @method carbonated
* @param {Boolean} isCarbonated whether the drinks should be carbonated or not
* @return {addb.DrinksQuery}
*/
addb.DrinksQuery.prototype.carbonated = function(isCarbonated) {
this.appendKeyValueFilter('carbonated', isCarbonated ? 'yes' : 'no');
return this;
};
/**
* Adds a filter if the drink have video or not
* @method video
* @param {boolean} hasVideo
* @return {addb.DrinksQuery}
*/
addb.DrinksQuery.prototype.video = function(hasVideo) {
this.appendKeyValueFilter('video', hasVideo ? 'yes' : 'no');
return this;
};
/**
* Skill
*/
addb.DrinksQuery.prototype.skill = function(skill) {
this.appendKeyValueFilter('skill', skill);
return this;
};
/**
* Loads the how to mix for the provided drink id
*
* @method howToMix
* @param {String} drink the drink id
* @param {function} callback the callback method to run after it's loaded
*/
addb.DrinksQuery.prototype.howToMix = function (drink, callback) {
this.reset(this.initialUrl);
this.addParameter('lang', this.lang);
this.appendSegment(drink);
this.appendSegment('howtomix');
new addb.Callback(this, callback);
};
/**
* Appends an extra condition to the last appended filter
* with the condition type 'and'
* @method and
* @param {String} value condition
* @return {addb.DrinksQuery}
*/
addb.DrinksQuery.prototype.and = function(value) {
this.append(' and ' + value);
return this;
};
/**
* Appends an extra condition to the last appended filter
* with the condition type 'or'
* @method or
* @param {String} value the condition
* @return {addb.DrinksQuery}
*/
addb.DrinksQuery.prototype.or = function(value) {
this.append(' or ' + value);
return this;
};
/**
* Finds drinks that are similar to the drink with the provided id
* @method like
* @param {String} drinkId the drink id you want to find similar drinks to
* @return {addb.DrinksQuery}
*/
addb.DrinksQuery.prototype.like = function(drinkId) {
this.reset(this.initialUrl);
this.addParameter('lang', this.lang);
this.addParameter('like', drinkId);
this.addParameter('pageSize', addb.configuration.defaultPageSize);
return this;
};
/**
*
*/
addb.DrinksQuery.prototype.filter = function(options) {
if (options.withIngredient) this.withIngredient(options.withIngredient);
if (options.forOccasion) this.forOccasion(options.forOccasion);
if (options.madeWith) this.madeWith(options.madeWith);
if (options.tasting) this.tasting(options.tasting);
if (options.ofType) this.ofType(options.ofType);
if (options.rating) this.rating(options.rating);
if (options.servedIn) this.servedIn(options.servedIn);
if (options.alcoholic) this.alcoholic(options.alcoholic);
if (options.carbonated) this.carbonated(options.carbonated);
if (options.video) this.video(options.video);
if (options.skill) this.skill(options.skill);
if (options.withType) this.withType(options.withType);
return this;
};
/*
IllHaveOnesQuery : GenericQuery
*/
addb.IllHaveOnesQuery = function(language, options) {
addb.GenericQuery.call(this, language, 'illhaveones');
if (options) {
this.filter(options);
}
};
// Inherit Generic Query
addb.IllHaveOnesQuery.prototype = addb.Util.inherit(addb.GenericQuery);
// We override the load since this isn't supported here
addb.IllHaveOnesQuery.prototype.load = function() {
throw new Error("You can't load a single I'll have one");
};
// We override the skip since this isn't supported here
addb.IllHaveOnesQuery.prototype.skip = function() {
throw new Error("You can't skip on I'll have ones");
}
// Add an authtoken
addb.IllHaveOnesQuery.prototype.withAuthToken = function(authToken) {
this.addParameter('authtoken', authToken);
return this;
};
// Show only friends
addb.IllHaveOnesQuery.prototype.friendsOnly = function() {
this.addParameter('friendsonly', null);
return this;
};
addb.IllHaveOnesQuery.prototype.fromId = function(id) {
this.addParameter('fromId', id);
return this;
};
addb.IllHaveOnesQuery.prototype.forDrinks = function(drinks) {
this.appendKeyValueFilter('bydrinks', drinks);
return this;
};
addb.IllHaveOnesQuery.prototype.near = function(lat, lng, radius) {
if (!lat || lng) {
throw new Error('You must atleast provide both lat and lng');
}
var loc = lat + ',' + lng;
if (radius) {
loc += ',' + radius;
}
this.appendKeyValueFilter('near', loc);
return this;
};
addb.IllHaveOnesQuery.prototype.byEdition = function(edition) {
this.appendKeyValueFilter('byedition', edition);
return this;
};
addb.IllHaveOnesQuery.prototype.inCity = function(city) {
this.appendKeyValueFilter('incity', city);
return this;
};
addb.IllHaveOnesQuery.prototype.inCountry = function(country) {
this.appendKeyValueFilter('incountry', country);
return this;
};
addb.IllHaveOnesQuery.prototype.filter = function(options) {
};
/*
* OccasionsQuery is returned when querying for occasions
* @namespace addb
* @class OccasionsQuery
* @constructor
* @param {String} language
*/
addb.OccasionsQuery = function(language) {
addb.GenericQuery.call(this, language, 'occasions');
};
addb.OccasionsQuery.prototype = addb.Util.inherit(addb.GenericQuery);
/*
* Gets the occasions active at the provided date
* @method activeAt
* @param {Date} date
* @param {function} callback the callback method to call
*/
addb.OccasionsQuery.prototype.activeAt = function(date, callback) {
if (typeof date !== 'Date') {
throw new Error('You must provide a valid Date object');
}
var formattedDate = date.getFullYear() + '-';
formattedDate += date.getMonth() + '-';
formattedDate += date.getDay() + '!';
formattedDate += date.getHours() + date.getMinutes();
this.addParameter('activeat', formattedDate);
new addb.Callback(this, callback);
};
/*
* UserCollectionsQuery is returned when querying for user collections
* @namespace addb
* @class UserCollectionsQuery
* @constructor
* @param {String} language
* @param {String} authToken a Facebook auth token
*/
addb.UserCollectionsQuery = function (language, authToken) {
addb.GenericQuery.call(this, language, 'usercollections');
if (authToken) {
this.addParameter('authToken', authToken);
}
this.authToken = authToken;
};
addb.UserCollectionsQuery.prototype = addb.Util.inherit(addb.GenericQuery);
/**
* Creates a collection
* @method create
* @param {String} name the name of the collection
* @param {function} callback the callback function
*/
addb.UserCollectionsQuery.prototype.create = function (name, callback) {
this.appendSegment("create");
this.addParameter('name', name);
if (arguments.length > 2) {
var drinks = [];
for (var i = 2; i < arguments.length; i++) {
drinks[i - 2] = arguments[i];
}
this.addParameter('drinklist', drinks.join());
}
this.addParameter('appId', addb.configuration.appId);
new addb.Callback(this, callback);
}
/**
* Updates a collection
* @method update
* @param {String} id id of the user collection you want to update
* @param {String} name the new name of the collection
* @param {function} callback the callback function
*/
addb.UserCollectionsQuery.prototype.update = function (id, name, callback) {
this.appendSegment(id);
this.appendSegment("update");
this.addParameter('name', name);
if (arguments.length > 3) {
var drinks = [];
for (var i = 3; i < arguments.length; i++) {
drinks[i - 3] = arguments[i];
}
this.addParameter('drinklist', drinks.join());
}
this.addParameter('appId', addb.configuration.appId);
new addb.Callback(this, callback);
}
/**
* Deletes a user collection
* @method deleteUserCollection
* @param {String} id id of the user collection you want to update
* @param {function} callback the callback function
*/
addb.UserCollectionsQuery.prototype.deleteUserCollection = function (id, callback) {
this.appendSegment(id);
this.appendSegment("delete");
new addb.Callback(this, callback);
}
/**
* Loads the flipside of a drink - a list of other drinks that can be made with
* the ingredients from the drinks in this user collection
* @method flipside
* @param {String} id the id of the list you want to load flipside for
* @param {function} callback the callback function
*/
addb.UserCollectionsQuery.prototype.flipside = function (id, callback) {
this.appendSegment(id);
this.appendSegment("flipside");
new addb.Callback(this, callback);
};
