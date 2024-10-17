const deleteAccountForm = document.querySelector("#delete-account");
const deleteAccountButton = document.querySelector("#delete-account-button");
deleteAccountButton.addEventListener("click", () => {
    deleteAccountForm.classList.toggle("show");
});