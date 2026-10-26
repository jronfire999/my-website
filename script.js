const cards = document.querySelectorAll(".flip-card");

cards.forEach((card) => {
  function flipCard() {
    const wasFlipped = card.classList.contains("flipped");

    cards.forEach((item) => {
      item.classList.remove("flipped");
    });

    if (!wasFlipped) {
      card.classList.add("flipped");
    }
  }

  card.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      return;
    }

    flipCard();
  });

  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      flipCard();
    }
  });
});