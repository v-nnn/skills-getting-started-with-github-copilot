document.addEventListener('DOMContentLoaded', function() {
    // Fetch activities from the API
    fetchActivities();
    
    // Add event listener for the signup form
    document.getElementById('signup-form').addEventListener('submit', signupForActivity);
});

async function fetchActivities() {
    try {
        const response = await fetch('/activities');
        const activities = await response.json();
        
        // Populate the activities list and dropdown
        displayActivities(activities);
        populateActivityDropdown(activities);
    } catch (error) {
        console.error('Error fetching activities:', error);
        document.getElementById('activities-list').innerHTML = '<p>Error loading activities. Please try again later.</p>';
    }
}

function displayActivities(activities) {
    const activitiesList = document.getElementById('activities-list');
    activitiesList.innerHTML = '';
    
    for (const [name, details] of Object.entries(activities)) {
        const card = document.createElement('div');
        card.className = 'activity-card';
        
        // Create participant list as bulleted items
        let participantsList = '';
        if (details.participants && details.participants.length > 0) {
            participantsList = '<h5>Current Participants:</h5><ul class="participants-list">';
            details.participants.forEach(participant => {
                participantsList += `<li>${participant}</li>`;
            });
            participantsList += '</ul>';
        } else {
            participantsList = '<p><em>No participants yet</em></p>';
        }
        
        // Calculate available spots
        const availableSpots = details.max_participants - details.participants.length;
        
        card.innerHTML = `
            <h4>${name}</h4>
            <p>${details.description}</p>
            <p><strong>Schedule:</strong> ${details.schedule}</p>
            <p><strong>Available Spots:</strong> ${availableSpots} of ${details.max_participants}</p>
            <div class="participants-section">
                ${participantsList}
            </div>
        `;
        
        activitiesList.appendChild(card);
    }
}

function populateActivityDropdown(activities) {
    const activitySelect = document.getElementById('activity');
    // Clear all options except the first one
    activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';
    
    for (const activityName of Object.keys(activities)) {
        const option = document.createElement('option');
        option.value = activityName;
        option.textContent = activityName;
        activitySelect.appendChild(option);
    }
}

async function signupForActivity(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const activityName = document.getElementById('activity').value;
    const messageDiv = document.getElementById('message');
    
    if (!email || !activityName) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    try {
        const response = await fetch(`/activities/${encodeURIComponent(activityName)}/signup?email=${encodeURIComponent(email)}`, {
            method: 'POST'
        });
        
        if (response.ok) {
            const result = await response.json();
            showMessage(result.message, 'success');
            // Refresh the activities to show the updated participant list
            fetchActivities();
        } else {
            const error = await response.json();
            showMessage(error.detail, 'error');
        }
    } catch (error) {
        console.error('Error signing up:', error);
        showMessage('An error occurred. Please try again later.', 'error');
    }
}

function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.classList.remove('hidden');
    
    // Hide the message after 5 seconds
    setTimeout(() => {
        messageDiv.classList.add('hidden');
    }, 5000);
}
