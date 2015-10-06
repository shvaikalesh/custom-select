// setImmediate || (setImmediate = setTimeout)

(function() 
{
    'use strict'

    module.exports = function(selects, settings)
    {
        Object.assign(settings || { },
        {
            namespace: 'hc',
            control: 'select',
            separator: '-',
            invalid: 'label',
            template: function($option)
            {
                return $option.textContent
            }
        })

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

            var element = document.createElement(tag)
                element.className = CLASSES[name.toUpperCase()]

            return element
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
            $list.classList.add(CLASSES.CLOSED)
            $list.classList.remove(CLASSES.OPENED)

            return $list
        }

        function show($list)
        {
            $list.classList.remove(CLASSES.CLOSED)
            $list.classList.add(CLASSES.OPENED)

            return $list
        }

        var openedMap = new WeakMap(/* <document, div> */)
        var optionMap = new WeakMap(/* <item, option> */)
        var itemMap = new WeakMap(/* <option, item> */)

        selects.forEach(function($select)
        {

            function append(/* arguments... */) 
            {
                var $element = create.apply(this, arguments)

                return $wrapper.appendChild($element)
            }

            var $wrapper = create('wrapper')
            var $before = append('before')
            var $current = append('current')
            var $after = append('after')
            var $list = hide(append('ul', 'list'))
            var $hover

            var validOptionsArray = []

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
                        {
                            setCurrent($item)
                            $hover = $item
                        }

                        if (!$element.disabled &&
                            !$element.parentElement.disabled)
                            validOptionsArray.push($item)

                        optionMap.set($item, $element)

                        break

                    case 'optgroup':
                        var $label = create('h3', 'label')
                            $label.textContent = $element.label

                        $item.classList.add(CLASSES.GROUP)
                        $item.append($label)

                        adopt($element, $item, build)
                }

                if ($element.disabled)
                    $item.classList.add(CLASSES.DISABLED)

                return $item
            }

            adopt($select, $list, build)

            // Transfer select siblings.
            $wrapper.append(after($select, settings.INVALID))

            // Hidden input block.
            var $search = append('input', 'search')
                $search.type = 'search'

            // Assign handlers.
            // Open/close $wrapper.
            function toggleSelect(event)
            {
                var $document = event.target.ownerDocument

                if (openedMap.has($document)) {
                    var $opened = openedMap.get($document)
                    if ($opened != $list) hide($opened)
                }

                if (isHidden($list)) show($list)
                else hide($list)

                setTimeout(function() // setImmediate
                {
                    openedMap.set($document, $list)
                })
            }

            

            function isHidden($list)
            {
                return $list.classList.contains(CLASSES.CLOSED)
            }

            // Detect $list events.
            // Helper - Filter unwanted <li>.

            function setCurrent($item)
            {
                $current.innerHTML = $item.innerHTML

                if (optionMap.has($item)) 
                {
                    $select.value = optionMap.get($item).value
                    hide($list)
                }
            }

            function wanted($target)
            {
                var $parent = $target.parentElement
                
                if ($parent && $parent.classList.contains(CLASSES.DISABLED))
                    return false

                return !$target.classList.contains(CLASSES.DISABLED)
            }

            on($list, 'click', function(event) 
            {
                var $target = event.target
                if ($target.matches(CLASSES.OPTION)) setCurrent($target)
                else $search.focus()
            })

            on($list, 'mouseover', function(event)
            {
                var $target = event.target
                
                if ($target == $list || $target == $hover) return
                if (wanted($target)) 
                {
                    $hover.classList.remove(CLASSES.HOVER)
                    $target.classList.add(CLASSES.HOVER)
                    $hover = $target
                }
            })

            on($list, 'mouseout', function(event)
            {
                var $target = event.target
                    $target.classList.remove(CLASSES.HOVER)
            })

            // Focus on click.
            on($current, 'click', function(event)
            {
                toggleSelect(event)
                $search.focus()
            })

            // Handle select focus/blur.
            on($search, 'focus', function(event) {
                $current.classList.toggle(CLASSES.FOCUS)
                validOptionsArray[$select.selectedIndex].classList.add(CLASSES.HOVER);
            })

            on($search, 'blur', function(event)
            {
                var selected = $list.query('.'+CLASSES.HOVER)
                if (selected)
                    selected.classList.remove(CLASSES.HOVER)
                $current.classList.toggle(CLASSES.FOCUS)
            })

            // Handle keyboard.
            on($wrapper, 'keydown', function(event)
            {
                // Highlight next valid sibling.
                function highlightNext($element) {
                    var highlighted = $element.query('.'+CLASSES.HOVER)
                    var next

                    if ($element.contains(highlighted)) {
                        next = getNextValidLi(highlighted)
                        if (next) {
                            highlighted.classList.toggle(CLASSES.HOVER)
                            next.classList.toggle(CLASSES.HOVER)
                        }
                        else return
                    }
                    else {
                        next = getNextValidLi($element)
                        if (next)
                            next.classList.toggle(CLASSES.HOVER)
                    }

                }

                // Helper for highlightNext().
                function getNextValidLi(current) {
                    var next = current.firstElementChild ||
                               current.nextElementSibling ||
                               current.parentElement.nextElementSibling
                    if (next == $select) return

                    if (next && (next.dataset.hasOwnProperty('disabled') || 
                        next.parentElement.dataset.hasOwnProperty('disabled') ||
                        next.tagName != 'LI' || 
                        next.classList.contains(CLASSES.GROUP))) 
                    {
                            next = getNextValidLi(next)
                    }
                    return next
                }

                // Highlight prev valid sibling.
                function highlightPrev($element) {
                    var highlighted = $element.query('.'+CLASSES.HOVER)
                    var prev

                    if ($element.contains(highlighted)) {
                        prev = getPrevValidLi(highlighted)
                        if (prev) {
                            highlighted.classList.remove(CLASSES.HOVER)
                            prev.classList.add(CLASSES.HOVER)
                        }
                        else return
                    }
                    else {
                        prev = getPrevValidLi($element)
                        if (prev)
                            prev.classList.toggle(CLASSES.HOVER)
                    }
                }

                // Helper for highlightPrev().
                function getPrevValidLi(current) {
                    if (current == current.parentElement.firstElementChild &&
                        current.parentElement == $list) return

                    var prev = current.lastElementChild ||
                               current.previousElementSibling ||
                               current.parentElement.previousElementSibling

                    if (prev && (prev.dataset.hasOwnProperty('disabled') || 
                        prev.parentElement.dataset.hasOwnProperty('disabled') ||
                        prev.tagName != 'LI' ||
                        prev.classList.contains(CLASSES.group))) 
                    {
                            prev = getPrevValidLi(prev)
                    }
                    return prev
                }

                function updateHC() {
                    var h = $list.query('.'+CLASSES.HOVER)
                    $current.textContent = h.textContent
                    $select.selectedIndex = validOptionsArray.indexOf(h)                    
                }

                var openedSelect
                if (openedSelect = $wrapper.query('.'+CLASSES.FOCUS)) 
                {
                    switch(event.which) 
                    {
                        case 9: // Tab
                            hide(openedSelect.parentElement.query('.'+CLASSES.LIST))
                            updateHC()

                            break

                        case 13: // Enter
                            var highlighted = $list.query('.'+CLASSES.HOVER)
                            if (highlighted) 
                            {
                                $select.selectedIndex = validOptionsArray.indexOf(highlighted)
                                $current.textContent = highlighted.textContent
                            }
                            toggleSelect(event)

                            break

                        case 27: // Esc
                            if (currentOpenedHCSelect)
                            {
                                $('.'+CLASSES.HOVER).classList.remove(CLASSES.HOVER)
                                toggleSelect(event)
                            }

                            break

                        case 38: // UpArrow
                        case 37: // LeftArrow
                            highlightPrev($list)
                            updateHC()

                            break

                        case 39: // RightArrow
                        case 40: // DownArrow
                            highlightNext($list)
                            updateHC()

                            break
                    }
                }
            })

            // OBSERVE MUTATIONS
            var allOpts, allHCOpts
            updateOptLists()

            function updateOptLists() {
                // allOpts = $$('option,optgroup'), 
                // allHCOpts = $$('.'+CLASSES.LIST+' li')
            }

            // Attach MutationObservers.
            var config =
            {
                attributes: true,
                childList: true,
                characterData: true,
                subtree: true
            }

            var observer = new MutationObserver(function(mutations)
            {
                // TODO
                mutations.forEach(function(mutation) 
                {
                    switch(mutation.type) 
                    {
                        case 'childList':
                            if (mutation.removedNodes.length>0) {
                                console.log('Removed:',mutation.removedNodes);
                                [].forEach.call(mutation.removedNodes, function(node) 
                                {
                                    if (node.nodeType==1) {
                                        var index = allOpts.indexOf(node)
                                        allHCOpts[index].remove()
                                    }
                                })
                            }
                            else if (mutation.addedNodes.length>0)
                            {
                                console.log('Added:', mutation);
                                var previousSibling = mutation.previousSibling
                                var position = (previousSibling.nodeType==3) ?
                                                previousSibling.previousElementSibling :
                                                previousSibling
                                var HCposition

                                if (position) 
                                {
                                    var index = allOpts.indexOf(position)
                                    HCposition = allHCOpts[index]
                                } 
                                else 
                                    position = $list;

                                [].forEach.call(mutation.addedNodes, function(node)
                                {
                                    var newNode = build(node)

                                    if (HCposition) 
                                        HCposition.after(newNode)
                                    else
                                    {
                                        position.append(newNode)
                                        $current.textContent = validOptionsArray[0].textContent
                                    }
                                })
                            }
                            updateOptLists()
                            break
                    }
                    
                })
            })

            observer.observe($select, config)
        })


        
        // Add document click handlers
        selects
        .map(function($select)
        {
            return $select.ownerDocument
        })
        .filter(unique)
        .forEach(function($document)
        {
            on($document, 'click', hideOpened)
        })

        function hideOpened(event)
        {
            var $document = event.target.ownerDocument
            if (openedMap.has($document)) 
                {
                    hide(openedMap.get($document))
                    openedMap.delete($document)
                }
        }

    }



    function on($emitter, type, handler)
    {
        return $emitter.addEventListener(type, handler)
            || $emitter
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
                $fragment.append($sibling)

        return $fragment
    }

    function unique(element, index, array)
    {
        return array.indexOf(element) == index
    }
})()