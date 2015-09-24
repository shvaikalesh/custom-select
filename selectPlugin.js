!function() {
    // Init plugin.
    var selectElements = $$('select:not([mutiple])');
        selectElements.forEach(replaceSelectElement);

    // Replace <select> with custom structure.
    function replaceSelectElement(select) {
        // TODO.
        var customSelect = $('<div>');
        customSelect.classList.add('custom-select');
        // customSelect.dataset.name = select.name;
        // customSelect.dataset.required = select.required;

        // Transfer browser styles from <select> to customSelect.
        function transferStyles(element, origin, props) {
            var elementsStyles = getComputedStyle(origin);
            props.forEach(function(prop) {
                element.style[prop] = elementsStyles[prop];
            });
        }
        transferStyles(customSelect, select, ['border', 'display', 'height', 'font']);
        customSelect.style.overflow = 'hidden';

        // Selected <option>.
        var selectedOption = $('<div>');
        selectedOption.textContent = select[select.selectedIndex].textContent;
        selectedOption.style.height = '100%';
        customSelect.append(selectedOption);


        // Hidden <option>s.
        var innerList = $('<div>');
        customSelect.append(innerList);
        var opts = select.queryAll('option, optgroup');

        opts.forEach(function(option) {
            var customOption = $('<div>');
            customOption.textContent = option.textContent;
            innerList.append(customOption);
        });

        innerList.append.apply(innerList, opts.map(option =>
        {
            var customOption = $('<div>')
                customOption.textContent = option.textContent

            return customOption
        }))

        document.body.append(customSelect);
    } // replaceSelectElement.

    // a = $('select');
    // b = $('option');
    // console.log(getComputedStyle(a));
    // console.log(getComputedStyle(b));

}()