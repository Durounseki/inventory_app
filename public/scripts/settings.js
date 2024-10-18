const activeTab = document.querySelector("details-tab.active");
window.addEventListener("load", () => {
    activeTab.scrollIntoView({behavior: 'smooth', block: 'nearest'});
});


const deleteAccountForm = document.querySelector("#delete-account");
const deleteAccountButton = document.querySelector("#delete-account-button");
deleteAccountButton.addEventListener("click", () => {
    deleteAccountForm.classList.toggle("show");
    if(deleteAccountForm.classList.contains("show")){
        deleteAccountButton.textContent="Cancel";
    }else{
        deleteAccountButton.textContent="Delete Account";
    }
});

const editPictureButton = document.querySelector("#edit-picture");
const editPictureContainer = document.querySelector(".edit-picture-container");

editPictureButton.addEventListener("click", () => {
    editPictureContainer.classList.toggle("show");
    if(editPictureContainer.classList.contains("show")){
        editPictureButton.textContent="Cancel";
    }else{
        editPictureButton.textContent="Edit Picture";
    }
});

const uploadPictureButton = document.querySelector("#upload-picture-button");
const uploadPictureInput = document.querySelector(".edit-picture-container input");

uploadPictureInput.addEventListener("change", () => {
    if(uploadPictureInput.value === ''){
        uploadPictureButton.textContent = "Delete Picture";
    }else{
        uploadPictureButton.textContent = "Upload Picture";
    }
});