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

        // Blocks.
        function addHRPrefixedBlock(parent) {
            return function(type, className) {
                var block = createHRselectBlock(type, className);
                parent.append(block);
                return block;
            }
        }
        var addBlockToHRSelect = addHRPrefixedBlock(HRSelect);

        var HRSelectSearch = addBlockToHRSelect('input', 'search');
            HRSelectSearch.type = 'search';

        var HRSelectBefore = addBlockToHRSelect('div', 'before');

        var HRSelectCurrent = addBlockToHRSelect('div', 'current');
            HRSelectCurrent.textContent = select.options[select.selectedIndex].textContent;

        var HRSelectAfter = addBlockToHRSelect('div', 'after');

        var HRSelectList = addBlockToHRSelect('ul', 'list');

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





        // Assign handlers.
        // Open/close HRSelect.
        $.on(HRSelectCurrent, 'click', (e) => {
            if (getComputedStyle(HRSelectList).display == 'none') {
                if (currentOpenedCustomSelect) {
                    currentOpenedCustomSelect.style.display = 'none';
                }

                HRSelectList.style.display = 'block';
                
                currentOpenedCustomSelect = HRSelectList;
            } else {
                HRSelectList.style.display = 'none';
            }
        });

        // Detect HRSelectList events.
        $.on(HRSelectList, 'click', (e) => {
            if (e.target == HRSelectList || e.target.classList.contains('hr-select-label') || e.target.closest('li[data-disabled]')) {
                return;
            }
            else {
                HRSelectCurrent.textContent = e.target.textContent;
                select.selectedIndex = customOptionsArray.indexOf(e.target);
                HRSelectList.style.display = 'none';
            }
        })

    } // replaceSelectElement.

    // Detect clicks outside of HRSelectList.
    $.on(document, 'click', (e) => {
        var cS = e.target.closest('.hr-select-wrapper');
        if (!cS && currentOpenedCustomSelect) {
            currentOpenedCustomSelect.style.display = 'none';
        }
    })
})()