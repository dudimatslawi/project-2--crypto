"use strict";

(() => {

    //get home link and create on click function 
    const homeLink = document.getElementById("homeLink");
    homeLink.addEventListener("click", createHome)

    //get reports link and create on click function 
    const reportsLink = document.getElementById("reportsLink");
    reportsLink.addEventListener("click", createReports)

    //get about link and create on click function 
    const aboutLink = document.getElementById("aboutLink");
    aboutLink.addEventListener("click", createAbout)

    // get input and the div around it
    const inputDiv = document.querySelector(".form-container")
    const inputBox = document.getElementById("inputBox")


    // on input function on user input:
    inputBox.addEventListener("input", async () => {

        const userInput = inputBox.value
        // get all coins data from api
        const allCoins = await getJson("assets/json/coins.json");

        // display every coin that meets the condition
        for (let i = 0; i < allCoins.length; i++) {
            if (allCoins[i].symbol.includes(userInput) || allCoins[i].name.includes(userInput)) {
                // show the correct coins
                $(`#card${i}`).show()
            }
            else {
                //hide the wrong coins
                $(`#card${i}`).hide()
            }

            let content = ""

            //if there is no coin that meets the condition display this message:
            if ($(".card:visible").length === 0) {
                content = `
                <div class="errorDiv">

                    <h2>There is not currency in our database that includes <strong>${userInput}</strong> inside his name</h2>
                    <br>
                    <div class="img-container"><img src="assets/images/errorimage.png"></div>

                </div>`

                $(".errorMessageDiv").html(content)
            }
            else {
                // clear the error message if there is coin to display
                $(".errorMessageDiv").html(content)
            }
        }

    })


    // create home page:
    async function createHome() {
        const coins = await getJson("assets/json/coins.json")
        displayCoins(coins)
        inputDiv.style.opacity = 1

    }

    // display coins on page:
    function displayCoins(coins) {
        const container = document.getElementById("container")
        let content = "";
        let count = 0

        //display each coin div
        for (const coin of coins) {
            const div = `
            <div class="card" id="card${count}">
                <div class="on-off-button-div">
                    <input class="checkbox ${coin.symbol}" id="checkbox${coin.id}" type="checkbox">
                    <label class="switch" for="checkbox${coin.id}">
                        <div class="powerSign"></div>
                    </label>
                </div>
            
                <div class="card-symbol-div"><strong>${coin.symbol}</strong></div>
                <div>${coin.name}</div>
                <button type="button" class="btn btn-dark" data-coin-id="${coin.id}">more info</button>
                <div class="moreInfo hidden"></div>
            </div>`
            content += div
            count++
        }


        container.innerHTML = content;

        // add event listener for checkbox change
        const checkboxes = document.querySelectorAll(".checkbox");
        for (const checkbox of checkboxes) {
            checkbox.addEventListener("change", showModal);
        }



        // create function for each more info button
        const moreInfoButtons = document.querySelectorAll(".card > button")
        for (const btn of moreInfoButtons) {
            btn.addEventListener("click", toggleMoreInfo)
        }
    }


    async function toggleMoreInfo() {

        const coinId = this.getAttribute("data-coin-id")
        const prices = await getMoreInfo(coinId)
        const div = document.querySelector(`button[data-coin-id="${coinId}"] + div`)


        div.innerHTML = `
        
       <div class="thumb-div"><img src="${prices.imageUrl}"></div>
       <div><strong>USD: $</strong>${prices.usd}</div>
       <div><strong>EUR: €</strong>${prices.eur}</div>
       <div><strong>ILS: ₪</strong>${prices.ils}</div>`

        $(this).next().slideToggle()



    }

    async function getMoreInfo(coinId) {


        let prices = JSON.parse(localStorage.getItem(coinId))
        if (prices) return prices;
        const url = "https://api.coingecko.com/api/v3/coins/" + coinId
        const coinInfo = await getJson(url)
        const imageUrl = coinInfo.image.thumb
        const usd = coinInfo.market_data.current_price.usd
        const eur = coinInfo.market_data.current_price.eur
        const ils = coinInfo.market_data.current_price.ils
        prices = { usd, eur, ils, imageUrl }
        localStorage.setItem(coinId, JSON.stringify(prices))
        return prices

    }

    setInterval(() => {
        localStorage.clear();
    }, 2 * 60 * 1000);

    // create reports page:
    function createReports() {
        const container = document.getElementById("container")
        inputDiv.style.opacity = 0

        container.innerHTML = "reports"
    }

    // create about page:
    function createAbout() {
        const container = document.getElementById("container")
        inputDiv.style.opacity = 0

        container.innerHTML = `
        <div class="about-container">
            <img class="currencies-svg" src="assets/images/about image.png">
            <img class="my-image" src="assets/images/about image2.webp.png">
            <p>
            Hello all!<br>
            My name is dudi matslawi and i am a software developer at the beginning of my career.<br>
            During the course i'm on, i was asked to develop a website about crypto currencies.<br>
            In my website you can find and update about the most popular digital currencies in the market today and even check their value(by dollar, euro, shekel).
            In addition to that you also can choose your 5 favorite digital currencies and receive updates and reports about them in real time.
            <br><br>
            <strong>To order my services, contact me: 052-6492011</strong>




            
            </p>
        <div>`
    }

    // get json data from api
    async function getJson(url) {
        const response = await fetch(url);
        const json = await response.json();
        return json;
    }


    async function getSelectedCoins(arr) {
        const selectedCoinsArray = [];

        const coins = await getJson("assets/json/coins.json");

        for (const coin of coins) {
            for (const button of arr) {
                if (coin.symbol === button.classList[1] && selectedCoinsArray.length <= 5) {
                    selectedCoinsArray.push(coin);
                }
            }
        }

        // return the array
        return selectedCoinsArray;
    }


    // create variable to the last checked checkbox
    let lastCheckedCheckbox = null;

    async function showModal() {
        // add event listener for checkbox change
        const checkboxes = document.querySelectorAll(".checkbox");
        for (const checkbox of checkboxes) {
            checkbox.addEventListener("change", function () {
                // Update the last checked checkbox to the last that checked
                if (this.checked) {
                    lastCheckedCheckbox = this;
                }
            });
        }

        // check if there are more than 5 buttons pressed
        if (jQuery(".checkbox:checked").length > 5) {
            const coins = await getSelectedCoins(jQuery(".checkbox:checked").toArray());
            // Create a new instance of Bootstrap Modal
            let myModal = new bootstrap.Modal(document.getElementById('staticBackdrop'));
            let content = "";

            // display each coin entered into the modal 
            for (const coin of coins) {
                content += ` 
                    <div class="card">
                        <div class="card-symbol-div"><strong>${coin.symbol}</strong></div>
                        <div>${coin.name}</div>
                        <div class="thumb-div"><img src="${coin.image.thumb}"></div>
                        <button type="button" class="btn btn-outline-dark remove-button" data-bs-dismiss="modal">remove</button>
                    </div>`;
            }
            $(".modal-body").html(content);

            // Show the modal
            myModal.show();

            // Add click event for the remove button
            const removeButtons = document.querySelectorAll(".remove-button");
            removeButtons.forEach((button) => {
                button.addEventListener("click", function () {
                    // Find the corresponding checkbox by class and uncheck it
                    const checkboxClass = coins[Array.from(removeButtons).indexOf(this)].symbol;
                    $(`.checkbox.${checkboxClass}`).prop('checked', false);
                });
            });

            // Add click event for the modal close button
            $("#modal-close-button").one("click", function () {
                // Find the corresponding checkbox by class and uncheck it
                const checkboxClass = lastCheckedCheckbox.classList[1];
                $(`.checkbox.${checkboxClass}`).prop('checked', false);
            });
        }
    }




})()

