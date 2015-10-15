// Polyfill for scrollIntoViewIfNeeded
// from https://gist.github.com/hsablonniere/2581101
if (!Element.prototype.scrollIntoViewIfNeeded) {
  Element.prototype.scrollIntoViewIfNeeded = function (centerIfNeeded) {
    centerIfNeeded = arguments.length === 0 ? true : !!centerIfNeeded;

    var parent = this.parentNode,
        parentComputedStyle = window.getComputedStyle(parent, null),
        parentBorderTopWidth = parseInt(parentComputedStyle.getPropertyValue('border-top-width')),
        parentBorderLeftWidth = parseInt(parentComputedStyle.getPropertyValue('border-left-width')),
        overTop = this.offsetTop - parent.offsetTop < parent.scrollTop,
        overBottom = (this.offsetTop - parent.offsetTop + this.clientHeight - parentBorderTopWidth) > (parent.scrollTop + parent.clientHeight),
        overLeft = this.offsetLeft - parent.offsetLeft < parent.scrollLeft,
        overRight = (this.offsetLeft - parent.offsetLeft + this.clientWidth - parentBorderLeftWidth) > (parent.scrollLeft + parent.clientWidth),
        alignWithTop = overTop && !overBottom;

    if ((overTop || overBottom) && centerIfNeeded) {
      parent.scrollTop = this.offsetTop - parent.offsetTop - parent.clientHeight / 2 - parentBorderTopWidth + this.clientHeight / 2;
    }

    if ((overLeft || overRight) && centerIfNeeded) {
      parent.scrollLeft = this.offsetLeft - parent.offsetLeft - parent.clientWidth / 2 - parentBorderLeftWidth + this.clientWidth / 2;
    }

    if ((overTop || overBottom || overLeft || overRight) && !centerIfNeeded) {
      this.scrollIntoView(alignWithTop);
    }
  };
}

// Polyfill for startsWith
if (!String.prototype.startsWith)
{
    String.prototype.startsWith = function(searchString, position)
    {
        position = position || 0
        return this.indexOf(searchString, position) == position
    }
}





if (typeof setImmediate == 'undefined')
    setImmediate = setTimeout

