function filterResources() {
    let searchInput = document.getElementById("searchBar").value.toLowerCase();
    let resources = document.querySelectorAll(".resource-item");

    resources.forEach(resource => {
        let title = resource.querySelector("h3").textContent.toLowerCase();
        let description = resource.querySelector("p").textContent.toLowerCase();

        if (title.includes(searchInput) || description.includes(searchInput)) {
            resource.style.display = "block";
        } else {
            resource.style.display = "none";
        }
    });
}

function filterCategory(category) {
    let resources = document.querySelectorAll(".resource-item");

    resources.forEach(resource => {
        if (category === "all" || resource.getAttribute("data-category") === category) {
            resource.style.display = "block";
        } else {
            resource.style.display = "none";
        }
    });
}
