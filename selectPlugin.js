!(function() {
    // Helpers.
    function createPrefixedElement(prefix) {
        return function(el, className) {
            var customEl = $('<' + el + '>');
            customEl.classList.add(prefix + '-' + className);
            return customEl;
        }
    }
    var createHRselectBlock = createPrefixedElement('hr-select');

    DocumentFragment.prototype.append = Element.prototype.append;

    function hide(element) {
        element.style.setProperty('display', 'none');
    }
    function show(element) {
        element.style.removeProperty('display');
    }



    // Init plugin.
    var selectElements = $$('select:not([mutiple])');
        selectElements.forEach(replaceSelectElement);
    // Var to store current opened HRSelect.
    var currentOpenedCustomSelect;

    // Replace <select> with custom structure.
    function replaceSelectElement(select) {
        var customOptionsArray = [];
        /*
         *  CUSTOM SELECT.
         */
        var HRSelect = createHRselectBlock('div', 'wrapper');
        select.before(HRSelect);
        select.tabIndex = -1;

        HRSelect.dataset.id = select.dataset.id; // debug

        // Blocks.
        function addHRPrefixedBlock(parent) {
            return function(type, className) {
                var block = createHRselectBlock(type, className);
                parent.append(block);
                return block;
            }
        }
        var addBlockToHRSelect = addHRPrefixedBlock(HRSelect);

        var HRSelectBefore = addBlockToHRSelect('div', 'before');

        var HRSelectCurrent = addBlockToHRSelect('div', 'current');
            HRSelectCurrent.textContent = select.options[select.selectedIndex].textContent;

        var HRSelectAfter = addBlockToHRSelect('div', 'after');

        var HRSelectList = addBlockToHRSelect('ul', 'list');
            hide(HRSelectList);

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
                        newChild.classList.add('hr-select-group');
                        var label = createHRselectBlock('div', 'label');
                        label.textContent = child.label;
                        newChild.append(label);
                        newChild.append.apply(newChild, transferChildren(child));
                        break;
                }
                return newChild;
            });

        }
        HRSelectList.append.apply(HRSelectList, transferChildren(select));

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
        HRSelect.append(select);
        HRSelect.append(selectSiblings);

        // Hidden input block.
        var HRSelectSearch = addBlockToHRSelect('input', 'search');
            HRSelectSearch.type = 'search';





        // Assign handlers.
        // Open/close HRSelect.
        function toggleSelect(e) {
            if (getComputedStyle(HRSelectList).display == 'none') {
                if (currentOpenedCustomSelect)
                    hide(currentOpenedCustomSelect);
                show(HRSelectList);
                currentOpenedCustomSelect = HRSelectList;
            } else 
                    show(HRSelectList);
        }
        $.on(HRSelectCurrent, 'click', toggleSelect);

        // Detect HRSelectList events.
        $.on(HRSelectList, 'click', (e) => {
            if (e.target == HRSelectList || e.target.classList.contains('hr-select-label') || e.target.closest('li[data-disabled]'))
                return;
            else {
                HRSelectCurrent.textContent = e.target.textContent;
                select.selectedIndex = customOptionsArray.indexOf(e.target);
                hide(HRSelectList);
            }
        });


        // Handle select focus/blur.
        $.on(HRSelectSearch, 'focus', function() {
            HRSelectList.style.removeProperty('display');
            HRSelectCurrent.classList.toggle('hr-select-focused');
        });
        $.on(HRSelectSearch, 'blur', function() {
            hide(HRSelectList);
            HRSelectCurrent.style.outline = '';
            HRSelectCurrent.classList.toggle('hr-select-focused');
            var selected = HRSelectList.query('.hr-select-highlighted');
            if (selected)
                selected.classList.remove('hr-select-highlighted');
        });

        // Handle keyboard.
        $.on(HRSelectSearch, 'keydown', function(e) {
            function getNextValidLi(current) {
                var next = current.firstElementChild ||
                           current.nextElementSibling ||
                           current.parentElement.nextElementSibling;
                console.log(next);
                if (next == HRSelectList) return;
                if (next && next.dataset.hasOwnProperty('disabled') || 
                    next.parentElement.dataset.hasOwnProperty('disabled') ||
                    next.tagName != 'LI' || 
                    next.classList.contains('hr-select-group')) {
                        next = getNextValidLi(next);
                }
                return next;
            }

            // Highlight next/prev valid sibling.
            function highlightNext(el) {
                // TODO
                var highlighted, next;

                if (el.contains($('.hr-select-highlighted'))) {
                    highlighted = el.query('.hr-select-highlighted');
                    if (highlighted == el.lastChild) return; 

                    highlighted.classList.toggle('hr-select-highlighted');
                    next = getNextValidLi(highlighted);
                    next.classList.toggle('hr-select-highlighted');
                }
                else {
                    highlighted = getNextValidLi(el);
                    if (highlighted)
                        highlighted.classList.toggle('hr-select-highlighted');
                }
            }
            function highlightPrev(el) {
                // TODO
            }

            var openedSelect;
            if (openedSelect = HRSelect.query('.hr-select-focused')) {

                switch(e.which) {
                    case 40:
                        highlightNext(HRSelectList);
                }
            }
        });
    } // replaceSelectElement.

    // Detect clicks outside of HRSelectList.
    $.on(document, 'click', (e) => {
        var cS = e.target.closest('.hr-select-wrapper');
        if (!cS && currentOpenedCustomSelect) {
            currentOpenedCustomSelect.style.display = 'none';
        }
    })

})()