!(function() 
{
    'use strict'

    var openedMap = new WeakMap(/* <document, div> */)
    var selectSet = new WeakSet(/* <select>s */)
    var documentSet = new WeakSet(/* <document>s */)

    var tempFragment = new DocumentFragment()
    var tempOptMap = new WeakMap()

    module.exports = function($select, settings)
    {
        if (selectSet.has($select))
            return
        selectSet.add($select)

        var optionMap = new WeakMap(/* <item, option> */)
        var itemMap = new WeakMap(/* <option, item> */)
        var optgroupMap = new WeakMap(/* <optgroup, item> */)
        var $options = $select.options

        var settings = Object.assign(
        {
            namespace: 'hc',
            control: 'select',
            separator: '-',
            invalid: 'label',
            template: function($option)
            {
                return $option.textContent
            },
            viewportHandling: true,
            inputDelay: 1000
        }, settings || { })

        var CLASSES =
        [
            , 'focus'
            , 'hover'
            , 'option'
            , 'group'
            , 'label'
            , 'disabled'
            , 'closed'
            , 'opened'
            , 'up'

            , 'wrapper'
            , 'before'
            , 'current'
            , 'after'
            , 'list'
            , 'search'
        ]
        .reduce(function(object, name)
        {
            object[name.toUpperCase()] = makeName(name)

            return object
        },  { })

        function create(tag, name) 
        {
            if (arguments.length == 1)
            {
                name = tag
                tag = 'div'
            }

            var $element = document.createElement(tag)
                $element.className = CLASSES[name.toUpperCase()]

            return $element
        }

        function makeName(name)
        {
            return Array,
            [
                , settings.namespace
                , settings.control
                , name
            ]
            .filter(String)
            .join(settings.separator)
        }

        function hide($list) 
        {
            if ($list == null) return

            $list.classList.add(CLASSES.CLOSED)
            $list.classList.remove(CLASSES.OPENED)

            return $list
        }

        function show($list)
        {
            if ($list == null) return

            $list.classList.remove(CLASSES.CLOSED)
            $list.classList.add(CLASSES.OPENED)

            return $list
        }

        function append(/* arguments... */) 
        {
            var $element = create.apply(this, arguments)

            return $wrapper.appendChild($element)
        }

        function highlight($element)
        {
            if ($element == null) return

            $hover.classList.remove(CLASSES.HOVER)
            $hover = $element
            $hover.classList.add(CLASSES.HOVER)
        }

        function preventClick()
        {
            openedMap.delete($document)
            setImmediate(function()
            {
                openedMap.set($document, $list)
            })
        }

        function updateWeakMaps($node, $item)
        {
            if ($node.matches('option'))
            {
                itemMap.set($node, $item)
                optionMap.set($item, $node)
            }
            else if ($node.matches('optgroup'))
                optgroupMap.set($node, $item)
        }

        function updateSelected()
        {
            var index = $select.selectedIndex
            if (index > -1)
            {
                var $item = itemMap.get($options[$select.selectedIndex])
                setCurrent($item)
            }
            else
                $current.innerHTML = ''
        }





        var $wrapper = create('wrapper')
        append('before')
        var $current = append('current')
        append('after')
        var $list = hide(append('ul', 'list'))
        var $hover

        $select.before($wrapper)
        $select.tabIndex = -1

        function build($element)
        {
            var $document = $element.ownerDocument

            var $item = $document.createElement('li')
                $item.className = $element.className

            switch ($element.tagName.toLowerCase())
            {
                case 'option':
                    $item.innerHTML = settings.template($element)
                    $item.classList.add(CLASSES.OPTION)

                    if ($element.selected)
                        setCurrent($item)

                    break

                case 'optgroup':
                    var $label = create('h3', 'label')
                        $label.textContent = $element.label

                    $item.classList.add(CLASSES.GROUP)
                    $item.append($label)

                    adopt($element, $item, build)
            }

            updateWeakMaps($element, $item)

            if ($element.disabled)
                $item.classList.add(CLASSES.DISABLED)

            return $item
        }

        adopt($select, $list, build)

        // Transfer select siblings.
        $wrapper.append(after($select, settings.invalid))
        $list.after($select)

        // Hidden input block.
        var $search = append('input', 'search')
            $search.type = 'search'

        // Assign handlers.
        // Open/close $list.
        function toggleSelect($target)
        {
            var $document = $target.ownerDocument

            if (openedMap.has($document)) 
            {
                var $opened = openedMap.get($document)
                if ($opened != $list) hide($opened)
            }

            if (isHidden($list))
            {
                var $option = $select.selectedOptions[0]

                highlight(itemMap.get($option))
                show($list)

                // Viewport handling
                if (settings.viewportHandling)
                {
                    var size = $list.getBoundingClientRect()
                    var height = $document.documentElement.clientHeight
                    var bottom = size.bottom

                    if ($list.classList.contains(CLASSES.UP))
                        bottom += size.height

                    if (bottom > height && size.height < size.top) 
                        $list.classList.add(CLASSES.UP)
                    else
                        $list.classList.remove(CLASSES.UP)
                }
                
            } 
            else hide($list)
            preventClick()
        }

        function isHidden($list)
        {
            return $list.classList.contains(CLASSES.CLOSED)
        }

        // Set selected item as current.
        function setCurrent($item)
        {
            $current.innerHTML = $item.innerHTML
            $hover = $item

            if (optionMap.has($item)) 
            {   
                // To handle possible equal option values
                var $opts = [].slice.call($options)
                $select.selectedIndex = $opts.indexOf(optionMap.get($item))
                hide($list)
            }   
        }

        // Check if target is valid
        function valid($target)
        {
            if (!$target.matches('li')) return

            var $parent = $target.parentElement
            if ($parent.classList.contains(CLASSES.DISABLED))
                return

            return !$target.classList.contains(CLASSES.DISABLED)
        }

        // Handle events
        on($list, 'click', function(event) 
        {
            var $target = event.target
            if (valid($target)) setCurrent($target)
            else 
            {
                preventClick()
                $search.focus()
            }
        })

        on($list, 'mouseover', function(event)
        {
            var $target = event.target

            if ($target == $list) return
            if (valid($target)) 
                highlight($target)
        })

        on($list, 'mouseout', function(event)
        {   
            var $target = event.target
            if ($target != $hover) 
                $target.classList.remove(CLASSES.HOVER)
        })

        function normalizeScroll(event) 
        {
            var delta = event.wheelDelta || (event.detail * -40)
            if (delta) 
            {
                if ((!this.scrollTop && delta > 0) ||
                    ( this.scrollTop + this.offsetHeight >= this.scrollHeight && delta < 0))
                    event.preventDefault();
            }
        }

        on($list, 'DOMMouseScroll wheel', normalizeScroll)
        // on($list, 'wheel', normalizeScroll)

        // Focus on click.
        on($current, 'click', function(event)
        {
            if (enabled($select))
            {
                toggleSelect(event.target)
                $search.focus()
            }
        })

        // Handle select focus/blur.
        on($search, 'focus', function(event) {
            $current.classList.add(CLASSES.FOCUS)
        })

        on($search, 'blur', function(event)
        {
            $current.classList.remove(CLASSES.FOCUS)
        })

        // This event should be dispatched by third-party
        // code on $select to reflect direct changes of selectedIndex
        on ($select, 'selectedIndexChanged', function() {
            updateSelected()
        })


        // Highlight next valid sibling.
        function highlightNext() {
            var $option = optionMap.get($hover)
            var index = [].indexOf.call($options, $option) + 1
            
            for (var $next; $next = $options[index]; index++)
            {
                if (enabled($options[index]))
                    break
            }

            highlight(itemMap.get($next))
        }

        // Highlight prev valid sibling.
        function highlightPrev() {
            var $option = optionMap.get($hover)
            var index = [].indexOf.call($options, $option) - 1

            for (var $previous; $previous = $options[index]; index--)
            {
                if (enabled($options[index]))
                    break
            }

            highlight(itemMap.get($previous))
        }

        // Handle keyboard.
        on($wrapper, 'keydown', function(event)
        {
            

            var $target = event.target
            switch(event.which) 
                {
                    case 9: // Tab
                        hide($list)
                        break

                    case 13: // Enter
                    case 32: // Space
                        event.preventDefault()
                        if (!isHidden($list)) setCurrent($hover)
                        else toggleSelect($target)
                        break

                    case 27: // Esc
                        if (!isHidden($list))
                            toggleSelect($target)
                        break

                    case 38: // Up Arrow
                    case 37: // Left Arrow
                        highlightPrev()
                        break

                    case 39: // Right Arrow
                    case 40: // Down Arrow
                        highlightNext()
                        break
                }
        })

        // Handle search.
        var timeout
        on($search, 'input', function(event)
        {
            if (timeout) clearTimeout(timeout)

            var searchString = $search.value

            timeout = setTimeout(function() 
            {
                $search.value = ''
            },
            settings.inputDelay)

            var $item = [].find.call($options, function($option)
            {
                return enabled($option)
                    && $option.textContent.startsWith(searchString)
            })

            $item = itemMap.get($item)

            if ($item)
            {
                highlight($item)
                $item.scrollIntoViewIfNeeded()
            }
            
        })
        
        // Add document click handlers
        var $document = $select.ownerDocument
        if (!documentSet.has($document))
        {
            documentSet.add($document)
            on($document, 'click', hideOpened)
        }

        function hideOpened(event)
        {
            var $document = event.target.ownerDocument
            hide(openedMap.get($document))
        }




        // OBSERVE MUTATIONS
        var config =
        {
            attributes: true,
            childList: true,
            characterData: true,
            subtree: true
        }

        var observer = new MutationObserver(function(mutations)
        {

            function toggle($element)
            {
                if ($element == $wrapper)
                    hide($list)

                $element.classList.toggle(CLASSES.DISABLED)
            }

            function getTarget($element)
            {
                if ($element.nodeType != 1) return

                var $target
                switch($element.tagName.toLowerCase())
                {
                    case 'select':
                        $target = $wrapper
                        break
                    case 'option':
                        $target = itemMap.get($element)
                        break
                    case 'optgroup':
                        $target = optgroupMap.get($element)
                        break
                }

                return $target
            }

            function setAttribute($element, attribute)
            {
                if ($element.nodeType != 1) return

                var $target = getTarget($element)

                if (attribute == 'disabled') 
                {
                    toggle($target)
                    return
                }
                else if (attribute == 'label')
                {
                    if ($element.matches('optgroup'))
                        updateLabel($element, $target)
                }
                else
                {
                    var value = $element.getAttribute(attribute)
                    $target.setAttribute(attribute, value)
                }
            }

            function updateData($element)
            {
                var $target = getTarget($element)
                $target.textContent = $element.textContent
            }

            function updateLabel($element, $target)
            {
                $target.firstElementChild.textContent = $element.label
            }

            function isCustom($node)
            {
                return itemMap.has($node) || optgroupMap.has($node)
            }

            function addNode($node)
            {
                var $item = tempOptMap.get($node) || build($node)
                if ($item)
                {
                    var $sibling

                    if ($sibling = $node.previousElementSibling)
                    {
                        if (isCustom($sibling))
                            getTarget($sibling).after($item)
                        else
                        {
                            var $parent = $node.parentElement.matches('optgroup') ? $node.parentElement : $list
                            if ($node.nextElementSibling)
                                getTarget($node.nextElementSibling).before($item)
                            else
                                $parent.prepend($item)
                        }
                    }
                    else if ($sibling = $node.nextElementSibling)
                    {
                        if (isCustom($sibling))
                            getTarget($sibling).before($item)
                        else
                        {
                            $node.parentElement.matches('optgroup') ? getTarget($node.parentElement).append($item) : $list.prepend($item)
                        }
                    }
                    else
                    {
                        if ($node.parentElement == $select)
                            $list.append($item)
                        else
                            optgroupMap.get($node.parentElement).append($item)
                    }

                    updateWeakMaps($node, $item)
                }
            }

            // TODO
            // console.log(mutations)

            mutations.forEach(function(mutation, index) 
            {
                var $target = mutation.target
                switch(mutation.type) 
                {
                    case 'childList':
                        if (mutation.removedNodes.length) 
                        {
                            [].forEach.call(mutation.removedNodes, function($node)
                            {
                                var $item = getTarget($node)
                                if ($item) 
                                {
                                    tempFragment.appendChild($item)
                                    tempOptMap.set($node, $item)
                                }
                            })


                            // Do I need it? Or garbage collector is ok?
                            // setTimeout(function()
                            // {
                            //     tempFragment = new DocumentFragment()
                            //     tempOptMap = new WeakMap()
                            //     console.log('clear')
                            // }, 5000)
                        }
                        if (mutation.addedNodes.length)
                        {
                            [].forEach.call(mutation.addedNodes, addNode)
                        }
                        break
                    case 'attributes':
                        setAttribute($target, mutation.attributeName)
                        break
                    case 'characterData':
                        if ($target.nodeType == 3)
                            updateData($target.parentElement)
                        break
                }
            })
            updateSelected()
        })

        observer.observe($select, config)
    }

    function on($emitter, types, handler)
    {
        var events = types.split(' ')
        events.forEach(function(event)
        {
            $emitter.addEventListener(event, handler)
        })
        return $emitter
    }

    function adopt(from, to, map)
    {   
        if (arguments.length == 2)
            return to.append.apply(to, from.children)

        var children = [ ].map.call(from.children, map)

        return to.append.apply(to, children)
            || to
    }

    function after($sibling, selector)
    {
        var $fragment = new DocumentFragment()

        while ($sibling = $sibling.nextElementSibling)
            if ($sibling.matches(selector))
                $fragment.appendChild($sibling)

        return $fragment
    }

    function unique(element, index, array)
    {
        return array.indexOf(element) == index
    }

    function enabled($element)
    {
        return !$element.closest('[disabled]')
    }
})()