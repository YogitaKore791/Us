/* =========================================================
   SCRAPBOOK COVER
========================================================= */

const scrapbookIntro = document.getElementById("scrapbookIntro");
const openScrapbookButton = document.getElementById("openScrapbook");

if (scrapbookIntro && openScrapbookButton) {
    openScrapbookButton.addEventListener("click", function () {
        if (scrapbookIntro.classList.contains("opening")) return;

        scrapbookIntro.classList.add("opening");

        setTimeout(function () {
            scrapbookIntro.classList.add("cover-opening");
        }, 420);

        setTimeout(function () {
            scrapbookIntro.classList.add("finished");

            document.body.classList.remove("scrapbook-closed");
            document.body.classList.add("scrapbook-open");
        }, 1450);
    });
}


/* =========================================================
   SINGLE PAGE SCRAPBOOK
========================================================= */

const spreads = Array.from(document.querySelectorAll(".book-spread"));
const pages = Array.from(document.querySelectorAll(".book-page"));

const previousButton = document.getElementById("prevBtn");
const nextButton = document.getElementById("nextBtn");
const pageIndicator = document.getElementById("pageIndicator");

const storyWrapper = document.querySelector(".story-wrapper");

let currentPageIndex = 0;
let isTurning = false;


/* =========================================================
   HELPERS
========================================================= */

function spreadForPage(page) {
    return page.closest(".book-spread");
}


function removeFlipClone() {
    const oldWrapper =
        document.querySelector(".flip-clone-spread");

    if (oldWrapper) {
        oldWrapper.remove();
    }
}


function clearPageState() {
    removeFlipClone();

    spreads.forEach(function (spread) {
        spread.classList.remove(
            "active",
            "flip-host",
            "page-turn-next-out",
            "page-turn-next-in",
            "page-turn-prev-out",
            "page-turn-prev-in",
            "turn-next-out",
            "turn-next-in",
            "turn-prev-out",
            "turn-prev-in"
        );
    });

    pages.forEach(function (page) {
        page.classList.remove(
            "current-page",
            "turning-page",
            "reveal-page",
            "flip-next-out",
            "flip-prev-out",
            "flip-prev-start",
            "page-underneath"
        );
    });
}


function updateNavigation() {
    if (pageIndicator) {
        pageIndicator.textContent = String(currentPageIndex + 1);
    }

    if (previousButton) {
        previousButton.disabled =
            currentPageIndex === 0 || isTurning;
    }

    if (nextButton) {
        nextButton.disabled =
            currentPageIndex === pages.length - 1 || isTurning;
    }
}


/* =========================================================
   SHOW NORMAL FLAT PAGE
========================================================= */

function showPage(index) {
    if (!pages[index]) return;

    clearPageState();

    const page = pages[index];
    const spread = spreadForPage(page);

    spread.classList.add("active");
    page.classList.add("current-page");

    currentPageIndex = index;

    updateNavigation();
}


/* =========================================================
   CREATE TEMPORARY PAPER COPY

   IMPORTANT:
   We animate THIS copy.

   The real scrapbook pages stay completely flat.
========================================================= */

function createPageClone(page) {
    removeFlipClone();

    const pageRect = page.getBoundingClientRect();
    const wrapperRect = storyWrapper.getBoundingClientRect();

const originalSpread = spreadForPage(page);

/*
   Clone the WHOLE chapter wrapper first.

   This preserves selectors such as:
   #chapter4 ...
   #chapter5 ...
   #chapter6 ...

   so photos keep exactly the same size/crop
   while the temporary page is flipping.
*/
const spreadClone = originalSpread.cloneNode(true);

spreadClone.classList.remove("active");
spreadClone.classList.add("flip-clone-spread");


/*
   Find the matching page inside our copied chapter.
*/
const originalPages =
    Array.from(originalSpread.querySelectorAll(".book-page"));

const pagePosition =
    originalPages.indexOf(page);

const clonedPages =
    Array.from(spreadClone.querySelectorAll(".book-page"));

const clone =
    clonedPages[pagePosition];


/*
   Remove the other page from this temporary chapter copy.
*/
clonedPages.forEach(function (clonedPage, index) {

    if (index !== pagePosition) {
        clonedPage.remove();
    }

});


clone.classList.remove(
    "current-page",
    "turning-page",
    "reveal-page",
    "flip-next-out",
    "flip-prev-out",
    "flip-prev-start",
    "page-underneath"
);

clone.classList.add("page-flip-clone");

    /*
       Match the exact visible position and size
       of the real scrapbook page.
    */

    clone.style.left =
        (pageRect.left - wrapperRect.left) + "px";

    clone.style.top =
        (pageRect.top - wrapperRect.top) + "px";

    clone.style.width = pageRect.width + "px";
    clone.style.height = pageRect.height + "px";

    spreadClone.appendChild(clone);
storyWrapper.appendChild(spreadClone);

    clone._flipWrapper = spreadClone;

return clone;
}


