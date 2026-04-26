/* ==================================================
   main.js — Meta-Landing Interface Binder v1.1
   --------------------------------------------------
   This file connects the page to the Infotech Engine.

   Responsibilities:
   - Read module definitions from modules.js.
   - Read current state from state-engine.js.
   - Reveal, hide, or defer modules based on requirements.
   - Bind every button with data-accept="module-id".
   - Update visible field-state readouts.
   - Reset local state when requested.

   Design Rule:
   The HTML is the vessel.
   modules.js defines the unlock grammar.
   state-engine.js stores state.
   main.js renders the relationship between them.
   ================================================== */

(function () {
  "use strict";

  /* --------------------------------------------------
     GUARD: Required globals
     --------------------------------------------------
     The page loads scripts in this order:
       1. state-engine.js
       2. modules.js
       3. main.js

     If either dependency is missing, we stop safely.
     -------------------------------------------------- */
  if (!window.NEODOXENT_STATE) {
    console.error("NEODOXENT_STATE is missing. Load state-engine.js before main.js.");
    return;
  }

  if (!window.NEODOXENT_MODULES) {
    console.error("NEODOXENT_MODULES is missing. Load modules.js before main.js.");
    return;
  }

  /* --------------------------------------------------
     CONSTANTS
     -------------------------------------------------- */
  const modules = window.NEODOXENT_MODULES;
  const stateApi = window.NEODOXENT_STATE;

  /* --------------------------------------------------
     UTILITY: Find a module definition by id
     -------------------------------------------------- */
  function getModuleDefinition(id) {
    return modules.find((module) => module.id === id);
  }

  /* --------------------------------------------------
     UTILITY: Safe object lookup
     --------------------------------------------------
     Used for qBits and strata because some values may be
     absent in older saved localStorage states.
     -------------------------------------------------- */
  function getNestedNumber(object, key) {
    if (!object || typeof object[key] !== "number") return 0;
    return object[key];
  }

  /* --------------------------------------------------
     REQUIREMENT CHECK: accepted modules
     -------------------------------------------------- */
  function hasAcceptedModules(state, requiredAccepted) {
    if (!requiredAccepted || requiredAccepted.length === 0) return true;
    return requiredAccepted.every((id) => state.accepted.includes(id));
  }

  /* --------------------------------------------------
     REQUIREMENT CHECK: strata
     -------------------------------------------------- */
  function hasRequiredStrata(state, requiredStrata) {
    if (!requiredStrata) return true;

    return Object.entries(requiredStrata).every(([key, requiredValue]) => {
      return getNestedNumber(state.strata, key) >= requiredValue;
    });
  }

  /* --------------------------------------------------
     REQUIREMENT CHECK: qBits
     -------------------------------------------------- */
  function hasRequiredQbits(state, requiredQbits) {
    if (!requiredQbits) return true;

    return Object.entries(requiredQbits).every(([key, requiredValue]) => {
      return getNestedNumber(state.qbits, key) >= requiredValue;
    });
  }

  /* --------------------------------------------------
     REQUIREMENT CHECK: scalar values
     -------------------------------------------------- */
  function hasRequiredScalars(state, requirements) {
    if (!requirements) return true;

    if (typeof requirements.complexity === "number" && state.complexity < requirements.complexity) return false;
    if (typeof requirements.coherence === "number" && state.coherence < requirements.coherence) return false;
    if (typeof requirements.entanglement === "number" && state.entanglement < requirements.entanglement) return false;
    if (typeof requirements.orientation === "number" && state.orientation < requirements.orientation) return false;

    return true;
  }

  /* --------------------------------------------------
     MASTER REQUIREMENT CHECK
     --------------------------------------------------
     A module is eligible if all declared requirements pass.
     Modules without requirements are eligible by default.
     -------------------------------------------------- */
  function isEligible(module, state) {
    const requirements = module.requires || {};

    return (
      hasAcceptedModules(state, requirements.accepted) &&
      hasRequiredStrata(state, requirements.strata) &&
      hasRequiredQbits(state, requirements.qbits) &&
      hasRequiredScalars(state, requirements)
    );
  }

  /* --------------------------------------------------
     MODULE STATUS RESOLUTION
     --------------------------------------------------
     Determines how a module should appear right now.

     Order:
     - accepted modules stay revealed
     - eligible modules are revealed
     - deferred modules remain deferred until eligible
     - non-eligible modules remain hidden
     -------------------------------------------------- */
  function resolveModuleStatus(module, state) {
    if (state.accepted.includes(module.id)) return "revealed accepted";

    if (isEligible(module, state)) return "revealed";

    if (module.initialStatus === "deferred") return "deferred";
    if (module.initialStatus === "veiled") return "veiled";

    return "hidden";
  }

  /* --------------------------------------------------
     RENDER MODULES
     --------------------------------------------------
     Applies the resolved visibility class to each module node.
     -------------------------------------------------- */
  function renderModules() {
    const state = stateApi.get();

    modules.forEach((module) => {
      const node = document.querySelector(`[data-module="${module.id}"]`);
      if (!node) return;

      const status = resolveModuleStatus(module, state);

      node.classList.remove("hidden", "veiled", "deferred", "revealed", "accepted");
      status.split(" ").forEach((className) => node.classList.add(className));

      const button = node.querySelector(`[data-accept="${module.id}"]`);
      if (button) {
        const alreadyAccepted = state.accepted.includes(module.id);
        const eligible = isEligible(module, state);

        button.disabled = alreadyAccepted || !eligible;
        button.textContent = alreadyAccepted ? "Accepted" : button.dataset.originalLabel || button.textContent;
      }
    });
  }

  /* --------------------------------------------------
     DISPLAY HELPERS
     -------------------------------------------------- */
  function setText(id, value) {
    const node = document.getElementById(id);
    if (node) node.textContent = String(value);
  }

  /* --------------------------------------------------
     RENDER FIELD STATE
     --------------------------------------------------
     Updates all visible state readouts on recursion.html.
     -------------------------------------------------- */
  function renderFieldState() {
    const state = stateApi.get();

    setText("state-complexity", state.complexity || 0);
    setText("state-aura", state.aura || "Unformed");
    setText("state-vector", state.vector || "zephyr");
    setText("state-entanglement", state.entanglement || 0);
    setText("state-bits", state.bits || 0);
    setText("state-coherence", state.coherence || 0);
    setText("state-orientation", state.orientation || 0);

    /* Compatibility with the older v1.0 status chip names. */
    setText("state-mode", "Recurring");
    setText("state-access", state.accepted.includes("aperture") ? "Calibrated" : "Oriented");
    setText("state-zephyr", state.accepted.includes("zephyr") ? "Accepted" : "Available");
    setText("state-drunemeton", state.accepted.includes("drunemeton") ? "Outer Gate" : "Deferred");
  }

  /* --------------------------------------------------
     FULL RENDER PASS
     -------------------------------------------------- */
  function render() {
    renderFieldState();
    renderModules();
  }

  /* --------------------------------------------------
     ACCEPT BUTTON BINDING
     --------------------------------------------------
     Buttons use data-accept="module-id".
     When clicked, we pass the module id into the state engine,
     then re-render the interface.
     -------------------------------------------------- */
  function bindAcceptButtons() {
    document.querySelectorAll("[data-accept]").forEach((button) => {
      button.dataset.originalLabel = button.textContent;

      button.addEventListener("click", () => {
        const id = button.getAttribute("data-accept");
        const module = getModuleDefinition(id);

        if (!module) {
          console.warn(`No module definition found for ${id}.`);
          return;
        }

        const state = stateApi.get();

        if (!isEligible(module, state)) {
          console.info(`${id} is not eligible yet.`);
          render();
          return;
        }

        stateApi.accept(id);
        render();
      });
    });
  }

  /* --------------------------------------------------
     RESET BUTTON BINDING
     --------------------------------------------------
     The state engine stores data in localStorage under
     neodoxent_state. Reset clears that state and reloads.
     -------------------------------------------------- */
  function bindResetButton() {
    const resetButton = document.getElementById("reset-state");
    if (!resetButton) return;

    resetButton.addEventListener("click", () => {
      localStorage.removeItem("neodoxent_state");
      window.location.reload();
    });
  }

  /* --------------------------------------------------
     BOOT
     -------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    bindAcceptButtons();
    bindResetButton();
    render();
  });
})();
