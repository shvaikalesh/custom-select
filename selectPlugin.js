!function() {

    // Init plugin.
    var selectElements = $$('select:not([mutiple])');
        selectElements.forEach(replaceSelectElement);

    // Replace <select> with custom structure.
    function replaceSelectElement(select) {
        // Helpers.
        function getOptFromDiv(div) {
            return customOptionsArray.indexOf(div);
        }
        function getDivFromOpt(opt) {
            return optionsArray.indexOf(opt);
        }

        // TODO.
        var customSelect = $('<div>');
        customSelect.classList.add('custom-select');

        // Arrays to store options and customOptions (divs).
        var optionsArray = [], customOptionsArray = [];



        // Dealing with styles.
        var originStyles = getComputedStyle(select); // default <select> styles.
        var userStyles = {select: {},
                          option: {
                                    backgroundColorHover: 'lightblue',
                                    backgroundColor: 'white'
                                  }}; // mock object for styles set by user.





        // Transfer browser styles from <select> to customSelect.
        function transferStyles(element, props, stylesObject) {
            props.forEach(function(prop) {
                element.style[prop] = stylesObject[prop];
            });
        }
        transferStyles(customSelect, ['border', 'display', 'height', 'width', 'font'], originStyles);
        customSelect.style.overflow = 'hidden';

        // Selected <option>.
        var selectedOption = $('<div>');
        selectedOption.textContent = select[select.selectedIndex].textContent;
        selectedOption.style.height = '100%';
        customSelect.append(selectedOption);


        // Fill hidden list, fill arrays of options and customOptions.
        var innerList = $('<div>');
        transferStyles(innerList, ['border'], originStyles);
        customSelect.append(innerList);
        var opts = select.queryAll('option, optgroup');

        innerList.append.apply(innerList, opts.map(option => {
            var customOption = $('<div>');
                customOption.textContent = option.textContent;

            if (option.tagName == 'OPTION') {
                optionsArray.push(option);
                customOptionsArray.push(customOption);
            }
            return customOption;
        }));





        // Assign handlers.
        // Open/close customSelect.
        $.on(customSelect, 'click', () => {
            if (customSelect.style.overflow == 'hidden') {
                customSelect.style.overflow = 'visible';
            } else {
                customSelect.style.overflow = 'hidden';
            }
        });

        // Detect list hover.
        $.on(innerList, 'mouseover', (e) => {
            if (e.target == innerList) return;
            else
                e.target.style.backgroundColor = userStyles.option.backgroundColorHover;
        })
        $.on(innerList, 'mouseout', (e) => {
            if (e.target == innerList) return;
            else
                e.target.style.backgroundColor = userStyles.option.backgroundColor;
        })
        $.on(innerList, 'click', (e) => {
            if (e.target == innerList) return;
            else
                // console.log(e.target);
            selectedOption.textContent = e.target.textContent;
            select.selectedIndex = opts.indexOf(e.target.textContent);
            console.log(opts, e.target, opts.indexOf(e.target));

        })



        document.body.append(customSelect);
    console.log(optionsArray, customOptionsArray);
    } // replaceSelectElement.

    // a = $('select');
    // b = $('option');
    // console.log(getComputedStyle(a));
    // console.log(getComputedStyle(b));

}()