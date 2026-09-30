import { ISTANBUL_TELEPHONE_BOOTH } from "../../data/telephoneBooth.js";

const AUDIO_URL = new URL("../../assets/audio/WhatsApp Audio 2026-09-26 at 21.55.23.aac", import.meta.url).href;
const START_DELAY_SECONDS = 0.25;

/** Session-level phone interaction; audio is only started by an explicit E press. */
export class TelephoneBoothSystem {
  constructor(gameState, eventBus, isDebug = () => false, audioFactory = createAudio) {
    this.gameState = gameState;
    this.eventBus = eventBus;
    this.isDebug = isDebug;
    this.audioFactory = audioFactory;
    this.phase = "idle";
    this.audio = null;
    this.startDelay = 0;
    this.completed = Boolean(gameState.easterEggs?.istanbulTelephoneBooth);
    this.message = "";
  }

  getInteractionTargets(regionId) {
    return regionId === ISTANBUL_TELEPHONE_BOOTH.regionId
      ? [{ ...ISTANBUL_TELEPHONE_BOOTH, interactionType: "world" }]
      : [];
  }

  start(targetId) {
    if (targetId !== ISTANBUL_TELEPHONE_BOOTH.id || this.isBlockingPlayer()) return false;
    if (this.completed) {
      this.phase = "dead";
      this.message = "The line is dead.";
      return true;
    }

    this.phase = "calling";
    this.message = "Calling…";
    this.startDelay = START_DELAY_SECONDS;
    return true;
  }

  /** Returns true when this system owns input for the current frame. */
  update(deltaTime, input) {
    if (this.phase === "calling") {
      input.consumePress("e", "enter", "space", "escape");
      this.startDelay = Math.max(0, this.startDelay - deltaTime);
      if (this.startDelay === 0) this.beginPlayback();
      return true;
    }
    if (this.phase === "playing") {
      input.consumePress("e", "enter", "space", "escape");
      return true;
    }
    if (["reaction", "error", "dead"].includes(this.phase)) {
      if (input.consumePress("e", "enter", "space", "escape")) this.resetPresentation();
      return true;
    }
    return false;
  }

  beginPlayback() {
    if (this.phase !== "calling") return;
    try {
      const audio = this.audioFactory(AUDIO_URL);
      this.audio = audio;
      audio.preload = "auto";
      audio.onended = () => this.finishPlayback(audio);
      audio.onerror = () => this.failPlayback(audio, new Error("The telephone recording could not be loaded."));
      this.phase = "playing";
      this.message = "Calling…";
      const result = audio.play();
      if (result && typeof result.catch === "function") {
        result.catch((error) => this.failPlayback(audio, error));
      }
    } catch (error) {
      this.failPlayback(this.audio, error);
    }
  }

  finishPlayback(audio) {
    if (audio !== this.audio || this.phase !== "playing") return;
    this.audio = null;
    this.completed = true;
    this.gameState.easterEggs ??= {};
    this.gameState.easterEggs.istanbulTelephoneBooth = true;
    this.phase = "reaction";
    this.message = "…Maybe that wasn't the right number.";
    this.eventBus.emit("telephone_call_completed", { targetId: ISTANBUL_TELEPHONE_BOOTH.id });
  }

  failPlayback(audio, error) {
    if ((audio && audio !== this.audio) || (!audio && this.phase !== "calling" && this.phase !== "playing")) return;
    if (this.audio) {
      this.audio.onended = null;
      this.audio.onerror = null;
      this.audio.pause?.();
    }
    this.audio = null;
    this.phase = "error";
    this.message = "The line is busy. Press E to close.";
    if (this.isDebug()) console.warn("Telephone booth audio playback failed:", error);
  }

  resetPresentation() {
    this.phase = "idle";
    this.message = "";
  }

  isBlockingPlayer() {
    return ["calling", "playing", "reaction", "error", "dead"].includes(this.phase);
  }

  getUIState() {
    return this.isBlockingPlayer() ? { phase: this.phase, message: this.message } : null;
  }

  destroy() {
    if (this.audio) {
      this.audio.onended = null;
      this.audio.onerror = null;
      this.audio.pause?.();
      this.audio = null;
    }
    this.phase = "idle";
  }
}

function createAudio(source) {
  if (typeof Audio === "undefined") throw new Error("HTML audio playback is unavailable.");
  return new Audio(source);
}
