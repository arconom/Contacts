/**
 * Execute the tutorial, which is simply an overlay to darken the screen and 
 * some alerts and highlighting to tell the users how to use the controls.
 * @returns {undefined}
 * 
 * todo: there are some commented lines about overlay.  
 * Depending on compatibility and other unknown factors, 
 * we may decide to use a framework 
 * rather than doing the masking and highlighting manually.  
 * jQuery Tools seems to break PF, so we can't use that until something changes.
 * 
 * To use, instantiate Tutorial, then supply scope and list,
 * then call Start, NotifyOnce, or Notify
 * var tutorial = Tutorial.getInstance();
 * tutorial.scope = selector;
 * tutorial.list = [{selector: "", description: "", before: f(), after: f()}];
 * tutorial.start();
 */
function Tutorial(scope, list) {
    var instance;

    function init(scope, list) {
        setupTutorialButton(".navbar .collapse .nav li:nth-child(3)");

        function setupTutorialButton(scope) {
            console.log("setupTutorialButton", scope);
            
            $(scope).children("ul").append("<li id=\"liTutorial\"><a onclick=\"showTutorial();\">How to Use This Page</a></li>");
        }

        /**
         * Build a Promise chain that does the following for each item in the list:
         * 1. Expose the selected elements
         * 2. Execute the before() handler
         * 3. Display the description
         * 4. Execute the after() handler
         * 
         * @param {object} x = [{selector: "", description: "", before: f(), after: f()}]
         */
        //todo figure out a better method of catching errors
        function explain(list) {
            $(".overlay").show();
            var continueFlag = true;

            list.reduce(function (sequence, x) {
                // Add these actions to the end of the sequence
                return sequence.then(function () {
                    return new Promise(function (resolve, reject) {
                        try {

                            Promise.resolve().then(function () {
                                return new Promise(function (resolve, reject) {
                                    if (x.before) {
                                        x.before();
                                    }
                                    resolve();
                                });
                            }).catch(function (e) {
                                console.log(e);
                                clearOverlay();
                            }).then(function () {
                                return new Promise(function (resolve, reject) {
                                    $(".expose").removeClass("expose");
                                    $(x.selector).first().addClass("expose");
                                    scrollToCenter(x.selector, function () {
                                        continueFlag = confirm(x.description);
                                        resolve();
                                    });
                                });
                            }).catch(function (e) {
                                console.log(e);
                                clearOverlay();
                            }).then(function () {
                                return new Promise(function (resolve, reject) {
                                    if (x.after) {
                                        x.after();
                                    }
                                    resolve();
                                });
                            }).catch(function (e) {
                                console.log(e);
                                clearOverlay();
                            }).then(function () {
                                if (continueFlag) {
                                    resolve();
                                } else {
                                    clearOverlay();
                                }
                            });
                        } catch (e) {
                            console.log(e);
                            throw e;
                        }
                    });
                });
            }, Promise.resolve()).then(function (resolve, reject) {
                clearOverlay();
                resolve();
            });

            function clearOverlay() {
                $(".overlay").hide();
                $(".expose").removeClass("expose");
            }
        }

        /**
         * Scroll the element targeted by the selector to the center of the view height
         * @param {type} selector - a string that targets a HTML element
         * @param {type} callback - some logic to run after scrolling is complete
         * @returns {Boolean} - I don't know why this is here
         */
        function scrollToCenter(selector, callback) {
            //console.log("scrollToCenter", selector);
            var target = $(selector)
                    , targetOffset = target.offset().top
                    , targetHeight = target.height()
                    , windowHeight = $(window).height()
                    , offset;

            if (targetHeight < windowHeight) {
                offset = targetOffset - ((windowHeight / 2) - (targetHeight / 2));
            } else {
                offset = targetOffset;
            }

            $('html').animate({scrollTop: offset}, 700, function () {
                callback();
            });
            return false;
        }

        return {
            scope: scope
            , list: list
            , start: function () {
                if ($("#tutorialOverlay").length === 0) {
                    var $overlay = $("<div>", {id: "tutorialOverlay", "class": "overlay"});
                    $(this.scope).append($overlay);
                }

                explain(this.list);
            }
            , notifyOnce: function () {
                if (document.cookie.replace(/(?:(?:^|.*;\s*)tutorialFlag\s*\=\s*([^;]*).*$)|^.*$/, "$1") !== "true") {
                    this.notify();
                }
                document.cookie = "tutorialFlag=true";
            }
            , notify: function () {
                if (confirm("Do you want to view the tutorial?  It can also be accessed via the Help menu.")) {
                    this.start();
                }
            }

        };
    }

    return {
        getInstance: function ()
        {
            if (!instance)
            {
                instance = init(scope, list);
            }
            return instance;
        }
    };
}
