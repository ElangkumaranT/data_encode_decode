const key = crypto.getRandomValues(new Uint8Array(16)); // 128-bit key for AES
const iv = crypto.getRandomValues(new Uint8Array(16)); // Initialization vector for AES
let resultText = ''; // Store raw output text

document.getElementById('convert-btn').addEventListener('click', async () => {
    const input = document.getElementById('input-text').value;
    const operation = document.querySelector('input[name="operation"]:checked').value;

    if (operation === 'encrypt') {
        resultText = await encryptText(input);
    } else {
        try {
            resultText = await decryptText(input);
        } catch (e) {
            resultText = "Decryption failed. Ensure input is a valid encrypted string.";
        }
    }

    document.getElementById('result').innerText = resultText;
    document.getElementById('copy-btn').style.display = 'inline-block';
});

document.getElementById('copy-btn').addEventListener('click', () => {
    if (resultText) {
        navigator.clipboard.writeText(resultText).then(() => {
            alert("Text copied to clipboard!");
        }).catch(err => {
            console.error("Failed to copy text: ", err);
        });
    }
});

async function encryptText(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    
    const cryptoKey = await crypto.subtle.importKey("raw", key, { name: "AES-CBC" }, false, ["encrypt"]);
    const encryptedBuffer = await crypto.subtle.encrypt({ name: "AES-CBC", iv: iv }, cryptoKey, data);
    
    return arrayBufferToBase64(encryptedBuffer);
}

async function decryptText(base64Text) {
    const encryptedBuffer = base64ToArrayBuffer(base64Text);
    const cryptoKey = await crypto.subtle.importKey("raw", key, { name: "AES-CBC" }, false, ["decrypt"]);
    const decryptedBuffer = await crypto.subtle.decrypt({ name: "AES-CBC", iv: iv }, cryptoKey, encryptedBuffer);
    
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
}

function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function base64ToArrayBuffer(base64) {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}
