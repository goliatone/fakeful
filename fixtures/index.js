var Handlebars = require('handlebars'),
    faker = require('faker');



// We try to keep names, emails and companies in sync, so that when using them
// together in a loop they all relate to each other. To do this we link them all
// to an index which is incremented only when the same type of property is
// accessed twice in a row.
var personIndex = 0;
var usedPersonAttrs = [];



var randomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

var randomFloat = function(min, max) {
    return Math.random() * (max - min) + min;
};

var randomBoolean = function() {
    return Math.random() > 0.5;
};

var zeroPad = function(num, len) {
    num = num + '';
    while (num.length < len) {
        num = '0' + num;
    }
    return num;
}

var uniqueIndex;

var helpers = {
    repeat: function(min, max, options) {
        // By default repeat will work with it's current context, unless it's
        // given an array in which case it'll work with that
        var context = this;
        var contextIsArray = false;
        var count = 0;

        if (Array.isArray(min)) {
            // If the helper was given an array then juggle the arguments
            options = max;
            context = min;
            count = context.length;
            contextIsArray = true;
        } else {
            if (arguments.length === 3) {
                // If given two numbers then pick a random one between the two
                count = randomInt(min, max);
            } else if (arguments.length === 2) {
                // If given one number then just use it as a fixed repeat count
                options = max;
                count = min;
            }
        }

        var ret = '';
        for (var i = 0; i < count; i++) {
            // index and count are passed as private variables so they don't pollute
            // the context scope
            ret += options.fn(
                contextIsArray ? context[i] : context, {
                    data: {
                        index: i,
                        count: count
                    }
                }
            );
            // Trim whitespace left by handlebars and add commas between items
            ret = ret.trim();
            if (i < count - 1) ret += ',';
        }

        return ret;
    },

    number: function(min, max, options) {
        // If only one number is provided then generate from 0 to that number
        if (arguments.length === 2) {
            options = max;
            max = min;
            min = 0;
        }

        // Handlebars helpers don't accept numbers with decimal places as arguments
        // so floats must be passed as strings
        var isFloat = false;
        if (typeof min === 'string') {
            isFloat = true;
            min = parseFloat(min);
            max = parseFloat(max);
        }

        if (isFloat) {
            return randomFloat(min, max);
        } else {
            var n = randomInt(min, max);
            // Integers can optionally be padded with leading zeros
            return options.hash.pad ? zeroPad(n, max.toString().length) : n;
        }
    },

    name: function(options) {
        return faker.Name.findName();
    },
    userName: function(options) {
        return faker.Internet.userName();
    },
    email: function(options) {
        return faker.Internet.email();
    },
    streetName: function(options) {
        return faker.Address.streetName();
    },
    streetAddress: function(options) {
        return faker.Address.streetAddress();
    },
    streetAddressB: function(options) {
        return faker.Address.streetAddress(true);
    },
    secondaryAddress: function(options) {
        return faker.Address.secondaryAddress();
    },
    city: function(options) {
        return faker.Address.city();
    },
    ukCounty: function(options) {
        return faker.Address.ukCounty();
    },
    ukCountry: function(options) {
        return faker.Address.ukCountry();
    },
    zipcode: function(options) {
        return faker.Address.zipCode();
    },
    latitude: function(options) {
        return faker.Address.latitude();
    },
    longitude: function(options) {
        return faker.Address.longitude();
    },
    phone: function(options) {
        return faker.PhoneNumber.phoneNumber();
    },
    website: function(options) {
        return faker.Internet.domainName();
    },
    company: function(options) {
        return faker.Company.companyName()
    },
    catchPhrase: function(options) {
        return faker.Company.catchPhrase();
    },
    compnayBS: function(options) {
        return faker.Company.bs();
    },
    words: function(options) {
        return faker.Lorem.words()
    },
    sentence: function(options) {
        return faker.Lorem.sentence()
    },
    sentences: function(options) {
        return faker.Lorem.sentences()
    },
    paragraph: function(options) {
        return faker.Lorem.paragraph()
    }
};

module.exports = {
    parse: function(string, options) {
        options = options || {};


        // Merge the built-in helpers with any that are passed in the options
        var combinedHelpers = {};
        Handlebars.Utils.extend(combinedHelpers, helpers);
        Handlebars.Utils.extend(combinedHelpers, options.helpers);

        // Reset indexes on each parse
        return Handlebars.compile(string)(options.data, {
            helpers: combinedHelpers
        });
    }
};