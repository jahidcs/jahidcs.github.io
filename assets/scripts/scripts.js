const header = document.querySelector("header");

window.addEventListener("scroll", () => {
  if (window.scrollY > 100) {
    // Adjust the threshold as needed
    header.classList.add("hidden");
  } else {
    header.classList.remove("hidden");
  }
});

const navElement = document.querySelector("nav");

setTimeout(() => {
  navElement.classList.add("loaded");
}, 1000);

fetch("/assets/json/data.json")
  .then((response) => response.json())
  .then((data) => {
    document.getElementById("name").textContent = data.name;
    document.getElementById("profession").textContent = data.profession;
    document.getElementById("bio").textContent = data.bio;
    document.getElementById("contact-email").textContent = data.contact[0];
  })
  .catch((error) => {
    console.error("Error fetching data:", error);
  });

const companiesList = document.querySelector(".companies");
const detailsContainer = document.querySelector(".details");

fetch("/assets/json/data.json")
  .then((response) => response.json())
  .then((data) => {
    data.experience.forEach((company, index) => {
      const listItem = document.createElement("li");
      listItem.textContent = company.organization;
      listItem.dataset.companyIndex = index;
      companiesList.appendChild(listItem);

      listItem.addEventListener("click", () => {
        // Remove the 'selected' class from all list items
        const selectedItem = document.querySelector(".companies li.selected");
        if (selectedItem) {
          selectedItem.classList.remove("selected");
        }

        // Add the 'selected' class to the clicked list item
        listItem.classList.add("selected");

        const companyIndex = listItem.dataset.companyIndex;
        const companyDetails = data.experience[companyIndex];

        const formattedDetail = companyDetails.detail.replace(/\n/g, "<br>");
        detailsContainer.innerHTML = `
            <h3>${companyDetails.organization}</h3>
            <h4>${companyDetails.position}</h4>
            <p class='period'>${companyDetails.start} - ${companyDetails.end}</p>
            <p class='exp-details'>${formattedDetail}</p>
          `;
      });
    });

    // Select the first company as default
    const firstCompany = companiesList.querySelector("li");
    firstCompany.click();
  })
  .catch((error) => {
    console.error("Error fetching data:", error);
  });
