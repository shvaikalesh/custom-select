(function(global)
{
    "use strict"

    var DOCUMENT = global.document

    var $ = Object.assign(function(value)
    {
        if (typeof value == "function")
            return DOCUMENT.addEventListener("DOMContentLoaded", value)

        return /<(.+)>/.test(value)
            && DOCUMENT.createElement(value.slice(1, -1))
            || DOCUMENT.querySelector(value)
    },
    {
        all: function(selector)
        {
            return Array.from(
                DOCUMENT.querySelectorAll(selector)
            )
        },
        type: function(value)
        {
            return { }.toString.call(value)
                .match(/\[object (.+)\]/)
                .pop()
                .toLowerCase()
        },
        each: function(object, callback)
        {
            [ ].some.call(object, function(/* ...arguments */)
            {
                return $ === callback.apply(object, arguments)
            })

            return object
        },
        proxy: function(object, name)
        {
            var method = object[name]

            return function(/* ...arguments */)
            {
                return method.apply(object, arguments)
            }
        }
    })

    Object.keys($).forEach(function(key)
    {
        Object.defineProperty($, key,
        {
            enumerable: false
        })
    })

    global.$ = $
    global.$$ = $.all

    global.myQuery = $
})(this)