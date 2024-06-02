// Document for the event listeners for the buttons
document.addEventListener('DOMContentLoaded', function() {
    // getting all of the elements
    var registerButton = document.getElementById('register_button')
    var useAppButton = document.getElementById('useapp_button')
    var signupButton = document.getElementById('signup_button')
    var weatherButton = document.getElementById('weather_button')
    var returnButton = document.getElementById('return_button')
    var seeUsersButton = document.getElementById('see_users_button')
    var removeUserButton = document.getElementById('remove_button')

    // checking if all buttons exist before we add event listeners and functionality to them.
    if (registerButton) {
        registerButton.addEventListener('click', function() {
            console.log('Register button clicked')
            // Add your register logic here
            window.location.href = '/signup'
        });
    }

    if (signupButton) {
        signupButton.addEventListener('click', function() {
            let username = document.getElementById('userInput').value
            let password = document.getElementById('passInput').value
            if (username === '' || password === '') {
                alert('Please fill in both username and password fields.')
                return
            }
            // sending the user to the createUser page with the username and password as query parameters
            window.location.href = '/createUser?username=' + encodeURIComponent(username) + '&password=' + encodeURIComponent(password)
        });
    }

    if (useAppButton){
        useAppButton.addEventListener('click', function(){
            window.location.href = '/weatherApp'
        })
    }

    if (weatherButton){
        weatherButton.addEventListener('click', function(){
            let city = document.getElementById('cityInput').value
            if (city === ''){
                alert('Please enter a city.')
                return
            }
            // sending the user to the weatherApp page with the city as a query parameter
            window.location.href = '/weatherApp?city=' + encodeURIComponent(city)
        })
    }

    if (returnButton){
        returnButton.addEventListener('click', function(){
            window.location.href = '/index.html'
        })
    }

    if (seeUsersButton){
        seeUsersButton.addEventListener('click', function(){
            window.location.href = '/users'
        })
    }

    if (removeUserButton){
        removeUserButton.addEventListener('click', function(){
            let username = document.getElementById('userRemoval').value
            if (username === ''){
                alert('Please enter a username.')
                return
            }
            window.location.href = '/removeUser?user=' + encodeURIComponent(username)
        })
    }
});
