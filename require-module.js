(function(global)
{
    "use strict"

    var hash = { }
    var path = function()
    {
        var source = document.currentScript.src
            .replace(/\.js$/, "")
            .replace(/(%20)+/g, "-")
            .replace(/[._-]+/g, "-")
            .toLowerCase()

        var anchor = document.createElement("a")
            anchor.href = source

        return anchor.pathname
    }

    var document = global.document
    var basename = path()

    global.module =
    {
        set exports(value)
        {
            var key = path()
            if (key in hash) return

            hash[key] = value
        }
    }

    global.require = function(pathname)
    {
        if (pathname.charAt(0) == "/")
            return hash[pathname]

        var base = basename.split("/")
            base.pop()

        var path = pathname.split("/")
            path.forEach(function(fragment)
            {
                switch (fragment)
                {
                    case ".": return
                    case "..": return base.pop()

                    default: base.push(fragment)
                }
            })

        return hash[base.join("/")]
    }
})(this)