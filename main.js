"use strict";

(() => {

    //call createHome onload and display the coins 
    createHome()

    // clear session storage if user refresh the page:
    sessionStorage.clear()

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

    // get reports charts div
    const chartContainer = document.getElementById("chartContainer")

    // get reports error message
    const reportsErrorMessage = document.getElementById("reportsErrorMessage")

    // Page and speed:
    const parallax = document.querySelectorAll("body");
    const speed = 0.225;

    // Parallax on scroll:
    window.onscroll = function () {
        [].slice.call(parallax).forEach(function (el) {
            // Scrolling down:
            const windowYOffset = window.pageYOffset;
            // Defined the action:
            const elBackgroundPos = "0%" + (windowYOffset * speed) + "px";
            // Activate on page:
            el.style.backgroundPosition = elBackgroundPos;
        });
    };

    // Add an event listener to each nav link to toggle the active class
    document.addEventListener('DOMContentLoaded', function () {
        const links = document.querySelectorAll('.aContainer > a');

        links.forEach(function (link) {
            link.addEventListener('click', function () {
                // Remove the 'active' class from all links
                links.forEach(function (otherLink) {
                    otherLink.classList.remove('active');
                });

                // Add the 'active' class to the clicked link
                link.classList.add('active');
            });
        });
    });

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

                $(".inputErrorMessage").html(content)
            }
            else {
                // clear the error message if there is coin to display
                $(".inputErrorMessage").html(content)
            }
        }

    })

    // create home page:
    async function createHome() {
        const coins = await getJson("assets/json/coins.json")
        displayCoins(coins)

        // show input
        inputDiv.style.opacity = 1
        // hide the reports graph
        chartContainer.style.display = "none"
        // hide the reports error message
        $("#reportsErrorMessage").hide()
        // clear input value
        inputBox.value = ""

        // keeps the selected buttons press when we return to home
        if (selectedCoinsToReports.length > 0) {
            for (const button of selectedCoinsToReports) {
                $(`.checkbox.${button.classList[1]}`).click()
            }
        }
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
                    <input class="checkbox ${coin.symbol} ${coin.name}" id="checkbox${coin.id}" type="checkbox">
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

        const coinId = this.getAttribute("data-coin-id");
        const div = document.querySelector(`button[data-coin-id="${coinId}"] + div`);

        // Show loader
        div.innerHTML = `
        <span class="loader"></span>
        `;
        // Toggle the more info section
        $(this).next().slideToggle();

        try {
            // Fetch prices
            const prices = await getMoreInfo(coinId);

            // Display prices
            div.innerHTML = `
            <div class="thumb-div"><img src="${prices.imageUrl}"></div>
            <div><strong>USD: $</strong>${prices.usd}</div>
            <div><strong>EUR: €</strong>${prices.eur}</div>
            <div><strong>ILS: ₪</strong>${prices.ils}</div>`;
        } catch (error) {
            // Handle error if API request fails
            console.error("Error fetching prices:", error);
            // display error message:
            div.innerHTML = "<p>Error fetching prices. Please try again later.</p>";
        }

    }

    async function getMoreInfo(coinId) {
        // get session storage data
        let prices = JSON.parse(sessionStorage.getItem(coinId))

        // if their is information in session storage:
        if (prices) {
            return prices;
        }

        // if their isn't information in session storage:
        const url = "https://api.coingecko.com/api/v3/coins/" + coinId
        const coinInfo = await getJson(url)
        // get more information about each coin
        const imageUrl = coinInfo.image.thumb
        const usd = coinInfo.market_data.current_price.usd
        const eur = coinInfo.market_data.current_price.eur
        const ils = coinInfo.market_data.current_price.ils
        prices = { usd, eur, ils, imageUrl }
        // save coin in local storage:
        sessionStorage.setItem(coinId, JSON.stringify(prices))

        // remove coin from local storage after 2 minutes:
        setTimeout(async () => {
            sessionStorage.removeItem(coinId)
        }, 1000 * 60 * 2)//2 minutes

        return prices
    }

    // create reports page:
    function createReports() {
        const container = document.getElementById("container")

        // hide all irrelevant elements
        inputDiv.style.opacity = 0
        chartContainer.style.display = "inline-block"
        $(".inputErrorMessage").html("")
        container.innerHTML = ""

        reportsSelectedCharts()
    }

    // create about page:
    function createAbout() {
        const container = document.getElementById("container")

        // hide all irrelevant elements
        inputDiv.style.opacity = 0
        chartContainer.style.display = "none"
        $(".inputErrorMessage").html("")
        $("#reportsErrorMessage").hide()

        // display about page:
        container.innerHTML = `
        <div class="about-container">
            <img class="currencies-svg" src="assets/images/about image.png">
            <img class="my-image" src="assets/images/me2.jfif">
            <p>
            Hello all!<br>
            My name is dudi matslawi i am a 22 years old and i am a software developer at the beginning of my career.
            During the course i'm on, i was asked to develop a website about crypto currencies.
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
        // go through all the buttons that are pushed
        for (const coin of coins) {
            for (const button of arr) {
                if (coin.symbol === button.classList[1] && selectedCoinsArray.length <= 5) {
                    // push to array
                    selectedCoinsArray.push(coin);
                }
            }
        }

        // return the array
        return selectedCoinsArray;
    }

    // create variable to the last checked checkbox
    let lastCheckedCheckbox = null;
    let selectedCoinsToReports = []

    async function showModal() {
        selectedCoinsToReports = jQuery(".checkbox:checked").toArray()
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
                    $(`.checkbox.${checkboxClass}`).click()

                });
            });

            // // Add click event for the modal close button
            $("#modal-close-button").on("click", function () {
                // Find the corresponding checkbox by class and uncheck it
                const checkboxClass = lastCheckedCheckbox.classList[1];
                $(`.checkbox.${checkboxClass}`).prop('checked', false).change();
                // Remove the unchecked checkbox from the selectedCoinsToReports array
                selectedCoinsToReports = selectedCoinsToReports.filter(coin => coin.classList[1] !== checkboxClass);
            });
        }
    }

    // display marquee on page
    displayMarqueeData()

    async function displayMarqueeData() {
        const marquee = document.getElementById("add-bar");
        // get all coins data
        const coins = await getJson("assets/json/coins.json");
        let content = "";
        // build marquee content:
        content += `<span>OUR COINS:</span>`;
        for (let i = 0; i < coins.length; i++) {
            // every 5 coins display message: 
            if (i % 5 === 0 && i !== 0) {
                content += `
                    <span class="marquee-coins-span">
                    <strong>For investments or making contact:</strong> &nbsp;&nbsp; Gmail: Dodim6666@gmail.com &nbsp;&nbsp; Phone-number: 052-6492011 
                    </span>
                    `;
            }
            content += `<span class="marquee-coins-span"><img class="marquee-image" src="${coins[i].image.small}">  &nbsp; ${coins[i].name}  &nbsp; <img class="marquee-image" src="${coins[i].image.small}"></span>`;
        }

        // Create a new marquee element with the updated content
        const newMarquee = document.createElement("marquee");
        newMarquee.innerHTML = content;

        // Replace the original marquee with the new one
        marquee.parentNode.replaceChild(newMarquee, marquee);

        // Reset the scroll position to zero
        newMarquee.scrollLeft = 0;
    }

    function reportsSelectedCharts() {

        // hide error message:
        $("#reportsErrorMessage").hide()

        // create array for each selected coin:
        let dataPoints1 = [];
        let dataPoints2 = [];
        let dataPoints3 = [];
        let dataPoints4 = [];
        let dataPoints5 = [];

        // create variable for each coin name:
        let name1, name2, name3, name4, name5;

        // put value in names variables
        if (selectedCoinsToReports[0]) {
            name1 = selectedCoinsToReports[0].classList[2]
        }
        else {
            chartContainer.style.display = "none"
            reportsErrorMessage.style.display = "flex"
        }
        if (selectedCoinsToReports[1]) {
            name2 = selectedCoinsToReports[1].classList[2]
        }
        if (selectedCoinsToReports[2]) {
            name3 = selectedCoinsToReports[2].classList[2]
        }
        if (selectedCoinsToReports[3]) {
            name4 = selectedCoinsToReports[3].classList[2]
        }
        if (selectedCoinsToReports[4]) {
            name5 = selectedCoinsToReports[4].classList[2]
        }

        // build graph details
        let options = {
            title: {
                text: "Currencies live reports"
            },
            axisX: {
                title: "chart updates every 2 secs"
            },
            axisY: {
                suffix: "$"
            },
            toolTip: {
                shared: true
            },
            legend: {
                cursor: "pointer",
                verticalAlign: "top",
                fontSize: 22,
                fontColor: "dimGrey",
                itemclick: toggleDataSeries
            },
            data: [{
                type: "line",
                xValueType: "dateTime",
                yValueFormatString: "###.00$",
                xValueFormatString: "hh:mm:ss TT",
                showInLegend: true,
                name: name1 ? name1 : "",
                dataPoints: dataPoints1
            },
            {
                type: "line",
                xValueType: "dateTime",
                yValueFormatString: "###.00$",
                showInLegend: true,
                name: name2 ? name2 : "",
                dataPoints: dataPoints2
            }, {
                type: "line",
                xValueType: "dateTime",
                yValueFormatString: "###.00$",
                showInLegend: true,
                name: name3 ? name3 : "",
                dataPoints: dataPoints3
            }, {
                type: "line",
                xValueType: "dateTime",
                yValueFormatString: "###.00$",
                xValueFormatString: "hh:mm:ss TT",
                showInLegend: true,
                name: name4 ? name4 : "",
                dataPoints: dataPoints4
            }, {
                type: "line",
                xValueType: "dateTime",
                yValueFormatString: "###.00$",
                xValueFormatString: "hh:mm:ss TT",
                showInLegend: true,
                name: name5 ? name5 : "",
                dataPoints: dataPoints5
            },]
        };

        let chart = $("#chartContainer").CanvasJSChart(options);

        function toggleDataSeries(e) {
            if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
                e.dataSeries.visible = false;
            }
            else {
                e.dataSeries.visible = true;
            }
            e.chart.render();
        }

        let updateInterval = 2000;

        let time = new Date();

        async function updateChart() {

            time.setTime(time.getTime() + updateInterval);

            let selectedCoinsSymbols = ""
            for (const coin of selectedCoinsToReports) {
                selectedCoinsSymbols += coin.classList[1] + ","
            }
            const coinPrice = await getJson(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${selectedCoinsSymbols}&tsyms=USD`)

            let yValue1, yValue2, yValue3, yValue4, yValue5

            if (selectedCoinsToReports[0]) {
                yValue1 = coinPrice[selectedCoinsToReports[0].classList[1].toUpperCase()].USD
            }
            if (selectedCoinsToReports[1]) {
                yValue2 = coinPrice[selectedCoinsToReports[1].classList[1].toUpperCase()].USD
            }
            if (selectedCoinsToReports[2]) {
                yValue3 = coinPrice[selectedCoinsToReports[2].classList[1].toUpperCase()].USD
            }
            if (selectedCoinsToReports[3]) {
                yValue4 = coinPrice[selectedCoinsToReports[3].classList[1].toUpperCase()].USD
            }
            if (selectedCoinsToReports[4]) {
                yValue5 = coinPrice[selectedCoinsToReports[4].classList[1].toUpperCase()].USD
            }

            // pushing the new values
            if (yValue1) {
                dataPoints1.push({
                    x: time.getTime(),
                    y: yValue1
                });
                options.data[0].legendText = name1 + " : " + yValue1 + "$"

            }
            if (yValue2) {
                dataPoints2.push({
                    x: time.getTime(),
                    y: yValue2
                });
                options.data[1].legendText = name2 + " : " + yValue2 + "$"
            }
            if (yValue3) {

                dataPoints3.push({
                    x: time.getTime(),
                    y: yValue3
                });
                options.data[2].legendText = name3 + " : " + yValue3 + "$"

            }
            if (yValue4) {
                dataPoints4.push({
                    x: time.getTime(),
                    y: yValue4
                });
                options.data[3].legendText = name4 + " : " + yValue4 + "$"

            }
            if (yValue5) {
                dataPoints5.push({
                    x: time.getTime(),
                    y: yValue5
                });
                options.data[4].legendText = name5 + " : " + yValue5 + "$"

            }

            $("#chartContainer").CanvasJSChart().render();
        }

        // generates first set of dataPoints 
        setInterval(function () { updateChart() }, updateInterval);
    }
})()

