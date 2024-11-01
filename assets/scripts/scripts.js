const header = document.querySelector("header");
let lastScrollY = 0;
const threshold = 1;
header.classList.remove("hidden");

window.addEventListener("scroll", () => {
  const currentScrollY = window.scrollY;

  if (currentScrollY > lastScrollY + threshold) {
    header.classList.add("hidden");
  } else if (currentScrollY < lastScrollY - threshold) {
    header.classList.remove("hidden");
  }

  lastScrollY = currentScrollY;
});

// Effect on appearing NAV
const navElement = document.querySelector("nav");

setTimeout(() => {
  navElement.classList.add("loaded");
}, 100);

const navLinks = document.querySelectorAll("nav a");

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.forEach((link) => link.classList.remove("active"));
    link.classList.add("active");
  });
});

const companiesList = document.querySelector(".companies");
const detailsContainer = document.querySelector(".details");

const categoryList = document.querySelector(".category");
const toolsContainer = document.querySelector(".tools");

const degreeList = document.querySelector(".degree");
const degreeContainer = document.querySelector(".degree-details");

fetch("/assets/json/data.json")
  .then((response) => response.json())
  .then((data) => {
    // BASIC INFO
    document.getElementById("name").textContent = data.name;
    document.getElementById("profession").textContent = data.profession;
    document.getElementById("bio").textContent = data.bio;
    document.getElementById("contact-email").textContent = data.contact[0];

    // EXPERIENCE
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

    // SKILLS
    data.skill.forEach((skill, index) => {
      const listItem = document.createElement("li");
      listItem.textContent = skill.category;
      listItem.dataset.categoryIndex = index;
      categoryList.appendChild(listItem);

      listItem.addEventListener("click", () => {
        // Remove the 'selected' class from all list items
        const selectedItem = document.querySelector(".category li.selected");

        if (selectedItem) {
          selectedItem.classList.remove("selected");
        }

        // Add the 'selected' class to the clicked list item
        listItem.classList.add("selected");

        const categoryIndex = listItem.dataset.categoryIndex;
        const categoryDetails = data.skill[categoryIndex];

        // Clear the tools container before adding new items
        toolsContainer.innerHTML = `<h4>${categoryDetails.category}</h4>`;

        // Create a list element for each tool
        const toolsList = document.createElement("ul");
        categoryDetails.tools.forEach((tool) => {
          const toolItem = document.createElement("li");
          // toolItem.textContent = tool;
          toolItem.innerHTML = `&#10146; ${tool}`;
          toolsList.appendChild(toolItem);
        });

        // Add the list of tools to the tools container
        toolsContainer.appendChild(toolsList);
      });
    });

    // Education
    data.education.forEach((degree, index) => {
      const listItem = document.createElement("li");
      listItem.textContent = degree.type;
      listItem.dataset.degreeIndex = index;
      degreeList.appendChild(listItem);
      listItem.addEventListener("click", () => {
        // Remove the 'selected' class from all list items
        const selectedItem = document.querySelector(".degree li.selected");
        if (selectedItem) {
          selectedItem.classList.remove("selected");
        }

        // Add the 'selected' class to the clicked list item
        listItem.classList.add("selected");
        const degreeIndex = listItem.dataset.degreeIndex;
        const degreeDetails = data.education[degreeIndex];
        degreeContainer.innerHTML = `
          <h4>${degreeDetails.institute}</h4>
          <h3>${degreeDetails.degree}</h3>
          <i>${degreeDetails.timeline}</i>
        `;
      });
    });

    // Select the first company as default
    const firstCategory = categoryList.querySelector("li");
    firstCategory.click();

    // Select the first Skill as default
    const firstCompany = companiesList.querySelector("li");
    firstCompany.click();

    // Select the first degree as default
    const firstdegree = degreeList.querySelector("li");
    firstdegree.click();
  })
  .catch((error) => {
    console.error("Error fetching data:", error);
  });
