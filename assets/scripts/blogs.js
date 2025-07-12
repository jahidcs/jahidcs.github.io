fetch("/assets/json/posts.json")
  .then((res) => res.json())
  .then((posts) => {
    const container = document.getElementById("allBlogList");

    posts.forEach((post) => {
      const html = `
        <a href="/blog/posts/${post.slug}.html" class="blog-card">
          <div class="blog-meta">
            <span class="blog-date">${new Date(post.date).toLocaleDateString(
              "en-GB",
              {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }
            )}</span>
            <span class="blog-tags">${post.tags
              .map((tag) => `<span class="tag">${tag}</span>`)
              .join(" ")}</span>
          </div>
          <h3 class="blog-title">${post.title}</h3>
          <p class="blog-summary">${post.summary}</p>
        </a>
      `;
      container.innerHTML += html;
    });
  });
