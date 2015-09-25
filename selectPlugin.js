!function() {

    // Init plugin.
    var selectElements = $$('select:not([mutiple])');
        selectElements.forEach(replaceSelectElement);
    // Var to store current opened customSelect.
    var currentOpenedCustomSelect;

    // Replace <select> with custom structure.
    function replaceSelectElement(select) {
        // Helpers.
        function getOptFromDiv(div) {
            return customOptionsArray.indexOf(div);
        }
        function getDivFromOpt(opt) {
            return optionsArray.indexOf(opt);
        }
        var optionsArray = [], customOptionsArray = []; // Arrays to store options and customOptions (divs).

        // Deal with styles.
        var originStyles = getComputedStyle(select); // default <select> styles.
        var userStyles = {select:   {},
                          option:   {
                                      backgroundColorHover: 'lightblue',
                                      backgroundColor: 'white',
                                      paddingInsideOptgroup: '10px'
                                    },
                          optgroup: {
                                        fontWeight: 'bold',
                                        paddingLeft: '5px'
                                    }}; // mock object for styles set by user.





        // Create wrapper.
        var customParent = $('<div>');
        select.before(customParent);
        customParent.append(select);
        customParent.style.fontSize = '0px';

        


        /*
         *  CUSTOM SELECT.
         */
        var customSelect = $('<div>');
        customSelect.classList.add('custom-select');


        // Transfer browser styles from <select> to customSelect.
        function transferStyles(element, props, stylesObject) {
            props.forEach(function(prop) {
                element.style[prop] = stylesObject[prop];
            });
        }
        transferStyles(customSelect, ['display', 'height', 'width', 'font', 'box-sizing'], originStyles);
        customSelect.style.overflow = 'hidden';
        customSelect.style.position = 'relative';
        customSelect.style.border = '3px solid red';

        // Selected <option>.
        var customSelectedOption = $('<div>');
        customSelectedOption.textContent = select[select.selectedIndex].textContent;
        customSelectedOption.style.height = '100%';
        customSelect.append(customSelectedOption);


        // Fill hidden list, fill arrays of options and customOptions.
        var innerList = $('<div>');
        transferStyles(innerList, ['border', 'padding', 'width', 'box-sizing'], originStyles);
        innerList.style.position = 'absolute';
        innerList.style.zIndex = '1';
        customSelect.append(innerList);
        var opts = select.queryAll('option, optgroup');

        innerList.append.apply(innerList, opts.map(option => {
            var customOption = $('<div>');
                customOption.style.backgroundColor = userStyles.option.backgroundColor;

            if (option.tagName == 'OPTION') {
                customOption.textContent = option.textContent;
                customOption.dataset.tag = 'option';

                optionsArray.push(option);
                customOptionsArray.push(customOption);
                if (option.parentNode.tagName == 'OPTGROUP')
                    customOption.style.paddingLeft = userStyles.option.paddingInsideOptgroup;
            } else {
                customOption.textContent = option.label;
                customOption.dataset.tag = 'optgroup';
                customOption.style.fontWeight = userStyles.optgroup.fontWeight;
                customOption.style.paddingLeft = userStyles.optgroup.paddingLeft;
            }
            return customOption;

        }));





        // Assign handlers.
        // Open/close customSelect.
        $.on(customSelect, 'click', (e) => {
            
            if (customSelect.style.overflow == 'hidden') {

                currentOpenedCustomSelect ? currentOpenedCustomSelect.style.overflow = 'hidden' : currentOpenedCustomSelect = customSelect;

                customSelect.style.overflow = 'visible';
                currentOpenedCustomSelect = customSelect;
            } else {
                customSelect.style.overflow = 'hidden';
            }
        });

        // Detect innerList events.
        $.on(innerList, 'mouseover', (e) => {
            if (e.target == innerList || e.target.dataset.tag == 'optgroup') return;
            else
                e.target.style.backgroundColor = userStyles.option.backgroundColorHover;
        })
        $.on(innerList, 'mouseout', (e) => {
            if (e.target == innerList || e.target.dataset.tag == 'optgroup') return;
            else
                e.target.style.backgroundColor = userStyles.option.backgroundColor;
        })
        $.on(innerList, 'click', (e) => {
            if (e.target == innerList || e.target.dataset.tag == 'optgroup') {
                return;
            }
            else
            customSelectedOption.textContent = e.target.textContent;
            select.selectedIndex = getOptFromDiv(e.target);
        })

        



        select.after(customSelect);
    } // replaceSelectElement.

    // a = $('select');
    // b = $('option');
    // console.log(getComputedStyle(a));
    // console.log(getComputedStyle(b));



    // Detect clicks outside of innerList.
    $.on(document.body, 'click', (e) => {
        var cS = e.target.closest('.custom-select');
        if (!cS)
            $$('.custom-select').forEach(el => {el.style.overflow = 'hidden'});
    })
}()