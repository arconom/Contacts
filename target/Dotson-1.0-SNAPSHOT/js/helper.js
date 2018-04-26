/*property
    Augment, Chainify, DateRangeFiltering, Debounce, DynamicSort,
    DynamicSortMultiple, FilterByQuery, FindRegex, GenerateGUID,
    GetAttributeSelector, GetId, GetKeyValuePairs, GetProperty,
    GetViewportDimensions, Mix, SortNumber, TextareaMouseUp, TextareaResize,
    TransformAllMatches, apply, clientHeight, clientWidth, dataset,
    documentElement, exec, findRegex, forEach, getAttribute, height, id,
    indexOf, innerHeight, innerWidth, keys, length, log, max, offsetHeight,
    offsetWidth, parentElement, prototype, push, query, random, replace,
    scrollHeight, search, style, substr, test, toLowerCase, toString, trim,
    value, width
*/
var Helper =
{
    /*
    Adds a function to execute during every function within window.
    Functions created after this executes are not affected.

    @param {function} withFn - apply this function to all functions in window
    */
    augment: function (withFn)
    {
        var name,
            fn;

        for (name in window)
        {
            fn = window[name];

            if (typeof fn === "function")
            {
                window[name] = (function (name, fn)
                {
                    var args = arguments;

                    return function ()
                    {
                        withFn.apply(this, args);
                        return fn.apply(this, arguments);
                    };
                })(name, fn);
            }
        }
    },

    /**
    * Alters the prototype of an object to make each function
    * @param {object} obj will have its prototype altered
    */
    chainify: function (obj)
    {
        Object.keys(obj).forEach(function (key)
        {
            var member = obj[key];
            if (typeof member === "function" && !(/\breturn\b/).test(member))
            {
                obj[key] = function ()
                {
                    member.apply(this, arguments);
                    return this;
                };
            }
        });
    },

    cssManipulation:
    {
        /*
        This adds some CSS to the page
        */
        AddStyleSheet: function (content)
        {
            //for cross browser compatibility, use the following commented statement
            //var cssRuleCode = document.all ? 'rules' : 'cssRules'; //account for IE and FF

            document.querySelector("head").appendChild(this.CreateStyleSheet(content));
        },

        /*
        This function creates a style sheet and returns it.
        */
        CreateStyleSheet: function (content)
        {
            var style = document.createElement("style");
            var styleSheet = style.styleSheet;

            if (styleSheet)
            {
                stylesheet.cssText = content;
            }
            else
            {
                style.appendChild(document.createTextNode(content));
            }

            style.type = "text/css";
            return style;
        }
    },

    /*
    I copy source's prototype to destination's prototype!
    source is an object
    destination is an object
    */
    debounce: function (func, threshold, execAsap)
    {
        var timeout;

        return function debounced()
        {
            var obj = this,
                args = arguments;

            function delayed()
            {
                if (!execAsap)
                {
                    func.apply(obj, args);
                }

                timeout = null;
            }

            if (timeout)
            {
                clearTimeout(timeout);
            }
            else if (execAsap)
            {
                func.apply(obj, args);
            }

            timeout = setTimeout(delayed, threshold || 100);
        };
    },

    events: {
        // addEventListener wrapper:,
        $on: function (target, type, callback, useCapture)
        {
            console.log("Helper.&on");
            if (target !== null)
            {
                // if the browser is old
                if (!target.addEventListener)
                {
                    target.attachEvent(type, callback);
                }
                else
                {
                    target.addEventListener(type, callback, !!useCapture);
                }
            }
        },

        // Attach a handler to event for all elements that match the selector,
        // now or in the future, based on a root element
        $delegate: function (target, selector, type, handler)
        {
            console.log("Helper.&delegate");
            var that = this;

            function dispatchEvent(event)
            {
                var targetElement = event.target;
                var potentialElements = that.qsa(selector, target);
                var hasMatch = Array.prototype.indexOf.call(potentialElements, targetElement) >= 0;

                if (hasMatch)
                {
                    handler.call(targetElement, event);
                }
            }

            // https://developer.mozilla.org/en-US/docs/Web/Events/blur
            var useCapture = type === 'blur' || type === 'focus';

            this.$on(target, type, dispatchEvent, useCapture);
            //window.$on(target, type, dispatchEvent, useCapture);
        },
    },

    /**
    * Filters items based on the given query
    * @param {object} query is an object with the desired key/value
    * @param {object} item is to be compared to query
    * @returns {bool}
    */
    filterByQuery: function (query, item)
    {
        console.log("Helper.filterByQuery");

        Object.keys(query).forEach(function (key)
        {
            if (item[key] !== undefined)
            {
                if (String(item[key]).toLowerCase().indexOf(query[key].toLowerCase()) === -1)
                {
                    return false;
                }
            }
            else
            {
                return false;
            }
        });
        return true;
    },

    formatting: {
        /**
        * Formats money
        * @param {number} price is a numeric value without notation
        * @returns {string} a formatted monetary value
        */
        money: function (price)
        {
            var p = parseFloat(price).toFixed(2).split(".");
            return "$" + p[0].split("").reverse().reduce(function (acc, num, i, orig)
            {
                return num + (i && !(i % 3) ? "," : "") + acc;
            }, "") + "." + p[1];
        },
        /**
        * Adjusts precision to 2 places, then strips out invalid values
        * @param {number} price
        * @returns {number/string}
        */
        price: function (price)
        {
            var val = parseFloat(Math.round(price * 100) / 100).toFixed(2);
            return val == 'NaN' ? '' : val == 'Infinity' ? '' : val;
        },
        /**
        * Formats the date with the given separator
        * @param {string} date
        * @param {string} separator defaults to /
        * @returns {string}
        */
        date: function (date, separator/* separator = "/" */)
        {
            if ((typeof date === "string") || (typeof date === "number"))
            {
                date = new Date(date);
            }
            if (!separator)
            {
                separator = "/";
            }
            if (date == undefined)
            {
                date = new Date();
            }

            return (date.getMonth() + 1) + separator + date.getDate() + separator + date.getFullYear();
        },
        //formatDate: function (value) {
        //    var monthNames = [
        //        "Jan",
        //        "Feb",
        //        "Mar",
        //        "Apr",
        //        "May",
        //        "Jun",
        //        "Jul",
        //        "Aug",
        //        "Sep",
        //        "Oct",
        //        "Nov",
        //        "Dec"
        //    ];
        //
        //    var date = new Date(value);
        //    var day = date.getDate();
        //    var monthIndex = date.getMonth();
        //    var year = date.getFullYear();
        //
        //    return day + " " + monthNames[monthIndex] + " " + year;
        //},

        /**
        * Gives the time portion of a DateTime
        * @param {string} date
        * @returns {string}
        */
        time: function (date)
        {
            if (typeof date === "string")
            {
                date = new Date(date);
            }

            return date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
        }
    },

    /**
    * @returns {string} a randomly generated guid
    */
    generateGuid: function ()
    {
        var template = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
        //    var template = "xxxxxxxxxxxxyxxxyxxxxxxxxxxxxxxx";
        var returnMe = template.replace(/[xy]/g, function (c)
        {
            var r = Math.random() * 16 | 0,
                v = c == "x" ? r
                /*
                 * What we're doing here is bitwise operations :
                 * 0x3.toString(2) => 11
                 * 0x8.toString(2) => 1000
                 * first a and with 11 at the bit level (truncating to only the two last bits, that is doing %4),
                 * then a or with 1000 (setting one bit, adding 8).
                 */
                : (r & 0x3 | 0x8);
            return v.toString(16);
        });

        return returnMe;
    },

    /*
     * Generates an id for an HTML element based on the guid generator, 
     * it removes the dashes because the DOM doesn't like them.
     * @return {string}
     */
    generateHTMLElementId: function ()
    {
        return "id" + this.generateGuid().split("-").join("");
    },

    //from viewrfq.js
    //getGuid: function () {
    //    console.log("getGuid");
    //    var d = new Date().getTime();
    //    var template = "xxxxxxxxxxxxyxxxyxxxxxxxxxxxxxxx";
    //    var uuid = template
    //        .replace(/[xy]/g, function (c) {
    //            var r = (d + Math.random() * 16) % 16 | 0;
    //            d = Math.floor(d / 16);
    //            return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
    //        });
    //    return uuid;
    //},

    /**
    * Gets the requested property from a list of objects and returns an array with each value
    * @param {array} items is the list of objects to search
    * @param {string} property is the property to search for
    * @returns {array} a list of the values found
    */
    getProperty: function (items, property)
    {
        console.log("Helper.getProperty");
        var returnMe = [];

        items.forEach(function (item)
        {
            returnMe.push(item[property]);
        });

        return returnMe;
    },

    /**
    * get viewport dimensions,
    * @param {}
    * @returns {object} {width: x, height: y}
    */
    getViewportDimensions: function ()
    {
        var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        return { width: w, height: h };
    },

    html: {
        /**
        * Concatenates an attribute selector based on inputs
        * @param {string} attr
        * @param {string} value
        * @returns {string}
        */
        getAttributeSelector: function (attr, value)
        {
            var template = "[{{0}}=\"{{1}}\"]";
            return template
                .replace("{{0}}", attr)
                .replace("{{1}}", value);
        },

        // Get the key/value pairs from HTML controls and put them into a returned object
        // expects the control to have a key attribute
        /**
        * Iterate over a list of DOM elements, extracting their "key" attributes and their values,
        * and returning the result as an array.
        * @param {array} list
        * @param {bool} replaceEmpty
        * @returns {array}
        */
        getKeyValuePairs: function (list, replaceEmpty)
        {
            var returnMe = {};

            list.forEach(function (item)
            {
                var key = item.getAttribute("key");
                var value = item.value;

                if ((value !== "") && (value !== undefined))
                {
                    returnMe[key] = value.trim();
                }
                else if (replaceEmpty)
                {
                    returnMe[key] = key;
                }
            });

            return returnMe;
        },

        /**
        * Return the id for the given element, supporting older versions of IE
        * @param {object} element
        */
        getId: function (element)
        {
            console.log("Helper.getId");
            var returnMe = undefined;

            if (element.dataset)
            {
                returnMe = element.dataset.id;
            }
            else
            {
                returnMe = element.getAttribute("data-id");
            }

            return returnMe;
        },

        /**
        * Resize textareas to fit the text they contain
        * @param {object} el
        */
        textareaResize: function resize(el)
        {
            el.style.height = "auto";
            el.style.height = el.scrollHeight + "px";
        },

        /**
        * Prevent textareas from being bigger than their container
        * @param {object} sender
        */
        textareaMouseUp: function (sender)
        {
            var parent = sender.parentElement;
            var width = parent.offsetWidth + "px";
            var height = parent.offsetHeight + "px";

            sender.style.height = sender.style.height > height ?
                height : sender.style.height;

            sender.style.width = sender.style.width > width ?
                width : sender.style.width;
        },

        qs: function (selector, scope)
        {
            console.log("Helper.qs");
            var temp = scope || document;
            return temp.querySelector(selector);
        },

        qsa: function (selector, scope)
        {
            console.log("Helper.qsa");
            var temp = scope || document;
            return temp.querySelectorAll(selector);
        },
    },

    /**
    * concatenate arrays and delete duplicates
    * @param {array} source
    * @param {array} destination
    * @returns {array}
    */
    join: function (source, destination)
    {
        //console.log("join", source, destination);
        return destination.concat(source.filter(function (item)
        {
            return destination.indexOf(item) < 0;
        }));
    },

    json: {
        /**
         * determines whether or not the data is in a parseable format
         * and returns a parsed object if possible
         *
         * @param {string} data is JSON or an object
         * @returns {object} parsed data
         */
        tryParse: function (data)
        {
            if (typeof (data) === "string")
            {
                return JSON.parse(data);
            } else
            {
                return data;
            }
        }
    },

    math: {
        /*
        I try to parse an argument through math.js
        I return a parsed string
        */
        // todo this should probably move into a controller
        doMath: function (thing)
        {
            try
            {
                return math.eval(thing);
            }
            catch (e)
            {
                return thing;
            }
        },
    },

    /**
    * Mix one objects prototype into another's
    * @param {object} source
    * @param {object} destination
    */
    mix: function (source, destination)
    {
        console.log("Helper.mix");
        if ((source.prototype !== undefined) && (source.prototype.length > 0))
        {
            source.prototype.forEach(function (prop)
            {
                if (destination.prototype[prop] === undefined)
                {
                    destination.prototype[prop] = prop;
                }
            });
        }
        else
        {
            return;
        }
    },

    mvc: {
        getModelPrefix: function (guid)
        {
            return "Model." + guid + ".";
        },
        getControllerPrefix: function (guid)
        {
            return "Controller." + guid + ".";
        },
        getViewPrefix: function (guid)
        {
            return "View." + guid + ".";
        },
    },

    regex: {
        /**
        * Escapes a regex
        * @param {string} str is a regex
        */
        escape: function (str)
        {
            return str.replace(/([.*+?\^=!:${}()\|\[\]\/\\])/g, "\\$1");
        },

        /**
        * Uses a regex to search a string
        * @param {string} value
        * @param {string} regex
        * @returns {array} the original string and the first match
        */
        find: function (value, regex)
        {
            console.log("Helper.findRegex");

            if (!value || value === "")
            {
                return;
            }

            if (!value.indexOf)
            {
                return;
            }

            if (value.search(regex) !== -1)
            {
                return regex.exec(value);
            }
        },

        /**
        * I iterate through all matches of regex in value and run callback on each match
        * @param {string} value
        * @param {string} regex is what you're looking for
        * @param {function} callback is a thing you want to do.  it should return a string
        * @returns {string}
        */
        transformAllMatches: function (value, regex, callback)
        {
            console.log("Helper.transformAllMatches");
            var match = "";
            var returnMe = value;

            if (value)
            {
                match = Helper.findRegex(value, regex);

                while (match)
                {
                    returnMe = callback(returnMe, match, regex);
                    match = Helper.findRegex(returnMe, regex);
                }

                return returnMe;
            }
            else
            {
                return value;
            }
        },

        validDate: "(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])"
    },

    /**
    * Sets up infinite scrolling on the target,
    * using the callback
    * @param {object} scope is an object or a selector that constrains the find function.  
    * I added this to deal with shadow DOM.
    * @param {string} selector identifies the element that has scrolling enabled
    * @param {number} buffer a number of pixels in which the scroll bar can trigger the effect
    * @param {number} offset a number of pixels to use to account for margins
    * @param {function} callback is executed while the scroll position is within the buffer
    */
    setupInfiniteScroll: function (scope, selector, buffer, offset, callback)
    {
        if (!scope) { scope = document; }

        $(scope).find(selector).parent().scroll(
            //Helper.debounce(
            function ()
            {
                if ($(scope).find(selector).parent().scrollTop() >= $(scope).find(selector).height() - 200 + offset)
                {
                    callback();
                }
            });
        //}, 500, false));
    },

    sorting: {
        /**
        * Sort based on the given property
        * @param {string} property
        * @returns {function}
        */
        dynamicSort: function (property)
        {
            console.log("Helper.dynamicSort");
            var sortOrder = 1;

            if (!property)
            {
                return;
            }

            if (property[0] === "-")
            {
                sortOrder = -1;
                property = property.substr(1);
            }

            return function (a, b)
            {
                var first = a[property];
                var second = b[property];

                if (first.toLowerCase)
                {
                    first = first.toLowerCase();
                }

                if (second.toLowerCase)
                {
                    second = second.toLowerCase();
                }

                var result = (first < second) ?
                    -1 : (first > second) ?
                        1 : 0;

                return result * sortOrder;
            };
        },

        /**
        * Sort based on multiple properties
        * @returns {function}
        */
        dynamicSortMultiple: function ()
        {
            /*
             * save the arguments object as it will be overwritten
             * note that arguments object is an array-like object
             * consisting of the names of the properties to sort by
             */
            var props = arguments;

            return function (obj1, obj2)
            {
                var i = 0,
                    result = 0,
                    numberOfProperties = props.length;

                /* try getting a different result from 0 (equal)
                 * as long as we have extra properties to compare
                 */
                while (result === 0 && i < numberOfProperties)
                {
                    result = dynamicSort(props[i])(obj1, obj2);
                    i += 1;
                }

                return result;
            };
        },

        /**
        * Returns true if the value is between the min and max values
        * @param {object} min
        * @param {object} max
        * @param {object} value
        * @returns {bool}
        */
        between: function (min, max, value)
        {
            if (min === "" && max === "")
            {
                return true;
            }
            else if (min <= value && max === "")
            {
                return true;
            }
            else if (max >= value && min === "")
            {
                return true;
            }
            else if (min <= value && max >= value)
            {
                return true;
            }
            return false;
        },

        numeric: function (a, b)
        {
            return a - b;
        }
    },

    stringManipulation: {
        /**
        * Cleans JSON of extra escape characters
        * @param {string} json
        * @returns {string}
        */
        cleanJSON: function (json)
        {
            var returnMe = json;
            return replaceAll(returnMe, "/\r|\n|\\/g", "");
        },
        /**
        * Replace all instances of a string within a context with another string
        * @param {string} str
        * @param {string} find
        * @param {string} replace
        * @returns {string}
        */
        replaceAll: function (str, find, replace)
        {
            console.log("replaceAll", str, find, replace);
            return str.replace(new RegExp(escapeRegExp(find), "g"), replace);
        }
    },

    webStorage: {
        /*
        * Determine which data store to access based on browser support
        *
        * @param {string} key - the index of WebStorage
        * @param {function(data)} callback - executes logic on the returned data
        */
        getDataFromStore: function (key, callback)
        {
            console.log("getDataFromStore");

            if (WebStorage.local)
            {
                if (!WebStorage.local[key])
                {
                    WebStorage.local[key] = [];
                }
                callback(WebStorage.local[key]);
            }
            else
            {
                data.read(callback(data));
            }
        },

        /*
        * fold the items in the parameter into the data store
        * data is an object or an array of objects
        *
        * @param {object} saveMe - the data to save
        * @param {string} key - the index in WebStorage to save into
        */
        saveDataToStore: function (saveMe, key)
        {
            console.log("saveToDataStore", saveMe, key);
            if (WebStorage.local)
            {
                if (!WebStorage.local[key])
                {
                    WebStorage.local[key] = [];
                }
                console.log("storing in localStorage");
                WebStorage.local[key] = this.join(saveMe, WebStorage.local[key]);
            }
            else
            {
                console.log("storing in Collection");

                saveMe.forEach(function (me)
                {
                    data.create(me, function () { });
                });
            }
        },
        
        getParameterByName: function(name, url) 
        {
            var regex, results;
            
            if (!url) 
            {
                url = window.location.href;
            }
            
            name = name.replace(/[\[\]]/g, "\\$&");
            regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
            results = regex.exec(url);
            
            if (!results) 
            {
                 return null;
            }
            if (!results[2]) 
            {
                return '';
            } 
            
            return decodeURIComponent(results[2].replace(/\+/g, " "));
        }
    }
};