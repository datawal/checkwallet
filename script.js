ocument.addEventListener("DOMContentLoaded", () => {
    const walletAddressInput = document.getElementById("walletAddress");
    const checkWalletBtn = document.getElementById("checkWalletBtn");
    const resultsContent = document.getElementById("results-content");

    checkWalletBtn.addEventListener("click", async () => {
        const address = walletAddressInput.value.trim();
        if (!address) {
            resultsContent.innerHTML = "<p style='color: red;'>Please enter an Ethereum wallet address.</p>";
            return;
        }

        if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
            resultsContent.innerHTML = "<p style='color: red;'>Invalid Ethereum wallet address format.</p>";
            return;
        }

        resultsContent.innerHTML = "<p>Checking wallet... Please wait.</p>";

        try {
            const response = await fetch("scamsniffer_mock.json");
            const mockData = await response.json();

            const flaggedList = (mockData.address || []).map(a => a.toLowerCase());
            const addressLower = address.toLowerCase();

            const result = {
                scamsniffer_tags: [],
                is_safe: true,
                messages: []
            };

            if (flaggedList.includes(addressLower)) {
                result.scamsniffer_tags.push("Flagged address");
                result.is_safe = false;
                result.messages.push("<div style='background-color:#ffcccc;padding:1rem;border-left:5px solid red;border-radius:4px;font-weight:bold;color:#900;'>⚠️ Address Flagged</div>");
                result.messages.push("<div style='margin-top:0.5rem;font-size:0.9rem;color:#666;'>Source: ScamSniffer</div>");
            } else {
                result.messages.push("✅ No threats found for this wallet");
            }

            displayResults(result);

        } catch (error) {
            console.error("Error reading mock data:", error);
            resultsContent.innerHTML = `<p style='color: red;'>Error loading data: ${error.message}</p>`;
        }
    });

    function displayResults(data) {
        let html = "";
        if (data.messages && data.messages.length > 0) {
            data.messages.forEach(msg => {
                if (msg.startsWith("✅")) {
                    html += `<p style='color: green;'>${msg}</p>`;
                } else {
                    html += `${msg}`;
                }
            });
        }

        if (data.scamsniffer_tags && data.scamsniffer_tags.length > 0) {
            html += "<h4>ScamSniffer Tags:</h4><ul>";
            data.scamsniffer_tags.forEach(tag => {
                html += `<li>${tag}</li>`;
            });
            html += "</ul>";
        }

        if (!html) {
            html = "<p>No information found or an unexpected error occurred.</p>";
        }

        resultsContent.innerHTML = html;
    }

    // Load recent detections
    fetch("scamsniffer_mock.json")
        .then(res => res.json())
        .then(data => {
            const recentList = document.getElementById("recent-addresses");
            const updatedSpan = document.getElementById("last-updated");

            const allAddresses = (data.address || []).slice(0, 10);
            allAddresses.forEach(addr => {
                const li = document.createElement("li");
                li.textContent = addr;
                recentList.appendChild(li);
            });

            updatedSpan.textContent = "Last update: May 10, 2025";
        })
        .catch(err => {
            console.error("Error loading recent addresses:", err);
        });
});
