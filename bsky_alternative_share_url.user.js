// ==UserScript==
// @name         Bsky Alternative Share URL
// @namespace    https://github.com/btcode23
// @version      0.5.4
// @description  Adds a button to share a thread with an alternative URL to the "Bsky" link
// @author       btcode23
// @license      MIT
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @match        https://bsky.app/*
// @icon         https://web-cdn.bsky.app/static/favicon-32x32.png

// @downloadURL https://raw.githubusercontent.com/btcode23/Twitter-Alternative-Share-URL/main/bsky_alternative_share_url.user.js
// @updateURL https://raw.githubusercontent.com/btcode23/Twitter-Alternative-Share-URL/main/bsky_alternative_share_url.user.js
// ==/UserScript==

const baseXUrl = 'https://bskx.app';

if (GM_getValue('ALT_Bsky_URL') == undefined) {
    GM_setValue('ALT_Bsky_URL', baseXUrl);
}

const svg = '<path d="M8 5.00005C7.01165 5.00082 6.49359 5.01338 6.09202 5.21799C5.71569 5.40973 5.40973 5.71569 5.21799 6.09202C5 6.51984 5 7.07989 5 8.2V17.8C5 18.9201 5 19.4802 5.21799 19.908C5.40973 20.2843 5.71569 20.5903 6.09202 20.782C6.51984 21 7.07989 21 8.2 21H15.8C16.9201 21 17.4802 21 17.908 20.782C18.2843 20.5903 18.5903 20.2843 18.782 19.908C19 19.4802 19 18.9201 19 17.8V8.2C19 7.07989 19 6.51984 18.782 6.09202C18.5903 5.71569 18.2843 5.40973 17.908 5.21799C17.5064 5.01338 16.9884 5.00082 16 5.00005M8 5.00005V7H16V5.00005M8 5.00005V4.70711C8 4.25435 8.17986 3.82014 8.5 3.5C8.82014 3.17986 9.25435 3 9.70711 3H14.2929C14.7456 3 15.1799 3.17986 15.5 3.5C15.8201 3.82014 16 4.25435 16 4.70711V5.00005M12 11V17M12 17L10 15M12 17L14 15" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>';

function displayConfirmation() {
    const layers = document.getElementById('root');

    let confirmation = document.getElementById('confirmCopyAltLink');
    if (!confirmation) {
        confirmation = document.createElement('div');
        confirmation.id = 'confirmCopyAltLink';
        confirmation.style.cssText = 'position: fixed; bottom: 10px; left: 0; right: 0; margin-left: auto; margin-right: auto; width: 100px; height: 40px;' +
            'background-color: rgba(29, 161, 242, 0.9); border-radius: 5px;'
        confirmation.innerHTML = '<p style="line-height: 40px; margin: 0; padding: auto; vertical-align: middle; text-align: center; font-weight: bold;">Copied</p>';
        layers.append(confirmation);
    }

    // show confirmation and then fade out
    confirmation.style.opacity = '1';
    confirmation.style.visibility = 'visible';
    confirmation.style.transition = '';
    setTimeout(function() {
        confirmation.style.opacity = '0';
        confirmation.style.visibility = 'hidden';
        confirmation.style.transition = '1s';
    }, 1000);
}

function copyAlternativeBskyUrl(thread) {
    // the part of the thread with time seems to give the path to the thread
    let threadPath = thread.querySelector('a[role="link"][href*="post"]').getAttribute('href');

    // new share URL
    let newUrl = GM_getValue('ALT_Bsky_URL') + threadPath;

    navigator.clipboard.writeText(newUrl);
    displayConfirmation();
}

function designButton(thread) {
    let otherIcon;
    otherIcon = thread.querySelector('button[aria-label="Open share menu"]').parentElement;

    const newIcon = otherIcon.cloneNode(true);
    newIcon.classList.add('custom-copy-icon');
    otherIcon.parentElement.insertBefore(newIcon, otherIcon.nextSibling);

    newIcon.querySelector('svg').innerHTML = svg; // add clipboard svg
    const icon = newIcon.querySelector('svg');
    icon.querySelector('path').style.fill = 'none';
    const computedStyleIcon = getComputedStyle(otherIcon.querySelector('svg'));
    const iconOriginalColor = computedStyleIcon.color;
    icon.querySelector('path').style.stroke = iconOriginalColor; // set color to same as other icon

    const computedContainerStyle = getComputedStyle(otherIcon);
    newIcon.style.display = computedContainerStyle.display;
    newIcon.style.width = computedContainerStyle.width;
    newIcon.style.height = computedContainerStyle.height;
    // newIcon.style.marginLeft = (parseFloat(computedContainerStyle.width) * 0.3) + "px";

    const backgroundElement = icon.previousElementSibling;

    // should look the same as the other icons
    newIcon.addEventListener('mouseover', function() {
        newIcon.style.borderRadius = '50%';
        newIcon.style.backgroundColor = getComputedStyle(document.querySelector('[data-testid="userAvatarImage"]')).backgroundColor;
    });

    // return to original style when mouseleave event
    newIcon.addEventListener('mouseleave', function() {
        newIcon.style.backgroundColor = '';
    });

    // copy link using alternative domain
    newIcon.addEventListener('click', function(e) {
        e.stopPropagation();
        copyAlternativeBskyUrl(thread);
    });
}

