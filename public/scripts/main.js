function formatCounter(value) {
    if (value >= 1000000) {
        return (value / 1000000).toFixed(3) + 'M';
    } else if (value >= 1000) {
        return (value / 1000).toFixed(2) + 'k';
    } else {
        return value;
    }
}

let coin = document.getElementById('coin');
let count = parseInt(localStorage.getItem('count')) || 0;
let counter = document.getElementById('counter');
let enrgy = document.querySelector('.enrgy');
let updateButton = document.getElementById('updateButton');
let rocketButton = document.getElementById('rocketButton');
let energyButton = document.getElementById('energyButton');
let updateLevel = parseInt(localStorage.getItem('updateLevel')) || 0;
let rocketUses = parseInt(localStorage.getItem('rocketUses')) || 3;
let energyUses = parseInt(localStorage.getItem('energyUses')) || 3;
let updateCosts = [1000, 10000, 100000, 500000, 1000000];
let clickValues = [1, 3, 6, 12, 24, 48]; // click values for each update level
let energyDecreases = [2, 5, 10, 20, 40, 80]; // energy decrease for each click at each update level
let energyValues = [500, 1000, 2000, 4000, 8000, 16000]; // initial energy value for each update level
let energyIncreases = [2, 4, 6, 8, 10, 12]; // energy increase per second for each update level

let clickValue = clickValues[updateLevel];
let energyDecrease = energyDecreases[updateLevel];
let energyIncrease = energyIncreases[updateLevel];
let enrgyValue = parseInt(localStorage.getItem('enrgyValue')) || energyValues[updateLevel];

counter.innerHTML = formatCounter(count);
enrgy.innerHTML = enrgyValue;

coin.addEventListener('click', (e) => {
    if (enrgyValue > 0) {
        count += clickValue;
        enrgyValue -= energyDecrease;
        localStorage.setItem('count', count);
        localStorage.setItem('enrgyValue', enrgyValue);
        counter.innerHTML = formatCounter(count);
        enrgy.innerHTML = enrgyValue;

        // adjust the width of the energy element based on the new energy value
        enrgy.style.width = (enrgyValue / energyValues[updateLevel]) * 100 + '%';

        coin.classList.add('shake');

        setTimeout(() => {
            coin.classList.remove('shake');
        }, 500);

        let plusOne = document.createElement('div');
        plusOne.innerHTML = '+' + clickValue;
        plusOne.classList.add('plusOne');
        plusOne.style.left = e.clientX + 'px';
        plusOne.style.top = e.clientY + 'px';

        document.body.appendChild(plusOne);

        setTimeout(() => {
            document.body.removeChild(plusOne);
        }, 2000);
    }
});

updateButton.addEventListener('click', () => {
    if (updateLevel < updateCosts.length && count >= updateCosts[updateLevel]) {
        swal({ // Use sweetAlert instead of window.confirm
            title: "Are you sure?",
            text: "Updating will cost " + updateCosts[updateLevel] + " coins.",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
        .then((willUpdate) => {
            if (willUpdate) {
                count -= updateCosts[updateLevel];
                localStorage.setItem('count', count);
                counter.innerHTML = formatCounter(count);
                updateLevel += 1;
                localStorage.setItem('updateLevel', updateLevel);

                // update the click value and energy decrease based on the new update level
                clickValue = clickValues[updateLevel];
                energyDecrease = energyDecreases[updateLevel];
                enrgyValue = energyValues[updateLevel];
                enrgy.innerHTML = enrgyValue;
                enrgy.style.width = '100%'; // reset the width of the energy element
            }
        });
    }
});

rocketButton.addEventListener('click', () => {
    if (rocketUses > 0) {
        rocketUses -= 1;
        localStorage.setItem('rocketUses', rocketUses);

        // increase the click value for 15 seconds
        clickValue += 4;
        coin.style.boxShadow = '0 0 10px 10px gold'; // add a golden shadow around the coin

        setTimeout(() => {
            clickValue -= 4;
            coin.style.boxShadow = ''; // remove the golden shadow
        }, 15000);
    }
});

energyButton.addEventListener('click', () => {
    if (energyUses > 0) {
        energyUses -= 1;
        localStorage.setItem('energyUses', energyUses);

        // refill the energy
        enrgyValue = energyValues[updateLevel];
        localStorage.setItem('enrgyValue', enrgyValue);
        enrgy.innerHTML = enrgyValue;
        enrgy.style.width = '100%'; // reset the width of the energy element
    }
});

// Check every day if the rocket and energy uses need to be reset
setInterval(() => {
    let lastUseDay = localStorage.getItem('lastUseDay');
    let today = new Date().toISOString().split('T')[0]; // get today's date in YYYY-MM-DD format

    if (lastUseDay !== today) {
        // reset the rocket and energy uses if it's a new day
        rocketUses = 3;
        energyUses = 3;
        localStorage.setItem('rocketUses', rocketUses);
        localStorage.setItem('energyUses', energyUses);
        localStorage.setItem('lastUseDay', today);
    }
}, 1000 * 60 * 60); // check every hour

// Increase the energy value every second based on the update level
setInterval(() => {
    if (enrgyValue < energyValues[updateLevel]) {
        enrgyValue += energyIncrease;
        localStorage.setItem('enrgyValue', enrgyValue);
        enrgy.innerHTML = enrgyValue;

        // adjust the width of the energy element based on the new energy value
        enrgy.style.width = (enrgyValue / energyValues[updateLevel]) * 100 + '%';
    }
}, 1000);

// if (!/Mobi|Android/i.test(navigator.userAgent)) {
//     swal({ // Use sweetAlert instead of alert
//         title: "Please use a mobile device",
//         text: "This game is best experienced on a mobile device.",
//         icon: "warning",
//     });
//     coin.style.pointerEvents = 'none'; // disable clicking on the coin
// }
