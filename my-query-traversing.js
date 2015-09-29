(function(global)
{
    "use strict"

    var ANY = "*"

    Object.assign(myQuery,
    {
        first: function(parent, selector)
        {
            var first = parent.firstElementChild

            return first.matches(selector || ANY)
                && first
                || this.next(first, selector)
        },
        last: function(parent, selector)
        {
            var last = parent.lastElementChild

            return last.matches(selector || ANY)
                && last
                || this.prev(last, selector)
        },
        next: function(sibling, selector)
        {
            while (sibling = sibling.nextElementSibling)
                if (sibling.matches(selector || ANY))
                    return sibling

            return null
        },
        nextAll: function(sibling, selector)
        {
            var next = [ ]

            while (sibling = this.next(sibling, selector))
                next.push(sibling)

            return next
        },
        nextUntil: function(sibling, value)
        {
            var not = this.not(value)
            var next = [ ]

            while (sibling = this.next(sibling))
                if (not(sibling)) next.push(sibling)
                else break

            return next
        },
        prev: function(sibling, selector)
        {
            while (sibling = sibling.previousElementSibling)
                if (sibling.matches(selector || ANY))
                    return sibling

            return null
        },
        prevAll: function(sibling, selector)
        {
            var prev = [ ]

            while (sibling = this.prev(sibling, selector))
                prev.push(sibling)

            return prev
        },
        prevUntil: function(sibling, value)
        {
            var not = this.not(value)
            var prev = [ ]

            while (sibling = this.prev(sibling))
                if (not(sibling)) prev.push(sibling)
                else break

            return prev
        },
        parents: function(element, selector)
        {
            var parents = [ ]

            while (element = element.parentElement)
                if (element.matches(selector || ANY))
                    parents.push(element)

            return parents
        },
        parentsUntil: function(element, value)
        {
            var not = this.not(value)
            var parents = [ ]

            while (element = element.parentElement)
                if (not(element)) parents.push(element)
                else break

            return parents
        },
        siblings: function(sibling, selector)
        {
            var children = sibling
                .parentElement
                .children

            return [ ].filter.call(children, function(child)
            {
                return child != sibling
                    && child.matches(selector || ANY)
            })
        }
    })
})(this)