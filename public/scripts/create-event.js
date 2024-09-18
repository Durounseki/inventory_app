//Create Event Form
//Resize text area
const textAreas = document.querySelectorAll('textarea');
textAreas.forEach(area =>{
    area.addEventListener('input',resizeTextArea);
});
function resizeTextArea(event){
    event.target.style.height = `5em`;
    event.target.style.height = `${event.target.scrollHeight}px`;
}
//Add sns
const snsContainer = document.querySelector('.event-sns-container');
const addSnsButton = document.getElementById('event-add-sns');
let snsCounter = 0; // Counter to keep track of SNS input groups

addSnsButton.addEventListener('click',addSnsInputGroup);

function addSnsInputGroup() { 
    snsCounter++;
    if(snsCounter === 4){
        snsCounter=4;
        addSnsButton.classList.add('disabled');
        addSnsButton.removeEventListener('click',addSnsInputGroup);
    }
    const snsGroup = document.createElement('div');
    snsGroup.classList.add('event-sns-group');

    const platformSelect = document.createElement('select');
    // platformSelect.name = `event-sns-${snsCounter}-platform`;
    platformSelect.name = `event-sns-platform`;
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
    // urlInput.name = `event-sns-${snsCounter}-url`; 
    urlInput.name = `event-sns-url`;
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

// Initial input group on page load
addSnsInputGroup();