// Effect on appearing NAV
const navElement = document.querySelector("nav");

setTimeout(() => {
  navElement.classList.add("loaded");
}, 100);

const navLinks = document.querySelectorAll("nav a");

navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    const href = link.getAttribute("href");

    if (href.startsWith("#")) {
      e.preventDefault();

      navLinks.forEach((link) => link.classList.remove("active"));
      link.classList.add("active");

      const targetElement = document.querySelector(href);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop,
          behavior: "smooth",
        });
      }
    }
  });
});

window.addEventListener("load", () => {
  const hash = window.location.hash;
  if (hash) {
    const targetElement = document.querySelector(hash);
    if (targetElement) {
      // Scroll to the target element
      window.scrollTo({
        top: targetElement.offsetTop,
        behavior: "smooth",
      });

      // Highlight the corresponding navigation link
      const targetLink = document.querySelector(`nav a[href="${hash}"]`);
      if (targetLink) {
        targetLink.classList.add("active");
      }
    }
  }
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

        const detailList = companyDetails.detail
          .map((item) => `<li>- ${item}</li>`)
          .join("");

        detailsContainer.innerHTML = `
          <h3>${companyDetails.organization}</h3>
          <h4>${companyDetails.position}</h4>
          <p class='period'>${companyDetails.start} - ${companyDetails.end}</p>
          <div class='exp-details'>${detailList}</div>
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
        const toolsList = document.createElement("div");
        categoryDetails.tools.forEach((tool) => {
          const toolItem = document.createElement("li");
          toolItem.innerHTML = `- ${tool}`;
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
          <i>${degreeDetails.start} - ${degreeDetails.end}</i>
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
