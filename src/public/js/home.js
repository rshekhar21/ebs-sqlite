import { jq, log, doc, isRrestricted  } from "./help.js";
import icons from './svgs.js';
import list from './home-list.js';

doc.addEventListener('DOMContentLoaded', ()=>{
    loadMenuItems(list);
    jq('#search').keyup(function () {
        let arr = filterList(list, this.value);
        loadMenuItems(arr)
    })
})


async function loadMenuItems(list) {
    try {
        // 1. Clear existing menu items
        jq('div.menu-items').empty(); // Use .empty() for better performance

        // 2. Fetch the app version from the API
        // const versionData = await quickData('/version');
        // if (!versionData || !versionData.version) {
        //     throw new Error("Failed to fetch app version or version is missing.");
        // }
        const appVersion = 'pro'; // versionData.version;

        // 3. Iterate through the menu item list
        for (const item of list) {          
            const icon = jq('<span></span>').addClass('fs-4').html(item.bsicon);
            const name = jq('<span></span>').addClass('fs-6').text(item.name);
            const content = jq('<div></div>').addClass('card-content d-flex flex-column jcc aic gap-1').append(icon, name);
            const card = jq('<div></div>').addClass(`ebs-card position-relative role-btn ${item.class}`).append(content);
            const padlock = jq('<span></span>').addClass('position-absolute top-0 end-0 pt-3 pe-3 fs-5').html(icons.lockDanger).prop('title', 'Available in Pro. Version only!');

            // 5. Apply lock logic based on app version and item version
            if (appVersion !== 'pro' && item.version === 'pro') {
                card.removeClass('role-btn');
                content.append(padlock);
            }

            // 6. Attach click event handler
            jq(card).on('click', async function () {
                try {
                    // 7. Check for restrictions (if any)
                    if (item.rc && await isRrestricted(item.rc)) {
                        return;
                    }

                    // 8. Check version again before navigating
                    if (appVersion !== 'pro' && item.version === 'pro') {
                        return;
                    }

                    // 9. Navigate to the item's URL
                    window.location.href = item.url;
                } catch (clickError) {
                    log(`Error handling click for ${item.name}:`, clickError);
                }
            });

            // 10. Append the card to the menu items container
            jq('div.menu-items').append(card);
        }
    } catch (error) {
        log("Error loading menu items:", error);
    }
}

function filterList(data, searchKeyword) {
    // Filter out the objects based on the search keyword
    const filteredObjects = data.filter(obj => {
        // Check if the object's key matches the search keyword
        return obj.name.toLowerCase().includes(searchKeyword.toLowerCase());
    });

    // Extract keys from the filtered objects
    const filteredKeys = filteredObjects.map(obj => obj);

    return filteredKeys;
}