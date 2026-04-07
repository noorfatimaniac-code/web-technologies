console.log("JS running");


const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".navbtn");

hamburger.addEventListener("click", () => {
  console.log("clicked");
  navMenu.classList.toggle("active");
});

const links = document.querySelectorAll(".navbtn a");

links.forEach(link => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("active");
  });
});





$(document).ready(function () {

  $.ajax({
    url: "https://fakestoreapi.com/products?limit=4",
    method: "GET",
    success: function (data) {

      const container = $(".product-grid");
      container.empty(); // clear old content

      data.forEach(product => {

        const card = `
          <div class="pr1">
            <img src="${product.image}" alt="">
            <h2>${product.title.substring(0, 20)}...</h2>
            <p>$${product.price}</p>
            <button class="quick-view" 
              data-title="${product.title}"
              data-desc="${product.description}"
              data-rating="${product.rating.rate}">
              Quick View
            </button>
          </div>
        `;

        container.append(card);
      });

    }
  });

});


// open modal
$(document).on("click", ".quick-view", function () {

  $("#modal-title").text($(this).data("title"));
  $("#modal-desc").text($(this).data("desc"));
  $("#modal-rating").text("Rating: " + $(this).data("rating"));

  $("#modal").fadeIn();
});

// close modal
$(".close").click(function () {
  $("#modal").fadeOut();
});