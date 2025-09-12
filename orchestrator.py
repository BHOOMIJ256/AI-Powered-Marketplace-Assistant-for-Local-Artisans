import os
from dotenv import load_dotenv
from typing import Optional

from google.cloud import texttospeech

# Reuse RAG chain and STT from existing files
from RAG_1 import main_chain, convert_speech_to_text

# use it python orchestrator.py --audio bhoomi_hindi_test.wav --stt-lang hi-IN --tts-lang hi-IN --out output.mp3
# use it python orchestrator.py --text "Hello Sahil! mera naam google hai." --stt-lang hi-IN --tts-lang hi-IN --out output.mp3
# use it 
# ---------------- Configuration (static language codes as requested) ----------------
STT_LANGUAGE_CODE = "hi-IN"   # Static speech-to-text language code
TTS_LANGUAGE_CODE = "hi-IN"   # Static text-to-speech language code
TTS_VOICE_GENDER = texttospeech.SsmlVoiceGender.NEUTRAL
TTS_AUDIO_ENCODING = texttospeech.AudioEncoding.MP3
DEFAULT_AUDIO_OUTPUT = "output.mp3"


load_dotenv()


# ---------------- Text-to-Speech (TTS) helper ----------------
def synthesize_speech(text: str,
                      language_code: str = TTS_LANGUAGE_CODE,
                      output_path: str = DEFAULT_AUDIO_OUTPUT,
                      voice_gender: texttospeech.SsmlVoiceGender = TTS_VOICE_GENDER,
                      audio_encoding: texttospeech.AudioEncoding = TTS_AUDIO_ENCODING) -> str:
    client = texttospeech.TextToSpeechClient()

    synthesis_input = texttospeech.SynthesisInput(text=text)
    voice = texttospeech.VoiceSelectionParams(
        language_code=language_code,
        ssml_gender=voice_gender,
    )
    audio_config = texttospeech.AudioConfig(audio_encoding=audio_encoding)

    response = client.synthesize_speech(
        input=synthesis_input,
        voice=voice,
        audio_config=audio_config,
    )

    with open(output_path, "wb") as out:
        out.write(response.audio_content)

    return output_path


# ---------------- Orchestrator Flows ----------------
def handle_text_input(user_text: str) -> str:
    """Route: text -> RAG -> text"""
    return main_chain.invoke(user_text)


def handle_audio_input(audio_path: str,
                       stt_language_code: str = STT_LANGUAGE_CODE,
                       tts_language_code: str = TTS_LANGUAGE_CODE,
                       output_audio_path: str = DEFAULT_AUDIO_OUTPUT) -> str:
    """Route: voice -> text -> RAG -> text (static code) -> voice

    Returns the path to the generated audio file.
    """
    stt_result = convert_speech_to_text(audio_path, stt_language_code)
    if not stt_result.get("success"):
        raise RuntimeError(stt_result.get("error") or "Speech-to-text failed")

    transcription = stt_result.get("transcription", "").strip()
    if not transcription:
        raise RuntimeError("No transcription produced from audio input")

    rag_text = main_chain.invoke(transcription)

    audio_file = synthesize_speech(
        text=rag_text,
        language_code=tts_language_code,
        output_path=output_audio_path,
    )
    return audio_file


# ---------------- CLI ----------------
def _build_arg_parser():
    import argparse
    parser = argparse.ArgumentParser(description="Text/Voice orchestrator using LangChain RAG and Google Cloud STT/TTS")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--text", type=str, help="Provide a text prompt for RAG")
    group.add_argument("--audio", type=str, help="Path to an audio file for STT -> RAG -> TTS")

    parser.add_argument("--stt-lang", type=str, default=STT_LANGUAGE_CODE, help="Static STT language code (default: en-US)")
    parser.add_argument("--tts-lang", type=str, default=TTS_LANGUAGE_CODE, help="Static TTS language code (default: en-US)")
    parser.add_argument("--out", type=str, default=DEFAULT_AUDIO_OUTPUT, help="Output audio file path for TTS (default: output.mp3)")
    return parser


def main():
    parser = _build_arg_parser()
    args = parser.parse_args()

    if args.text is not None:
        response_text = handle_text_input(args.text)
        print(response_text)
    else:
        audio_file = handle_audio_input(
            audio_path=args.audio,
            stt_language_code=args.stt_lang,
            tts_language_code=args.tts_lang,
            output_audio_path=args.out,
        )
        print(f"Audio response written to: {audio_file}")


if __name__ == "__main__":
    main()


