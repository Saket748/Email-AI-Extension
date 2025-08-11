console.log("Email Writer Extension - Content Script Loaded");

function createAIButton() {
   const button = document.createElement('div');
   button.className = 'T-I J-J5-Ji aoO v7 T-I-atl L3';
   button.style.marginRight = '8px';
   button.innerHTML = 'AI Reply';
   button.setAttribute('role','button');
   button.setAttribute('data-tooltip','Generate AI Reply');
   return button;
}

function getEmailContent() {
    const selectors = [
        '.h7',
        '.a3s.aiL',
        '.gmail_quote',
        '[role="presentation"]'
    ];
    for (const selector of selectors) {
        const content = document.querySelector(selector);
        if (content) {
            return content.innerText.trim();
        }
        return '';
    }
}


function findComposeToolbar() {
    const selectors = [
        '.btC',
        '.aDh',
        '[role="toolbar"]',
        '.gU.Up'
    ];
    for (const selector of selectors) {
        const toolbar = document.querySelector(selector);
        if (toolbar) {
            return toolbar;
        }
        return null;
    }
}

function injectButton() {
    const existingButton = document.querySelector('.ai-reply-button');
    if (existingButton) existingButton.remove();

    //for summarize the email
    const existingSum = document.querySelector('.ai-summarize-button');
    if (existingSum) existingSum.remove();

    const toolbar = findComposeToolbar();
    if (!toolbar) {
        console.log("Toolbar not found");
        return;
    }

    console.log("creating AI button");
    const button = createAIButton();
    button.classList.add('ai-reply-button');

    button.addEventListener('click', async () => {
        try {
            button.innerHTML = 'Generating...';
            button.disabled = true;

            const emailContent = getEmailContent();
            const response = await fetch('https://email-writer-latest-a6m1.onrender.com/api/email/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    emailContent: emailContent,
                    tone: "professional"
                })
            });

            if (!response.ok) {
                throw new Error('API Request Failed');
            }

            const generatedReply = await response.text();
            const composeBox = document.querySelector('[role="textbox"][g_editable="true"]');

            if (composeBox) {
                composeBox.focus();
                document.execCommand('insertText', false, generatedReply);
            } else {
                console.error('Compose box was not found');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to generate reply');
        } finally {
            button.innerHTML = 'AI Reply';
            button.disabled =  false;
        }
    });

    toolbar.insertBefore(button, toolbar.firstChild);
    injectSummarizeButton();
}

const observer = new MutationObserver((mutations) => {
    for(const mutation of mutations) {
        const addedNodes = Array.from(mutation.addedNodes);
        const hasComposeElements = addedNodes.some(node =>
            node.nodeType === Node.ELEMENT_NODE && 
            (node.matches('.aDh, .btC, [role="dialog"]') || node.querySelector('.aDh, .btC, [role="dialog"]'))
        );

        if (hasComposeElements) {
            console.log("Compose Window Detected");
            setTimeout(injectButton, 500);
        }
    }
});


observer.observe(document.body, {
    childList: true,
    subtree: true
});


//// Now we are starting our summarize 

function createSummarizeButton() {
    const button = document.createElement('div');
    button.className = 'T-I J-J5-Ji aoO v7 T-I-atl L3';
    button.style.marginRight = '8px';
    button.innerHTML = 'Summarize';
    button.setAttribute('role', 'button');
    button.setAttribute('data-tooltip', 'Summarize this email');
    return button;
}

function createPopup(summary) {
    const popup = document.createElement('div');
    popup.className = 'ai-summary-popup';
    popup.style.position = 'fixed';
    popup.style.bottom = '100px';
    popup.style.right = '50px';
    popup.style.width = '300px';
    popup.style.padding = '15px';
    popup.style.background = 'white';
    popup.style.border = '1px solid #ccc';
    popup.style.borderRadius = '10px';
    popup.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    popup.style.zIndex = 9999;
    popup.style.cursor = 'move'; // indicate draggable

    const closeBtn = document.createElement('div');
    closeBtn.innerText = '✖';
    closeBtn.style.float = 'right';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.fontSize = '14px';
    closeBtn.addEventListener('click', () => popup.remove());

    const summaryText = document.createElement('div');
    summaryText.style.marginTop = '10px';
    summaryText.innerText = summary;

    popup.appendChild(closeBtn);
    popup.appendChild(summaryText);
    document.body.appendChild(popup);

    // ---- DRAG FEATURE ----
    let isDragging = false;
    let offsetX, offsetY;

    popup.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - popup.getBoundingClientRect().left;
        offsetY = e.clientY - popup.getBoundingClientRect().top;
        popup.style.transition = 'none'; // smooth stop
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            popup.style.left = `${e.clientX - offsetX}px`;
            popup.style.top = `${e.clientY - offsetY}px`;
            popup.style.bottom = 'auto';
            popup.style.right = 'auto';
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
}


function injectSummarizeButton() {
    const existingButton = document.querySelector('.ai-summarize-button');
    if (existingButton) existingButton.remove();

    const toolbar = findComposeToolbar();
    if (!toolbar) {
        console.log("Toolbar not found for summarize");
        return;
    }

    console.log("Toolbar found, creating Summarize button");
    const summarizeBtn = createSummarizeButton();
    summarizeBtn.classList.add('ai-summarize-button');

    summarizeBtn.addEventListener('click', async () => {
        try {
            summarizeBtn.innerHTML = 'Summarizing...';
            summarizeBtn.disabled = true;

            const emailContent = getEmailContent();

            const response = await fetch('https://email-writer-latest-a6m1.onrender.com/api/email/summarize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ emailContent })
            });

            if (!response.ok) throw new Error('API request failed');

            const summary = await response.text();
            createPopup(summary);
            console.log("Summary generate Successfully");

        } catch (error) {
            console.error(error);
            alert('Failed to summarize email');
        } finally {
            summarizeBtn.innerHTML = 'Summarize';
            summarizeBtn.disabled = false;
        }
    });

    toolbar.insertBefore(summarizeBtn, toolbar.firstChild);
}
