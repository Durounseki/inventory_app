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