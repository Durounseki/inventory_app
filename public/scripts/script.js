function handleSearchSubmit(event){
    if(event.key === 'Enter'){
        event.preventDefault();
        event.target.submit();
    }
    return true;
}

const searchbars = document.querySelectorAll('.searchbar');
searchbars.forEach(searchbar => {
    const inputElement = searchbar.querySelector('input');
    inputElement.addEventListener('input',showClearButton);
});

function showClearButton(event){
    const button = event.target.parentNode.querySelector('.clear-search');
    if(event.target.value.length > 0){
        button.classList.add('show');
    }else{
        button.classList.remove('show');
    }
}
//Select style option in search form
const styleSelect = document.querySelector('#style-search');
const styleValue = styleSelect.dataset.styleValue;
const selectedStyle = styleSelect.querySelector(`option[value="${styleValue}"]`);
if (selectedStyle) {
    selectedStyle.selected = true;
}

//Display selected event
const eventCards = document.querySelectorAll('.event-card');
console.log(eventCards);

eventCards.forEach(card => {
    card.addEventListener('click',showEventInfo);
});

function showEventInfo(event){
    const eventId = event.target.closest('.event-card').dataset.eventId;
    fetchEventInfo(eventId);
}

function fetchEventInfo(eventId){
    //Get the event information from the server as an html string
    fetch(`/events/${eventId}`)
    .then(response => {
        if (!response.ok) {
            // Network or server error
            if (response.status === 404) {
                throw new Error('Row not found'); 
            } else {
                // Try to parse the error response from the server
                return response.json().then(errorData => {
                    throw new Error(errorData.message || 'Server error'); 
                });
            }
        }
        return response.text();
    })
    .then(eventInfo => {
        const eventContainer = document.querySelector('.event-container');
        //Update event info
        eventContainer.innerHTML = eventInfo;
        //Update URL
        const currentUrl = new URL(window.location.href);
        const currentParams = new URLSearchParams(currentUrl.search);
        //Check if we already visited the event page
        //When this function is called inside showEventInfo
        //the currentUrl is that before updating the url below
        //In this case clicking a new event card will give a eventId that doesn't match
        //the current params, in this case we push a new state to the history
        //When it is called inside the popstate handler, the current params correspond
        //to the url either back or forward in the history and the eventId is extracted
        //from the currentParams. In this case we replace the state in the history.
        //This enables back and forward in the browser history.
        const isNewEvent = !currentParams.has('event') || currentParams.get('event') !== eventId;
        currentParams.set('event', eventId);
        const newUrl = `${currentUrl.pathname}?${currentParams.toString()}`;

        if (isNewEvent) {
            history.pushState({}, '', newUrl); // New event, push to history
        } else {
            history.replaceState({}, '', newUrl); // Existing event, replace current state
        }
    })
    .catch(error => {
        console.error('Error fetching data:', error);
        alert('An error occurred: ' + error.message);
    });
}
//Handle browser history
window.addEventListener('popstate', (event) => {
    const currentUrl = new URL(window.location.href);
    const eventId = currentUrl.searchParams.get('event');
    if(eventId){
        fetchEventInfo(eventId);
    }
});

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
        addSnsButton.removeEventListener('click',addSnsInputGroup);
    }
    const snsGroup = document.createElement('div');
    snsGroup.classList.add('event-sns-group');

    const platformSelect = document.createElement('select');
    platformSelect.name = `event-sns-${snsCounter}-platform`; 
    platformSelect.required = true;

    const platforms = ['website', 'facebook', 'instagram', 'youtube'];
    platforms.forEach(platform => {
        const option = document.createElement('option');
        option.value = platform;
        option.text = platform.charAt(0).toUpperCase() + platform.slice(1);
        platformSelect.appendChild(option);
    });
    const urlInput = document.createElement('input');
    urlInput.type = 'text';
    urlInput.name = `event-sns-${snsCounter}-url`; 
    urlInput.placeholder = 'Enter URL';
    urlInput.required = true;

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', () => {
        snsGroup.remove();
        snsCounter--;
        if(snsCounter === 3){
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