function addNewShareButtons() {
    let threads = document.querySelectorAll('div[data-testid^="feedItem"], div[data-testid^="postThreadItem"]');

    threads.forEach(thread => {
        if (!thread.querySelector('.custom-copy-icon')) {
            designButton(thread);
        }
    });
}

(function() {
    'use strict';

    // add new share button to each loaded thread
    const observer = new MutationObserver(addNewShareButtons);
    observer.observe(
        document.body, {
            childList: true,
            subtree: true
        });
})();

// change the alternative URL for bsky
GM_registerMenuCommand('Setting', () => config());

function config() {
    let configPopupContainer = document.getElementById('ConfigBskyFixUrlContainer')
    if (!configPopupContainer) {
        configPopupContainer = document.createElement('div');
    }
    configPopupContainer.id = 'ConfigBskyFixUrlContainer';
    configPopupContainer.style.cssText = 'position: fixed; width: 100%; height: 100%; left: 0; top: 0; background: rgba(51,51,51,0.7);';
    document.body.appendChild(configPopupContainer);

    const configPopup = document.createElement('form');
    configPopup.innerHTML = '<p style="text-align: center;">Bsky Fix URL Config</p>';
    configPopup.style.cssText = 'position: fixed; top: 50%; left: 50%; padding: 10px; margin-top: -150px; margin-left: -150px; width: 325px; height: 200px; background-color: black; border: 2px solid white; border-radius: 25px; color: white; font-size: 24px;  fontFamily: "Arial, sans-serif"';

    const formFontSize = 'font-size: 18px;';
    const altXUrlLabel = document.createElement('label');
    altXUrlLabel.style.cssText = formFontSize;
    altXUrlLabel.setAttribute('for', 'AltUrlBskyFixUrl');
    altXUrlLabel.innerHTML = 'Alternative URL Bsky :';

    const altXUrlInput = document.createElement('input');
    altXUrlInput.style.cssText = formFontSize + ' width: calc(100% - 12px); padding: 5px'
    altXUrlInput.setAttribute('type', 'text');
    altXUrlInput.setAttribute('id', 'AltUrlBskyFixUrl');
    altXUrlInput.setAttribute('name', 'AltUrlBskyFixUrl');
    altXUrlInput.setAttribute('value', GM_getValue('ALT_Bsky_URL'));

    configPopup.append(altXUrlLabel);
    configPopup.append(document.createElement('br'));
    configPopup.append(altXUrlInput);

    const buttonCSS = formFontSize + ' width: 75px; height: 30px; border: 2px solid white; text-align: center; padding: 0px; border-radius: 10px; margin-left: 19px;';

    const altUrlResetButton = document.createElement('button');
    altUrlResetButton.setAttribute('type', 'button');
    altUrlResetButton.setAttribute('value', 'reset');
    altUrlResetButton.style.cssText = buttonCSS;
    altUrlResetButton.innerHTML = 'Reset';
    altUrlResetButton.addEventListener('click', function(e) {
        altXUrlInput.value = baseXUrl;
    });

    const altUrlCancelButton = document.createElement('button');
    altUrlCancelButton.setAttribute('type', 'button');
    altUrlCancelButton.setAttribute('value', 'cancel');
    altUrlCancelButton.style.cssText = buttonCSS;
    altUrlCancelButton.innerHTML = 'Cancel';
    altUrlCancelButton.addEventListener('click', function(e) {
        configPopupContainer.style.display = 'none';
    });

    const altUrlSubmitButton = document.createElement('button');
    altUrlSubmitButton.setAttribute('type', 'button');
    altUrlSubmitButton.setAttribute('value', 'submit');
    altUrlSubmitButton.style.cssText = buttonCSS;
    altUrlSubmitButton.innerHTML = 'Submit';
    altUrlSubmitButton.addEventListener('click', function(e) {
        GM_setValue('ALT_Bsky_URL', altXUrlInput.value);
        configPopupContainer.style.display = 'none';
    });

    configPopup.append(document.createElement('br'));
    configPopup.append(document.createElement('br'));
    configPopup.appendChild(altUrlResetButton);
    configPopup.appendChild(altUrlCancelButton);
    configPopup.appendChild(altUrlSubmitButton);
    configPopupContainer.appendChild(configPopup);

    document.addEventListener('mouseup', function(e) {
        if (e.target.id == 'ConfigBskyFixUrlContainer') {
            configPopupContainer.style.display = 'none';
        }
    });
}
