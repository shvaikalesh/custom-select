!(function() {
    // Helpers.
    function getOptFromDiv(div) {
        return customOptionsArray.indexOf(div);
    }
    function getDivFromOpt(opt) {
        return optionsArray.indexOf(opt);
    }
    function createPrefixedElement(prefix) {
        return function(el, className) {
            var customEl = $('<' + el + '>');
            customEl.classList.add(prefix + '-' + className);
            return customEl;
        }
    }
    var createHRselectBlock = createPrefixedElement('hr-select');





    // Init plugin.
    var selectElements = $$('select:not([mutiple])');
        selectElements.forEach(replaceSelectElement);
    // Var to store current opened HRSelect.
    var currentOpenedCustomSelect;

    // Replace <select> with custom structure.
    function replaceSelectElement(select) {

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
        HRSelect.append(select);

        // Transfer select children.
        function transferChildren(parent) {

            return Array.prototype.map.call(parent.children, function(child) {
                var newChild = $('<li>');
                var tag = child.tagName.toLowerCase();

                switch (tag)
                {
                    case 'option':
                        newChild.textContent = child.textContent;
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


        // Assign handlers.
        // Open/close HRSelect.
        $.on(HRSelectCurrent, 'click', (e) => {
            console.log(HRSelectList.style.display);
            if (HRSelectList.style.display == 'none') {
                if (currentOpenedCustomSelect) {
                    currentOpenedCustomSelect.style.display = 'none';
                }

                HRSelectList.style.display = 'block';
                console.log(HRSelectList);
                currentOpenedCustomSelect = HRSelectList;
                // console.log(currentOpenedCustomSelect);
            } else {
                HRSelectList.style.display = 'none';
            }
        });

        // Detect HRSelectList events.
        /*$.on(HRSelectList, 'mouseover', (e) => {
            if (e.target == HRSelectList || e.target.dataset.tag == 'optgroup') return;
            else
                e.target.style.backgroundColor = userStyles.option.backgroundColorHover;
        })
        $.on(HRSelectList, 'mouseout', (e) => {
            if (e.target == HRSelectList || e.target.dataset.tag == 'optgroup') return;
            else
                e.target.style.backgroundColor = userStyles.option.backgroundColor;
        })
        $.on(HRSelectList, 'click', (e) => {
            if (e.target == HRSelectList || e.target.dataset.tag == 'optgroup') {
                return;
            }
            else
            HRSelectedOption.textContent = e.target.textContent;
            select.selectedIndex = getOptFromDiv(e.target);
        })*/

        

        // DECOR.
        select.style.position = 'relative';
        select.style.left = '200px';


    } // replaceSelectElement.

    // a = $('select');
    // b = $('option');
    // console.log(getComputedStyle(a));
    // console.log(getComputedStyle(b));



    // Detect clicks outside of HRSelectList.
    $.on(document, 'click', (e) => {
        var cS = e.target.closest('.custom-select');
        if (!cS && currentOpenedCustomSelect) {
            currentOpenedCustomSelect.style.display = 'none';
        }
    })
})()