/* =========================================================
   NEXT PAGE
   RIGHT → LEFT
========================================================= */

function nextPage() {
    if (isTurning) return;
    if (currentPageIndex >= pages.length - 1) return;

    isTurning = true;
    updateNavigation();

    const oldPage = pages[currentPageIndex];
    const newIndex = currentPageIndex + 1;
    const newPage = pages[newIndex];

    /*
       1. Make a visual copy of the current page BEFORE
          changing anything.
    */

    const clone = createPageClone(oldPage);

    /*
       2. Immediately put the real next page flat underneath.
    */

    clearPageStateExceptClone();

    const newSpread = spreadForPage(newPage);

    newSpread.classList.add("active");
    newPage.classList.add("current-page");

    /*
       3. Force the clone to exist in its flat state first.
    */

    void clone.offsetWidth;

    /*
       4. Turn ONLY the temporary paper.
    */

    requestAnimationFrame(function () {
        clone.classList.add("clone-turn-next");
    });

    /*
       5. Remove temporary paper after animation.
    */

    clone.addEventListener(
        "animationend",
        function () {
            if (clone._flipWrapper) {
    clone._flipWrapper.remove();
} else {
    clone.remove();
}

            currentPageIndex = newIndex;
            isTurning = false;

            updateNavigation();
        },
        { once: true }
    );
}


/* =========================================================
   PREVIOUS PAGE
========================================================= */

function previousPage() {
    if (isTurning) return;
    if (currentPageIndex <= 0) return;

    isTurning = true;
    updateNavigation();

    const previousIndex = currentPageIndex - 1;

    const previousPageElement = pages[previousIndex];
    const previousSpread = spreadForPage(previousPageElement);

    /*
       We want the previous sheet to travel BACK from
       the left and settle flat on the scrapbook.
    */

    const clone = createPageClone(previousPageElement);

    clone.classList.add("clone-prev-start");

    /*
       Keep current real page flat underneath.
    */

    void clone.offsetWidth;

    requestAnimationFrame(function () {
        clone.classList.add("clone-turn-prev");
    });

    clone.addEventListener(
        "animationend",
        function () {
            if (clone._flipWrapper) {
    clone._flipWrapper.remove();
} else {
    clone.remove();
}

            clearPageState();

            previousSpread.classList.add("active");
            previousPageElement.classList.add("current-page");

            currentPageIndex = previousIndex;
            isTurning = false;

            updateNavigation();
        },
        { once: true }
    );
}


/* =========================================================
   CLEAR REAL PAGE STATES WITHOUT REMOVING CLONE
========================================================= */

function clearPageStateExceptClone() {
    spreads.forEach(function (spread) {
        spread.classList.remove(
            "active",
            "flip-host",
            "page-turn-next-out",
            "page-turn-next-in",
            "page-turn-prev-out",
            "page-turn-prev-in",
            "turn-next-out",
            "turn-next-in",
            "turn-prev-out",
            "turn-prev-in"
        );
    });

    pages.forEach(function (page) {
        page.classList.remove(
            "current-page",
            "turning-page",
            "reveal-page",
            "flip-next-out",
            "flip-prev-out",
            "flip-prev-start",
            "page-underneath"
        );
    });
}


/* =========================================================
   BUTTONS
========================================================= */

if (nextButton) {
    nextButton.addEventListener("click", nextPage);
}

if (previousButton) {
    previousButton.addEventListener("click", previousPage);
}


/* =========================================================
   BACK TO COVER
========================================================= */

const backToCoverButton =
    document.getElementById("backToCover");

if (backToCoverButton) {
    backToCoverButton.addEventListener("click", function () {
        showPage(0);

        if (scrapbookIntro) {
            scrapbookIntro.classList.remove(
                "finished",
                "opening",
                "cover-opening"
            );
        }

        document.body.classList.remove("scrapbook-open");
        document.body.classList.add("scrapbook-closed");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}


/* =========================================================
   START PAGE
========================================================= */

showPage(0);