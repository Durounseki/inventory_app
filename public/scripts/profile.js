window.addEventListener("load", () => {
    const offset = 8;
    const activeTab = document.querySelector(".details-tab.active");
    const boundingBox = activeTab.getBoundingClientRect();
    const parentElement = activeTab.parentElement;
    const parentBox = parentElement.getBoundingClientRect();
    if(parentBox.right < boundingBox.right){
        // parentElement.scrollLeft += boundingBox.right - parentBox.right + offset;
        parentElement.scrollTo({
            left: parentElement.scrollLeft + boundingBox.right - parentBox.right + offset,
            behavior: 'smooth'
        });
    }
});