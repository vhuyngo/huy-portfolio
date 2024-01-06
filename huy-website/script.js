/* reusing header and footer */
fetch('../shared/header.html')
    .then(response => response.text())
    .then(html => document.getElementById('header').innerHTML = html);

fetch('../shared/footer.html')
    .then(response => response.text())
    .then(html => document.getElementById('footer').innerHTML = html);

// highlight active tab
document.addEventListener('DOMContentLoaded', function() {
    // take path after /
    var curPage = window.location.pathname.split('/').pop();
    // get all links with nav
    var navLinks = document.querySelectorAll('nav a');

    /* check each link to see if it matches current link
       then add active class */
    navLinks.forEach(function(link) {
        if(link.getAttribute('href') === curPage) {
            link.classList.add('active');
        }
    })
})

// drop-down auto-scroll
document.addEventListener('DOMContentLoaded', function() {
    var dropdownLinks = document.querySelectorAll('.dropdown-content a');

    dropdownLinks.forEach(function(link) {
        link.addEventListener('click', function(event) {
            event.preventDefault();

            // get target section ID from link's href
            var targetSectionID = link.getAttribute('href').substring(1);
            // scroll
            document.getElementById(targetSectionID).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});


/* needs to implement db or ssl
// submit feedback and display
function submitFeedback() {
    const feedbackInput = document.getElementById('feedback-input');
    const feedbackList = document.getElementById('feedback-list');

    const feedbackText = feedbackInput.value.trim();
    if (feedbackText !== '') { // checking that text exists
        // create a div with class and content
        const feedbackItem = document.createElement('div');
        feedbackItem.className = 'feedback-item';
        feedbackItem.textContent = feedbackText;

        // add to list and reset input
        feedbackList.appendChild(feedbackItem);
        feedbackInput.value = ''; //
    }
}
*/