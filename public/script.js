async function startSpeechRecognition() {
    // Hide result and audio elements
    document.getElementById('result').style.display = 'none';
    document.getElementById('audio').style.display = 'none';

    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition)();
    recognition.lang = 'en-US';

    // Change the button image when recording starts
    const micImage = document.getElementById('mic-image');

    recognition.onstart = () => {
        console.log('Speech recognition started.');
        document.getElementById('loader').style.display = 'block';
        micImage.src = 'image/enable-mic.gif'; 
        micImage.classList.add('w-32'); 
        micImage.classList.remove('w-20'); 
    };

    recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('Transcript:', transcript);

        // Send the transcript to the API
        await fetchAIResponse(transcript);
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        document.getElementById('result').innerHTML = `<p class="error">Error: ${event.error}</p>`;

        micImage.src = 'image/mic-btn.png';
        micImage.classList.add('w-20'); 
        micImage.classList.remove('w-32'); 
    };

    recognition.onend = () => {
        console.log('Speech recognition ended.');
        micImage.src = 'image/mic-btn.png';
        micImage.classList.add('w-20'); 
        micImage.classList.remove('w-32'); 
    };

    recognition.start();
}

async function fetchAIResponse(query) {
    const resultDiv = document.getElementById('result');
    const loader = document.getElementById('loader');
    const player = document.getElementById('audio');

    const selectedVoice = document.querySelector('input[name="list-radio"]:checked')?.value || 'Mathew';

    const url = `http://localhost:3000/proxy?query=${encodeURIComponent(query)}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Received data:', data);

        if (data.error) {
            resultDiv.innerHTML = `<p class="error">${data.error}</p>`;
        } else {
            resultDiv.style.display = 'block';
            displayResult(data);

            const textToSpeak = data.reply || data.result || '';
            if (textToSpeak) {
                const speakResponse = await fetch(`https://api.streamelements.com/kappa/v2/speech?voice=${selectedVoice}&text=` + encodeURIComponent(textToSpeak));

                if (speakResponse.status !== 200) {
                    alert(await speakResponse.text());
                    return;
                }

                const mp3 = await speakResponse.blob();
                let blobUrl = URL.createObjectURL(mp3);
                document.getElementById('source').setAttribute('src', blobUrl);
                let audio = document.getElementById('audio');
                audio.pause();
                audio.load();
                audio.play();
            } else {
                resultDiv.innerHTML = '<p class="error">No valid response received.</p>';
            }
        }
    } catch (error) {
        resultDiv.innerHTML = `<p class="error">${error.message}</p>`;
    }
}

function displayResult(data) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `<p>${data.reply || data.result}</p>`;
    const player = document.getElementById('audio');
    player.style.display = 'block';
    document.getElementById('loader').style.display = 'none';
}
