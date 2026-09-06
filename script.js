window.addEventListener("scroll", () => {

const navbar = document.querySelector(".navbar");

if(window.scrollY > 50){
    navbar.style.background = "rgba(2,8,23,0.95)";
    navbar.style.boxShadow = "0 5px 20px rgba(0,0,0,0.4)";
}
else{
    navbar.style.background = "rgba(2,8,23,0.85)";
    navbar.style.boxShadow = "none";
}

});


// ================= ACTIVE NAV LINKS =================

const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll(".nav-links a");

window.addEventListener("scroll", () => {

let current = "";

sections.forEach(section => {

const sectionTop = section.offsetTop - 150;
const sectionHeight = section.offsetHeight;

if(pageYOffset >= sectionTop){
current = section.getAttribute("id");
}

});

navLinks.forEach(link => {

link.classList.remove("active");

if(link.getAttribute("href").includes(current)){
link.classList.add("active");
}

});

});


// ================= SCROLL REVEAL =================

const revealElements = document.querySelectorAll(
".about-card,.skill-card,.experience-card,.project-card,.certificate-card,.contact-card"
);

function reveal(){

revealElements.forEach(element => {

const windowHeight = window.innerHeight;
const revealTop = element.getBoundingClientRect().top;

if(revealTop < windowHeight - 100){
element.style.opacity = "1";
element.style.transform = "translateY(0)";
}

});

}

revealElements.forEach(element => {

element.style.opacity = "0";
element.style.transform = "translateY(50px)";
element.style.transition = "all 0.8s ease";

});

window.addEventListener("scroll", reveal);

reveal();


// ================= TYPING EFFECT =================

const typingElement = document.querySelector(".hero-content h2");

const words = [
"Data Analyst",
"Power BI Developer",
"SQL Developer",
"Python Enthusiast"
];

let wordIndex = 0;
let charIndex = 0;
let deleting = false;

function typeEffect(){

const currentWord = words[wordIndex];

if(!deleting){

typingElement.textContent =
currentWord.substring(0,charIndex + 1);

charIndex++;

if(charIndex === currentWord.length){

deleting = true;

setTimeout(typeEffect,1500);

return;

}

}

else{

typingElement.textContent =
currentWord.substring(0,charIndex - 1);

charIndex--;

if(charIndex === 0){

deleting = false;

wordIndex++;

if(wordIndex === words.length){
wordIndex = 0;
}

}

}

setTimeout(typeEffect,deleting ? 80 : 120);

}

typeEffect();


// ================= HERO IMAGE FLOAT =================

const heroImage = document.querySelector(".hero-image img");

let floatPosition = 0;
let direction = 1;

setInterval(() => {

floatPosition += direction;

heroImage.style.transform =
`translateY(${floatPosition}px)`;

if(floatPosition >= 10){
direction = -1;
}

if(floatPosition <= -10){
direction = 1;
}

},60);
