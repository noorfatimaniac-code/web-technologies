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