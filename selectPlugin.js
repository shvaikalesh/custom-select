DocumentFragment.prototype.append = Element.prototype.append;

!(function(global, options) 
{
    "use strict"
    Object.assign(options,
    {
        COMPANY: 'hc',
        CONTROL: 'select',
        SEPARATOR: '-'
    });

    // Helpers.
    function create(tag, name) 
    {
        var element = $('<' + tag + '>')
            element.className =
            [
                , options.COMPANY
                , options.CONTROL
                , name
            ]
            .filter(String)
            .join(options.SEPARATOR)

        return element;
    }

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

    var classes = {}

    // Init plugin.
    var selectElements = $$('select:not([mutiple])')
        selectElements.forEach(replaceSelectElement)
    // Var to store current opened HCSelect.
    var currentOpenedCustomSelect

    // Replace <select> with custom structure.
    function replaceSelectElement(select) {
        var customOptionsArray = [];
        /*
         *  CUSTOM SELECT.
         */
        var HCSelect = create('div', 'wrapper')
        select.before(HCSelect)
        select.tabIndex = -1
        classes.wrapper = HCSelect.className

        HCSelect.dataset.id = select.dataset.id; // debug

        // Blocks.
        function addHCPrefixedBlock(parent) {
            return function(type, className) {
                var block = create(type, className);
                parent.append(block);
                return block;
            }
        }
        var addBlockToHCSelect = addHCPrefixedBlock(HCSelect);

        var HCSelectBefore = addBlockToHCSelect('div', 'before');

        var HCSelectCurrent = addBlockToHCSelect('div', 'current');
            HCSelectCurrent.textContent = select.options[select.selectedIndex].textContent;

        var HCSelectAfter = addBlockToHCSelect('div', 'after');

        var HCSelectList = addBlockToHCSelect('ul', 'list');
            hide(HCSelectList);

        // Transfer select children.
        function transferChildren(parent) {

            return Array.prototype.map.call(parent.children, function(child) {
                var newChild = $('<li>');
                if (child.disabled)
                        newChild.setAttribute('data-disabled', '');

                var tag = child.tagName.toLowerCase();

                switch (tag)
                {
                    case 'option':
                        newChild.textContent = child.textContent;
                        customOptionsArray.push(newChild);
                        break;

                    case 'optgroup':
                        newChild.classList.add('hc-select-group');
                        var label = create('div', 'label');
                        label.textContent = child.label;
                        newChild.append(label);
                        newChild.append.apply(newChild, transferChildren(child));
                        break;
                }
                return newChild;
            });

        }
        HCSelectList.append.apply(HCSelectList, transferChildren(select));

        // Transfer select siblings.
        var selectSiblings = new DocumentFragment(); // TODO: POLYFILL
        var allowedSiblings = ['label', 'div', 'span'].join();
        var currentSibling;
        while (currentSibling = select.nextElementSibling) {
            if (currentSibling.matches(allowedSiblings)) 
                selectSiblings.append(select.nextElementSibling);
            else
                break;
        }
        HCSelect.append(select);
        HCSelect.append(selectSiblings);

        // Hidden input block.
        var HCSelectSearch = addBlockToHCSelect('input', 'search');
            HCSelectSearch.type = 'search';





        // Assign handlers.
        // Open/close HCSelect.
        function toggleSelect(e) {
            if (getComputedStyle(HCSelectList).display == 'none') {
                if (currentOpenedCustomSelect)
                    hide(currentOpenedCustomSelect);
                show(HCSelectList);
                currentOpenedCustomSelect = HCSelectList;
            } else 
                    show(HCSelectList);
        }
        $.on(HCSelectCurrent, 'click', toggleSelect);

        // Detect HCSelectList events.
        $.on(HCSelectList, 'click', (e) => {
            if (e.target == HCSelectList || e.target.classList.contains('hc-select-label') || e.target.closest('li[data-disabled]'))
                return;
            else {
                HCSelectCurrent.textContent = e.target.textContent;
                select.selectedIndex = customOptionsArray.indexOf(e.target);
                hide(HCSelectList);
            }
        });

        // Focus on click.
        $.on(HCSelectCurrent, 'click', function() {
            HCSelectSearch.focus();
        });
        // Handle select focus/blur.
        $.on(HCSelectSearch, 'focus', function() {
            HCSelectList.style.removeProperty('display');
            HCSelectCurrent.classList.toggle('hc-select-focused');
        });
        $.on(HCSelectSearch, 'blur', function() {
            hide(HCSelectList);
            HCSelectCurrent.style.outline = '';
            HCSelectCurrent.classList.toggle('hc-select-focused');
            var selected = HCSelectList.query('.hc-select-highlighted');
            if (selected)
                selected.classList.remove('hc-select-highlighted');
        });

        // Handle keyboard.
        $.on(HCSelectSearch, 'keydown', function(e) {
            // Highlight next valid sibling.
            function highlightNext(el) {
                var highlighted = $('.hc-select-highlighted');
                var next;

                if (el.contains(highlighted)) {
                    next = getNextValidLi(highlighted);
                    if (next) {
                        highlighted.classList.toggle('hc-select-highlighted');
                        next.classList.toggle('hc-select-highlighted');
                    }
                    else return;
                }
                else {
                    next = getNextValidLi(el);
                    if (next)
                        next.classList.toggle('hc-select-highlighted');
                }
            }
            // Helper for highlightNext().
            function getNextValidLi(current) {
                var next = current.firstElementChild ||
                           current.nextElementSibling ||
                           current.parentElement.nextElementSibling;
                if (next == select) return;

                if (next && (next.dataset.hasOwnProperty('disabled') || 
                    next.parentElement.dataset.hasOwnProperty('disabled') ||
                    next.tagName != 'LI' || 
                    next.classList.contains('hc-select-group'))) 
                {
                        next = getNextValidLi(next);
                }
                return next;
            }

            // Highlight prev valid sibling.
            /*function highlightPrev(el) {
                // TODO
                var highlighted = $('.hc-select-highlighted');
                var prev;

                if (el.contains(highlighted)) {
                    prev = getPrevValidLi(highlighted);
                    if (prev) {
                        highlighted.classList.toggle('hc-select-highlighted');
                        prev.classList.toggle('hc-select-highlighted');
                    }
                    else return;
                }
                else {
                    prev = getNextValidLi(el);
                    if (prev)
                        prev.classList.toggle('hc-select-highlighted');
                }
            }*/

            var openedSelect;
            if (openedSelect = HCSelect.query('.hc-select-focused')) {
                switch(e.which) {
                    // case 38:
                    //     highlightPrev(HCSelectList);
                    case 40:
                        highlightNext(HCSelectList);
                }
            }
        });
    } // replaceSelectElement.

    // Detect clicks outside of HCSelectList.
    $.on(document, 'click', (e) => {
        var cS = e.target.closest('.hc-select-wrapper');
        if (!cS && currentOpenedCustomSelect) {
            currentOpenedCustomSelect.style.display = 'none';
        }
    })

})(this, {})