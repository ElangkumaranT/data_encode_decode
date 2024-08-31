// Constants for AES
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

// Encrypts the input text and hashes it with SHA-512
async function encryptText(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);

    const cryptoKey = await crypto.subtle.importKey("raw", key, { name: "AES-CBC" }, false, ["encrypt"]);
    const encryptedBuffer = await crypto.subtle.encrypt({ name: "AES-CBC", iv: iv }, cryptoKey, data);
    
    // Convert encrypted data to base64
    const base64Encrypted = arrayBufferToBase64(encryptedBuffer);
    
    // Hash the original text with SHA-512
    const sha512Hash = await computeSHA512(text);
    
    return `Encrypted: ${base64Encrypted}\nSHA-512 Hash: ${sha512Hash}`;
}

// Decrypts the encrypted text and verifies the SHA-512 hash
async function decryptText(input) {
    const [encryptedText, hash] = input.split('\nSHA-512 Hash: ');
    
    if (!encryptedText || !hash) {
        throw new Error("Invalid input format.");
    }
    
    const encryptedBuffer = base64ToArrayBuffer(encryptedText.replace('Encrypted: ', ''));
    const cryptoKey = await crypto.subtle.importKey("raw", key, { name: "AES-CBC" }, false, ["decrypt"]);
    const decryptedBuffer = await crypto.subtle.decrypt({ name: "AES-CBC", iv: iv }, cryptoKey, encryptedBuffer);
    
    const decoder = new TextDecoder();
    const decryptedText = decoder.decode(decryptedBuffer);
    
    // Verify the SHA-512 hash
    const computedHash = await computeSHA512(decryptedText);
    if (computedHash === hash) {
        return decryptedText;
    } else {
        throw new Error("SHA-512 hash mismatch.");
    }
}

// Computes SHA-512 hash of the input
async function computeSHA512(input) {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);

    const hashBuffer = await crypto.subtle.digest('SHA-512', data);
    return arrayBufferToHex(hashBuffer);
}

// Converts ArrayBuffer to hexadecimal string
function arrayBufferToHex(buffer) {
    const bytes = new Uint8Array(buffer);
    let hexString = '';
    for (let i = 0; i < bytes.length; i++) {
        let hex = bytes[i].toString(16);
        if (hex.length === 1) hex = '0' + hex;
        hexString += hex;
    }
    return hexString;
}

// Converts base64 string to ArrayBuffer
function base64ToArrayBuffer(base64) {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

// Converts ArrayBuffer to base64 string
function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}
