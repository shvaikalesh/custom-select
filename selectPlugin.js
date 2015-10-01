// DocumentFragment.prototype.append = Element.prototype.append

(function() 
{
    "use strict"
    // Helpers.
    function hide($element) 
    {
        return $element.style.setProperty('display', 'none')
            || $element
    }

    function show($element)
    {
        return $element.style.removeProperty('display')
            || $element
    }

    function transfer(from, to, map)
    {   
        if (arguments.length == 2)
            return to.append.apply(to, from.children)
        
        var children = [].map.call(from.children, map)
        return to.append.apply(to, children)
    }

    function next($element, selector)
    {
        var $fragment = new DocumentFragment
        var $sibling

        while ($sibling = $element.nextElementSibling) 
        {
            if (!$sibling.matches(selector)) break

            $fragment.append($sibling)
        }

        return $fragment
    }

    module.exports = function(selectList, options)
    {
        Object.assign(options || {},
        {
            NAMESPACE: 'hc',
            CONTROL: 'select',
            SEPARATOR: '-',
            INVALID: 'label'
        })

        var CLASSES = 
        {
            HIGHLIGHTED:  makeName('highlighted'),
            FOCUSED:      makeName('focused'),
            GROUP:        makeName('group'),
            LABEL:        makeName('label'),
        }

        function create(tag, name) 
        {
            if (arguments.length == 1)
            {
                name = tag
                tag = 'div'
            }

            var element = document.createElement(tag)
                element.className = makeName(name)

            return element
        }

        function makeName(name) 
        {
            return Array,
            [
                , options.NAMESPACE
                , options.CONTROL
                , name
            ]
            .filter(String)
            .join(options.SEPARATOR)
        }

        // Var to store current opened $wrapper.
        var currentOpenedHCSelect

        // Replace <select> with custom structure.
        function replaceSelectElement($select) 
        {
            var customOptionsArray = []

            /*
             *  CUSTOM SELECT.
             */
            var $wrapper = create('wrapper')
            $select.before($wrapper)
            // select.tabIndex = -1

            // Blocks.
            function append() 
            {
                return $wrapper.appendChild(create.apply(this, arguments))
            }

            var $before = append('before')

            var $current = append('current')

            if ($select.options.length>0)
                $current.textContent = $select.options[$select.selectedIndex]
                                                    .textContent

            var $after = append('after')

            var $list = hide(append('ul', 'list'))

            // Transfer select children.
            function build(node)
            {
                var item = $('<li>')
                if (node.disabled) item.dataset.disabled = ''

                switch (node.tagName.toLowerCase())
                {
                    case 'option':
                        item.textContent = node.textContent
                        customOptionsArray.push(item)
                        break

                    case 'optgroup':
                        var label = create('label')
                            label.textContent = node.label

                        item.classList.add(CLASSES.GROUP)
                        item.append(label)
                        transfer(node, item, build)
                        break
                }
                return item
            }
            
            transfer($select, $list, build);

            // Transfer select siblings.
            $wrapper.append(next($select, options.INVALID))

            // Hidden input block.
            var $search = append('input', 'search')
                $search.type = 'search'

            // Save CLASSES.
            var _CLASSES = Object.assign(Object.create(CLASSES),
            {
                WRAPPER: $wrapper.className,
                BEFORE: $before.className,
                CURRENT: $current.className,
                AFTER: $after.className,
                LIST: $list.className,
                SEARCH: $search.className
            })

            // Assign handlers.
            // Open/close $wrapper.
            function toggleSelect() 
            {
                if (currentOpenedHCSelect && currentOpenedHCSelect != $list)
                    hide(currentOpenedHCSelect)
                if (getComputedStyle($list).display == 'none')
                    show($list)
                else
                    hide($list)
                currentOpenedHCSelect = $list
            }

            // Detect $list events.
            // Helper - Filter unwanted <li>.
            function unwantedTarget(target)
            {
                if (target == $list || 
                    target.classList.contains(_CLASSES.LABEL) || 
                    target.closest('li[data-disabled]'))
                    return true
            }
            $.on($list, 'click', (e) => 
            {
                if (unwantedTarget(e.target))  
                {   
                    $search.focus()
                    return
                }
                else 
                {
                    $current.textContent = e.target.textContent
                    $select.selectedIndex = customOptionsArray.indexOf(e.target)
                    hide($list)
                }
            })
            $.on($list, 'mouseover', function(e)
            {
                if (unwantedTarget(e.target)) return
                var selected
                if ((selected = $list.query('.'+_CLASSES.HIGHLIGHTED)) &&
                     selected != e.target) 
                     selected.classList.remove(_CLASSES.HIGHLIGHTED)
                e.target.classList.add(_CLASSES.HIGHLIGHTED)
            })
            $.on($list, 'mouseout', function(e)
            {
                if (unwantedTarget(e.target)) return
                else e.target.classList.remove(_CLASSES.HIGHLIGHTED)
            })

            // Focus on click.
            $.on($current, 'click', function(e) {
                toggleSelect()
                $search.focus()
            })
            // Handle select focus/blur.
            $.on($search, 'focus', function() {
                $current.classList.toggle(_CLASSES.FOCUSED)
                customOptionsArray[$select.selectedIndex].classList.add(_CLASSES.HIGHLIGHTED);
            })
            $.on($search, 'blur', function(e) {
                var selected = $list.query('.'+_CLASSES.HIGHLIGHTED)
                if (selected)
                    selected.classList.remove(_CLASSES.HIGHLIGHTED)
                $current.classList.toggle(_CLASSES.FOCUSED)
            })

            // Handle keyboard.
            $.on($wrapper, 'keydown', function(e) {
                // Highlight next valid sibling.
                function highlightNext($element) {
                    var highlighted = $element.query('.'+_CLASSES.HIGHLIGHTED)
                    var next

                    if ($element.contains(highlighted)) {
                        next = getNextValidLi(highlighted)
                        if (next) {
                            highlighted.classList.toggle(_CLASSES.HIGHLIGHTED)
                            next.classList.toggle(_CLASSES.HIGHLIGHTED)
                        }
                        else return
                    }
                    else {
                        next = getNextValidLi($element)
                        if (next)
                            next.classList.toggle(_CLASSES.HIGHLIGHTED)
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
                        next.classList.contains(_CLASSES.GROUP))) 
                    {
                            next = getNextValidLi(next)
                    }
                    return next
                }

                // Highlight prev valid sibling.
                function highlightPrev($element) {
                    var highlighted = $element.query('.'+_CLASSES.HIGHLIGHTED)
                    var prev

                    if ($element.contains(highlighted)) {
                        prev = getPrevValidLi(highlighted)
                        if (prev) {
                            highlighted.classList.remove(_CLASSES.HIGHLIGHTED)
                            prev.classList.add(_CLASSES.HIGHLIGHTED)
                        }
                        else return
                    }
                    else {
                        prev = getPrevValidLi($element)
                        if (prev)
                            prev.classList.toggle(_CLASSES.HIGHLIGHTED)
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
                        prev.classList.contains(_CLASSES.group))) 
                    {
                            prev = getPrevValidLi(prev)
                    }
                    return prev
                }

                function updateHC() {
                    var h = $list.query('.'+_CLASSES.HIGHLIGHTED)
                    $current.textContent = h.textContent
                    $select.selectedIndex = customOptionsArray.indexOf(h)                    
                }

                var openedSelect
                if (openedSelect = $wrapper.query('.'+_CLASSES.FOCUSED)) 
                {
                    switch(e.which) 
                    {
                        case 9: // Tab
                            hide(openedSelect.parentElement.query('.'+_CLASSES.LIST))
                            updateHC()
                            break
                        case 13: // Enter
                            var highlighted = $list.query('.'+_CLASSES.HIGHLIGHTED)
                            if (highlighted) 
                            {
                                $select.selectedIndex = customOptionsArray.indexOf(highlighted)
                                $current.textContent = highlighted.textContent
                            }
                            toggleSelect()
                            break
                        case 27: // Esc
                            if (currentOpenedHCSelect)
                            {
                                $('.'+_CLASSES.HIGHLIGHTED).classList.remove(_CLASSES.HIGHLIGHTED)
                                toggleSelect()
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
                allOpts = $$('option,optgroup'), 
                allHCOpts = $$('.'+_CLASSES.LIST+' li')
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
                                        $current.textContent = customOptionsArray[0].textContent
                                    }
                                })
                            }
                            updateOptLists()
                            break
                    }
                    
                })
            })
            observer.observe($select, config)
                 

        } // replaceSelectElement.


        // Detect clicks outside of $list.
        function unique(element, index, array) {
            return array.indexOf(element) == index
        }

        var selects = selectList
        .map(function($select) 
        {
            return $select.ownerDocument
        })
        .filter(unique)
        .map(function($document)
        {
            return {owner: $document}
        })
        selects.forEach(function($doc)
        {
            $.on($doc.owner, 'click', function(e) 
            {
                var hc = e.target.closest('.'+CLASSES.WRAPPER)
                if (!hc && currentOpenedHCSelect) {
                    currentOpenedHCSelect.style.display = 'none'
                }
            })
        })

        // Init plugin.
        selectList.forEach(replaceSelectElement)
    }

    

})()