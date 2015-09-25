"use strict"

Object.assign($,
{
    on: function(emitter, types, handler)
    {
        types.split(/\s+/).forEach(function(type)
        {
            emitter.addEventListener(type, handler)
        })

        return emitter
    },
    one: function(emitter, type, handler)
    {
        function patched(event)
        {
            handler.call(this, event)
            emitter.removeEventListener(type, patched)
        }

        return emitter.addEventListener(type, patched)
            || emitter
    },
    off: function(emitter, types, handler)
    {
        if (arguments.length == 2)
        {
            ///
        }

        types.split(/\s+/).forEach(function(type)
        {
            emitter.removeEventListener(type, handler)
        })

        return emitter
    },
    live: function(ancestor, selector, types, handler)
    {
        if (arguments.length == 3)
        {
            handler = types
            types = selector

            selector = ancestor
            ancestor = document
        }

        return this.on(ancestor, types, function(event)
        {
            var target = event.target
            if (target.matches(selector))
                handler.call(target, event)
        })
    },
    die: function(ancestor, selector, types)
    {
        if (arguments.length == 2)
        {
            types = selector

            selector = ancestor
            ancestor = document
        }

        return this.off(ancestor, types)
    },
    handlers: function(element, type, alive)
    {
        ///
    },
    detach: function(element)
    {
        ///
    },
    event: function(type, properties)
    {
        switch (type)
        {
            ///
        }
    },
    trigger: function(element, event)
    {
        if (typeof event == "string")
            return this.trigger(element, this.event(event))

        return element.dispatchEvent(event) + ""
            && element
    }
})