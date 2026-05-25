import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function POST(request: Request) {
  try {
    // 1. Parse incoming application/x-www-form-urlencoded metadata from Twilio
    const formData = await request.formData();
    const callSid = formData.get('CallSid') as string;
    const recordingUrl = formData.get('RecordingUrl') as string;

    console.log(`Processing recorded response for CallSid: ${callSid}`);
    console.log(`Twilio Recording Hosted Address: ${recordingUrl}`);

    if (!callSid || !recordingUrl) {
      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?><Response><Say>Error capturing response assets.</Say></Response>`,
        { headers: { 'Content-Type': 'application/xml' } }
      );
    }

    // 2. Fetch the existing call configuration from Upstash Redis
    const cachedData = await redis.get(`call:${callSid}:config`);
    if (!cachedData) {
      console.error(`No tracking config found in Redis for CallSid: ${callSid}`);
    }

    let transcriptText = "No response captured.";
    let detectedLanguage = "unknown";

    try {
      // 3. Download the raw audio recording from Twilio's cloud storage (.wav format)
      // Twilio gives us a URL without an extension, but appending .wav speeds up processing
      const audioResponse = await fetch(`${recordingUrl}.wav`);
      if (!audioResponse.ok) {
        throw new Error(`Failed to download audio from Twilio payload. Status: ${audioResponse.status}`);
      }
      const audioBlob = await audioResponse.blob();

      // 4. Packaging the payload as multipart/form-data for Sarvam AI REST Specifications
      const sarvamPayload = new FormData();
      // Convert the blob into a structural file format Sarvam can read natively
      const audioFile = new File([audioBlob], "recording.wav", { type: "audio/wav" });
      
      sarvamPayload.append('file', audioFile);
      sarvamPayload.append('model', 'saaras:v3');
      
      // Using 'translate' automatically detects Indian languages (Telugu/Hindi) 
      // and converts them directly to English text for our upcoming LLM summary engine!
      sarvamPayload.append('mode', 'translate'); 

      console.log("Dispatching audio binary packet to Sarvam AI Core Engines...");
      
      const sarvamResponse = await fetch('https://api.sarvam.ai/speech-to-text', {
        method: 'POST',
        headers: {
          'api-subscription-key': process.env.SARVAM_API_KEY || ''
        },
        body: sarvamPayload
      });

      if (!sarvamResponse.ok) {
        const errText = await sarvamResponse.text();
        throw new Error(`Sarvam AI STT Pipeline rejected packet: ${sarvamResponse.status} - ${errText}`);
      }

      const sarvamData = await sarvamResponse.json();
      transcriptText = sarvamData.transcript || "Speech recognized, but empty transcript returned.";
      detectedLanguage = sarvamData.language_code || "unknown";

      console.log(`[Sarvam AI Success] Detected Language: ${detectedLanguage}`);
      console.log(`[Sarvam AI Transcript Summary]: "${transcriptText}"`);

    } catch (sttError) {
      console.error("Non-blocking pipeline exception during Audio Transcription phase:", sttError);
      transcriptText = "[Error processing audio transcription asset]";
    }

    // 5. Update state parameters atomically in Upstash Redis
    if (cachedData) {
      const config = typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData;
      
      // Attach the dynamic response attributes cleanly back onto the tracking token
      config.status = 'COMPLETED';
      config.userResponseTranscript = transcriptText;
      config.userLanguageDetected = detectedLanguage;
      config.completedAt = new Date().toISOString();

      await redis.set(`call:${callSid}:config`, JSON.stringify(config), { ex: 86400 });
      console.log(`Database transaction locked. State successfully updated to COMPLETED for call:${callSid}`);
    }

    // 6. Build the final TwiML instructions to gracefully conclude the call session
    const finalTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Raveena" language="en-IN">
        Thank you for updating your health dashboard. Have a wonderful day ahead. Goodbye.
    </Say>
    <Hangup/>
</Response>`.trim();

    return new NextResponse(finalTwiml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error: any) {
    console.error("Critical Failure in Day 4 Audio Processing Pipeline Route:", error);
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><Response><Say>System exception cleared.</Say><Hangup/></Response>`,
      { headers: { 'Content-Type': 'application/xml' } }
    );
  }
}