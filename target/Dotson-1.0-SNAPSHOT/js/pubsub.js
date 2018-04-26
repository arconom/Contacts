var PubSub = (function ()
{
    var queue = [];
    var that = {};

    /*
    I invoke the callbacks that subscribed to the given eventname
    eventName is the event whose callbacks we want to run
    data is whatever object will be sent into the callback for processing
    */
    that.publishAsync = function (eventName, data)
    {
        var context, intervalId, idx = 0;
        if (queue[eventName])
        {
            // I use setInterval here so the callbacks are executed async
            // that way you have no idea when they finish
            intervalId = setInterval(function ()
            {
                if (queue[eventName][idx])
                {
                    context = queue[eventName][idx].context || this;
                    queue[eventName][idx].callback.call(context, data);
                    idx += 1;
                }
                else
                {
                    clearInterval(intervalId);
                }
            }, 0);
        }
    };

    that.publish = function (/* String */eventName, /* Array? */data)
    {
        var context, intervalId, idx = 0;

        if (queue[eventName])
        {
            if (queue[eventName][idx])
            {
                context = queue[eventName][idx].context || this;
                queue[eventName][idx].callback.call(context, data);
                idx += 1;
            }
            else
            {
                clearInterval(intervalId);
            }
        }

        //try
        //{
        //    d.each(cache[eventName], function ()
        //    {
        //        this.apply(d, data || []);
        //    });
        //} catch (err)
        //{
        //    // handle this error
        //    console.log(err);
        //}
    };

    /*
    I allow objects to subscribe to an event identified by a string
    eventName is a string that identifies the event
    callback is a function to call when the event is published
    context is the context that executes the callback
    */
    that.subscribe = function (eventName, callback, context)
    {
        if (!queue[eventName])
        {
            queue[eventName] = [];
        }
        queue[eventName].push({ callback: callback, context: context });
    };

    /*
    I allow objects to unsubscribe from the given event
    eventName is the event from which to unsubscribe
    callback is the callback to remove from the subscription
    context is the context to remove from the subscription
    */
    that.unsubscribe = function (eventName, callback, context)
    {
        if (queue[eventName])
        {
            for (i = 0; i

< queue[eventName].length; i++)
            {
                if ((queue[eventName][i].callback === callback) && (queue[eventName][i].context === context))
                {
                    queue[eventName].splice(i);
                }
            }
        }
    };
    return that;
})();