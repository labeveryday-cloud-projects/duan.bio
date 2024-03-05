
const shareButtons = document.querySelectorAll('.tile-share-button')

const themeToggleBtn = document.querySelector('.share-button');

async function copyText(e) {
    // prevent button going to the site
    e.preventDefault()
    // get the value of whatever I click
    const link = this.getAttribute('link')
    console.log(link)
    try {
        await navigator.clipboard.writeText(link)
        alert("Copied to clipboard: " + link)
    } catch (err) {
        console.error('Failed to copy: ', err)
    }
}

shareButtons.forEach(shareButton => 
    shareButton.addEventListener('click', copyText))

// JavaScript for the counter

// Selects the .counter-number element from index.html file
const counter = document.querySelector('.counter-number');
async function updateCounter() {
    // Fetch the current number of views from the serverless function
    let response = await fetch('enter api gateway info here');
    // Stores the response as a JSON object
    let data = await response.json();
    // Updates the .counter-number element with the current number of views
    counter.innerHTML = `Visits: ${data}`;
}

// state
const theme = localStorage.getItem('theme');

// on mount
theme && document.body.classList.add(theme);

// handlers
const handleThemeToggle = () => {
  document.body.classList.toggle('dark-mode');
  if (document.body.classList.contains('dark-mode')) {
    localStorage.setItem('theme', 'dark-mode');
  } else {
    localStorage.removeItem('theme');
  }
};

// events
themeToggleBtn.addEventListener('click', handleThemeToggle);


updateCounter();