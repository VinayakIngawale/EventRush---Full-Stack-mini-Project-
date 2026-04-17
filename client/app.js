document.addEventListener('DOMContentLoaded', () => {

    const API_URL = 'http://localhost:5000/api';
    const token = localStorage.getItem('token');
    const loginLink = document.getElementById('login-link');

    // Update nav link based on login status for all pages
    if (loginLink) {
        if (token) {
            loginLink.textContent = 'Logout';
            loginLink.href = '#'; // Make it a non-navigating link
            loginLink.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('token');
                window.location.href = 'login.html';
            });
        }
    }

    // --- LOGIC FOR THE MAIN EVENTS PAGE (events.html) ---
    const eventsContainer = document.getElementById('events-list');
    if (eventsContainer) {
        async function fetchEvents() {
            try {
                const response = await fetch(`${API_URL}/events`);
                if (!response.ok) throw new Error('Network response was not ok');
                const events = await response.json();
                displayEvents(events);
            } catch (error) {
                eventsContainer.innerHTML = '<p>Could not load events. Please try again later.</p>';
                console.error('Failed to fetch events:', error);
            }
        }

        function displayEvents(events) {
            eventsContainer.innerHTML = ''; // Clear loading text
            if (events.length === 0) {
                eventsContainer.innerHTML = '<p>No upcoming events found.</p>';
                return;
            }
            events.forEach(event => {
                const eventCard = document.createElement('div');
                eventCard.className = 'event-card';
                
                const eventDate = new Date(event.date).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'long', year: 'numeric'
                });

                eventCard.innerHTML = `
                    <img src="${event.imageUrl}" alt="${event.title}">
                    <div class="event-card-content">
                        <h3>${event.title}</h3>
                        <p><strong>Sport:</strong> ${event.sport}</p>
                        <p><strong>Location:</strong> ${event.location}</p>
                        <p><strong>Date:</strong> ${eventDate}</p>
                        <a href="event-details.html?id=${event._id}" class="details-button">View Details</a>
                    </div>
                `;
                eventsContainer.appendChild(eventCard);
            });
        }
        fetchEvents();
    }

    // --- LOGIC FOR THE EVENT DETAILS PAGE (event-details.html) ---
    const eventDetailContainer = document.getElementById('event-detail-container');
    if (eventDetailContainer) {
        const eventId = new URLSearchParams(window.location.search).get('id');

        async function fetchEventDetails() {
            if (!eventId) {
                eventDetailContainer.innerHTML = '<p>Event ID is missing from URL.</p>';
                return;
            }
            try {
                const response = await fetch(`${API_URL}/events/${eventId}`);
                const event = await response.json();
                displayEventDetails(event);
            } catch (error) {
                console.error('Failed to fetch event details:', error);
                eventDetailContainer.innerHTML = '<p>Could not load event details.</p>';
            }
        }

        function displayEventDetails(event) {
            const eventDate = new Date(event.date).toLocaleDateString('en-IN', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
            });
            eventDetailContainer.innerHTML = `
                <img src="${event.imageUrl}" alt="${event.title}" class="event-detail-image">
                <h1>${event.title}</h1>
                <div class="event-info">
                    <p><strong>Sport:</strong> ${event.sport}</p>
                    <p><strong>Location:</strong> ${event.location}</p>
                    <p><strong>Date:</strong> ${eventDate}</p>
                    <p><strong>Participants:</strong> ${event.participants.length}</p>
                </div>
                <p class="event-description">${event.description}</p>
                <button id="participate-btn" class="cta-button">Participate</button>
            `;

            // Add event listener to the newly created button
            const participateBtn = document.getElementById('participate-btn');
            participateBtn.addEventListener('click', async () => {
                const token = localStorage.getItem('token');
                if (!token) {
                    alert('You must be logged in to participate!');
                    window.location.href = 'login.html';
                    return;
                }

                try {
                    const res = await fetch(`${API_URL}/events/${eventId}/participate`, {
                        method: 'POST',
                        headers: { 'x-auth-token': token }
                    });
                    const data = await res.json();
                    if (!res.ok) {
                        throw new Error(data.msg || 'Could not register for the event.');
                    }

                    participateBtn.textContent = 'Registered!';
                    participateBtn.disabled = true;
                    alert('You have successfully registered for the event!');
                    // Update the participant count on the page
                    document.querySelector('.event-info p:last-child').textContent = `Participants: ${data.participants.length}`;

                } catch (error) {
                    alert(error.message);
                }
            });
        }
        fetchEventDetails();
    }


    // --- LOGIC FOR THE LOGIN/REGISTER PAGE (login.html) ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        const registerForm = document.getElementById('register-form');
        const showRegisterLink = document.getElementById('show-register');
        const showLoginLink = document.getElementById('show-login');

        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.classList.add('hidden');
            registerForm.classList.remove('hidden');
        });

        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            registerForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
        });

        // Handle Registration
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const messageEl = registerForm.querySelector('.form-message');
            const username = document.getElementById('register-username').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;

            try {
                const res = await fetch(`${API_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.msg || 'Registration failed');
                
                messageEl.textContent = 'Registration successful! Please login.';
                messageEl.className = 'form-message success';
                setTimeout(() => {
                    registerForm.classList.add('hidden');
                    loginForm.classList.remove('hidden');
                    messageEl.textContent = '';
                }, 2000);

            } catch (err) {
                messageEl.textContent = err.message;
                messageEl.className = 'form-message error';
            }
        });

        // Handle Login
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const messageEl = loginForm.querySelector('.form-message');
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            try {
                const res = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.msg || 'Login failed');
                
                localStorage.setItem('token', data.token);
                messageEl.textContent = 'Login successful! Redirecting...';
                messageEl.className = 'form-message success';
                setTimeout(() => { window.location.href = 'events.html' }, 1500);

            } catch (err) {
                messageEl.textContent = err.message;
                messageEl.className = 'form-message error';
            }
        });
    }
});