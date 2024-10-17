//Resize text area
const textAreas = document.querySelectorAll('textarea');
textAreas.forEach(area =>{
    area.addEventListener('input',resizeTextArea);
    resizeTextArea({target: area});
});

function resizeTextArea(event){
    event.target.style.height = `5em`;
    event.target.style.height = `${event.target.scrollHeight}px`;
}

//Add sns
const snsContainer = document.querySelector('.user-sns-container');
const addSnsButton = document.getElementById('user-add-sns');
let snsCounter = document.querySelectorAll('.user-sns-group').length;

addSnsButton.addEventListener('click',addSnsInputGroup);

function addSnsInputGroup() { 
    snsCounter++;
    if(snsCounter === 4){
        snsCounter=4;
        addSnsButton.classList.add('disabled');
        addSnsButton.removeEventListener('click',addSnsInputGroup);
    }
    const snsGroup = document.createElement('div');
    snsGroup.classList.add('user-sns-group');

    const platformSelect = document.createElement('select');
    // platformSelect.name = `user-sns-${snsCounter}-platform`;
    platformSelect.name = `user-sns-platform`;
    // platformSelect.required = true;

    const platforms = ['website', 'facebook', 'instagram', 'youtube'];
    platforms.forEach(platform => {
        const option = document.createElement('option');
        option.value = platform;
        option.text = platform.charAt(0).toUpperCase() + platform.slice(1);
        platformSelect.appendChild(option);
    });
    const urlInput = document.createElement('input');
    urlInput.type = 'text';
    // urlInput.name = `user-sns-${snsCounter}-url`; 
    urlInput.name = `user-sns-url`;
    urlInput.placeholder = 'Enter URL';
    urlInput.required = true;
    if(snsCounter > 1){
        const removeButton = document.querySelector('.remove-sns');
        removeButton.classList.remove('disabled');
    }
    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.textContent = 'Remove';
    removeButton.classList.add('remove-sns');
    if(snsCounter === 1){
        removeButton.classList.add('disabled');
    }
    removeButton.addEventListener('click', () => {
        if(snsCounter > 1){
            snsGroup.remove();
            snsCounter--;
            if(snsCounter===1){
                const disabledButton = document.querySelector('.remove-sns');
                disabledButton.classList.add('disabled');
            }
        }
        if(snsCounter === 3){
            addSnsButton.classList.remove('disabled');
            addSnsButton.addEventListener('click',addSnsInputGroup);        
        }
    });

    snsGroup.appendChild(platformSelect);
    snsGroup.appendChild(urlInput);
    snsGroup.appendChild(removeButton);

    snsContainer.appendChild(snsGroup);
}

//Add style
const styleContainer = document.querySelector('.form-checkbox-container');
const addStyleButton = document.getElementById('user-add-style');
const otherStyleInput = document.getElementById('other');

addStyleButton.addEventListener('click',addStyleCheckbox);

function addStyleCheckbox() {
  
    const styles = getUserStyles();
    const newStyle = otherStyleInput.value.trim().toLowerCase();
    const formattedStyle = newStyle.charAt(0).toUpperCase() + newStyle.slice(1);

    if (newStyle !== "" && !styles.includes(newStyle)) {
        const newLabel = document.createElement('label');
        newLabel.htmlFor = newStyle; 

        const newCheckbox = document.createElement('input');
        newCheckbox.classList.add('user-style-checkbox');
        newCheckbox.type = 'checkbox';
        newCheckbox.id = newStyle;
        newCheckbox.name = 'user-style';
        newCheckbox.value = newStyle;
        newCheckbox.checked = true;

        const customCheckbox = document.createElement('div');
        customCheckbox.classList.add('custom-checkbox');

        const textNode = document.createTextNode(formattedStyle);

        newLabel.appendChild(newCheckbox);
        newLabel.appendChild(customCheckbox);
        newLabel.appendChild(textNode);

        styleContainer.appendChild(newLabel);

        // Clear the input field
        document.getElementById('other').value = '';
    }
}

function getUserStyles() {
    const checkboxes = document.querySelectorAll('.user-style-checkbox:checked');
    const styles = [];

    checkboxes.forEach(checkbox => {
        styles.push(checkbox.value);
    });

    return styles;
}

otherStyleInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault(); 
        addStyleCheckbox(); 
    }
});