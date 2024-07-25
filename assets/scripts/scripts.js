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
