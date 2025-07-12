// ===== Render resume to the screen ===== //
fetch("../assets/json/data.json")
  .then((res) => res.json())
  .then((data) => {
    const container = document.getElementById("resume-content");

    const contactLinks = [
      data.contact.email &&
        `<a href="mailto:${data.contact.email}" <a style="color: #555; text-decoration: none;">${data.contact.email}</a>`,
      data.contact.linkedin &&
        `<a href="https://${data.contact.linkedin}" target="_blank" <a style="color: #555; text-decoration: none;">${data.contact.linkedin}</a>`,
      data.contact.phone && `<span>${data.contact.phone}</span>`,
      data.contact.github &&
        `<a href="https://${data.contact.github}" target="_blank" <a style="color: #555; text-decoration: none;">${data.contact.github}</a>`,
      data.contact.portfolio &&
        `<a href="https://${data.contact.portfolio}" target="_blank" <a style="color: #555; text-decoration: none;">${data.contact.portfolio}</a>`,
    ]
      .filter(Boolean)
      .join(' <span style="color: #aaa;"> | </span> ');

    const header = `
      <h1>${data.name}</h1>
      <h2>${data.profession}</h2>
      <p style="text-align: center; font-size: 13px; color: #555;">${contactLinks}</p>
    `;

    const summary = `
      <div class="section">
        <h3>Summary</h3>
        <p>${data.resume_bio}</p>
      </div>
    `;

    const experience = `
        <div class="section">
        <h3>Experience</h3>
        ${data.experience
          .slice(0, 3)
          .map(
            (exp) => `
            <div>
            <p><strong>${exp.position} — ${exp.organization}</strong></p>
            <div class="meta-row">
                <span class="meta-left">${exp.start} – ${exp.end}</span>
                <span class="meta-right">${exp.location}</span>
            </div>
            <ul>${exp.detail.map((item) => `<li>${item}</li>`).join("")}</ul>
            </div>
        `
          )
          .join("")}
        </div>
    `;

    const education = `
        <div class="section">
        <h3>Education</h3>
        ${data.education
          .map(
            (edu) => `
            <div>
            <p><strong>${edu.institute}</strong> — ${edu.degree}</p>
            <div class="meta-row">
                <span class="meta-left">${edu.start} – ${edu.end}</span>
                <span class="meta-right">${edu.location}</span>
            </div>
            </div>
        `
          )
          .join("")}
        </div>
    `;

    const allSkills = data.skill.flatMap((skill) => skill.tools);
    const uniqueSkills = [...new Set(allSkills)];
    const skills = `
      <div class="section">
        <h3>Skills</h3>
        <p>${uniqueSkills.join(", ")}</p>
      </div>
    `;

    container.innerHTML = header + summary + skills + experience + education;
  });

// ===== Generate PDF ===== //
document
  .getElementById("download-resume")
  .addEventListener("click", async () => {
    const res = await fetch("../assets/json/data.json");
    const data = await res.json();

    const contactList = [
      data.contact.email,
      data.contact.linkedin,
      data.contact.phone,
      data.contact.github,
      data.contact.portfolio,
    ]
      .filter(Boolean)
      .join(" | ");

    const allSkills = data.skill.flatMap((skill) => skill.tools);
    const uniqueSkills = [...new Set(allSkills)];

    const section = (title) => ({
      stack: [
        {
          text: title,
          style: "sectionHeader",
          alignment: "center",
          margin: [0, 0, 0, 4],
        },
        {
          table: {
            widths: ["*"],
            body: [[""]],
          },
          layout: {
            hLineWidth: function (i, node) {
              return i === 1 ? 0.5 : 0; // only draw bottom line
            },
            hLineColor: () => "#cccccc",
            vLineWidth: () => 0,
            paddingTop: () => 0,
            paddingBottom: () => 0,
            paddingLeft: () => 0,
            paddingRight: () => 0,
          },
          margin: [0, 0, 0, 12],
        },
      ],
      margin: [0, 16, 0, 0],
    });

    const docDefinition = {
      content: [
        { text: data.name, style: "header" },
        { text: data.profession, style: "subheader" },
        { text: contactList, style: "contact" },

        section("Summary"),
        { text: data.resume_bio, style: "paragraph" },

        section("Skills"),
        { text: uniqueSkills.join(", "), style: "paragraph" },

        section("Experience"),
        ...data.experience.slice(0, 3).flatMap((exp) => [
          { text: `${exp.position} — ${exp.organization}`, style: "jobTitle" },
          {
            columns: [
              {
                text: `${exp.start} – ${exp.end}`,
                style: "jobMeta",
                width: "50%",
              },
              {
                text: exp.location,
                style: "jobMeta",
                alignment: "right",
                width: "50%",
              },
            ],
          },
          { ul: exp.detail.slice(0, 3), style: "bulletList" },
        ]),

        section("Education"),
        ...data.education.map((edu) => [
          { text: `${edu.institute} — ${edu.degree}`, style: "jobTitle" },
          {
            columns: [
              {
                text: `${edu.start} – ${edu.end}`,
                style: "jobMeta",
                width: "50%",
              },
              {
                text: edu.location,
                style: "jobMeta",
                alignment: "right",
                width: "50%",
              },
            ],
          },
        ]),
      ],
      styles: {
        header: {
          fontSize: 24,
          bold: true,
          alignment: "center",
          margin: [0, 0, 0, 4],
        },
        subheader: {
          fontSize: 18,
          bold: true,
          alignment: "center",
          margin: [0, 0, 0, 6],
          color: "#777",
        },
        contact: {
          //   font: "RobotoMono",
          fontSize: 10,
          alignment: "center",
          margin: [0, 0, 0, 12],
          color: "#555",
        },
        sectionHeader: {
          fontSize: 13,
          bold: true,
          margin: [0, 0, 0, 4],
          color: "#000",
        },
        jobTitle: {
          fontSize: 11,
          bold: true,
          color: "#333",
          margin: [0, 6, 0, 0],
        },
        jobMeta: {
          fontSize: 10,
          italics: true,
          color: "#555",
          margin: [0, 0, 0, 3],
        },
        bulletList: {
          fontSize: 10,
          margin: [0, 0, 0, 8],
          color: "#333",
        },
        paragraph: {
          fontSize: 10,
          lineHeight: 1.4,
          margin: [0, 0, 0, 10],
          color: "#222",
        },
      },
      defaultStyle: {
        font: "Roboto",
      },
      pageMargins: [30, 30, 30, 30], // compact margins [left, top, right, bottom]
    };

    pdfMake.createPdf(docDefinition).download("Jahid_Backend_Resume.pdf");
  });
