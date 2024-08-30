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