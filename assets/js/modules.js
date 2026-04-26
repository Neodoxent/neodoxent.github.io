/* ==================================================
   modules.js — Infotech Interface Layer v1.4 STABLE
   --------------------------------------------------
   Defines module sequence, unlock requirements, grants,
   field resources, and nested chamber segments.

   Stable recovery rule:
   Every requirement must have a clear upstream source.
   ================================================== */

window.NEODOXENT_MODULES = [
  {
    id: "welcome",
    title: "Welcome Chamber",
    initialStatus: "revealed",
    grants: {
      bits: 1,
      orientation: 1,
      strata: { orientation: 1 },
      qbits: { cognitive: 1 },
      resources: { orientation: 1 },
      vector: "orientation"
    }
  },
  {
    id: "zephyr",
    title: "Zephyr Protocol",
    initialStatus: "hidden",
    requires: { accepted: ["welcome"] },
    acceptRequires: {
      dwellSeconds: 120,
      resources: { attention: 2, orientation: 2, witness: 1, resonance: 1 }
    },
    segments: [
      { id: "notice", title: "Notice", text: "Zephyr is not speed. It is light traversal with return preserved. It teaches the reader that movement must remain gentle enough for orientation to survive.", grants: { resources: { orientation: 1 }, qbits: { cognitive: 1 } } },
      { id: "principle", title: "Traversal Principle", text: "Move only as far as orientation can remain intact. A path that cannot be returned from is not traversal; it is drift.", grants: { resources: { attention: 1, signal: 1 }, strata: { stabilization: 1 } } },
      { id: "return", title: "Return Principle", text: "Every path must preserve a way back to the field. Return is not regression; it is how coherence is maintained across depth.", grants: { resources: { witness: 1, orientation: 1 }, qbits: { architectural: 1 } } },
      { id: "integration", title: "Integration", text: "Accept Zephyr only when its movement feels stable, not merely available. The interface should be entered with attention rather than appetite.", grants: { resources: { attention: 1, resonance: 1 }, qbits: { poetic: 1 } } }
    ],
    grants: {
      bits: 1,
      strata: { stabilization: 1 },
      qbits: { cognitive: 1 },
      resources: { trace: 1 },
      vector: "zephyr"
    }
  },
  {
    id: "aperture",
    title: "Aperture Calibration",
    initialStatus: "hidden",
    requires: { accepted: ["zephyr"], strata: { stabilization: 1 }, resources: { attention: 2, orientation: 2 } },
    grants: {
      bits: 2,
      orientation: 1,
      coherence: 1,
      strata: { orientation: 1, stabilization: 1 },
      qbits: { cognitive: 1, symbolic: 1 },
      resources: { signal: 1, attention: 1 },
      vector: "aperture"
    }
  },
  {
    id: "cards",
    title: "Card Interface",
    initialStatus: "hidden",
    requires: { accepted: ["aperture"], strata: { orientation: 2, stabilization: 1 }, resources: { attention: 2, signal: 1 }, coherence: 1 },
    grants: {
      bits: 2,
      coherence: 1,
      strata: { semiotic: 1 },
      qbits: { symbolic: 2, poetic: 1 },
      resources: { signal: 2, trace: 1 },
      vector: "cardinal"
    }
  },
  {
    id: "glyphs",
    title: "Glyph Interface",
    initialStatus: "hidden",
    requires: { accepted: ["cards"], strata: { semiotic: 1 }, qbits: { symbolic: 2 } },
    grants: {
      bits: 2,
      strata: { semiotic: 1 },
      qbits: { symbolic: 2, cognitive: 1 },
      resources: { signal: 1, trace: 1 },
      vector: "glyphic"
    }
  },
  {
    id: "regalia",
    title: "Regalia Presentation",
    initialStatus: "hidden",
    requires: { accepted: ["glyphs"], strata: { semiotic: 2 }, complexity: 12 },
    grants: {
      bits: 2,
      strata: { regal: 1 },
      qbits: { regal: 2, poetic: 1 },
      resources: { witness: 1 },
      vector: "regal"
    }
  },
  {
    id: "atlas",
    title: "Atlas Layer",
    initialStatus: "hidden",
    requires: { accepted: ["regalia"], strata: { regal: 1 }, entanglement: 2 },
    grants: {
      bits: 2,
      coherence: 1,
      entanglement: 1,
      strata: { cartographic: 1 },
      qbits: { architectural: 2 },
      resources: { trace: 1, attention: 1 },
      vector: "architect"
    }
  },
  {
    id: "complexity-primer",
    title: "Complexity Primer",
    initialStatus: "hidden",
    requires: { accepted: ["atlas"], complexity: 15, coherence: 2 },
    grants: {
      bits: 3,
      coherence: 1,
      qbits: { cognitive: 2, architectural: 1 },
      resources: { attention: 1 },
      vector: "complexity"
    }
  },
  {
    id: "cybernetic-primer",
    title: "Cybernetic Primer",
    initialStatus: "hidden",
    requires: { accepted: ["complexity-primer"], coherence: 3, qbits: { architectural: 2 } },
    grants: {
      bits: 3,
      coherence: 1,
      entanglement: 1,
      strata: { cybernetic: 1 },
      qbits: { cybernetic: 3 },
      resources: { signal: 1, trace: 1 },
      vector: "cybernetic"
    }
  },
  {
    id: "frameworks",
    title: "Framework Layer",
    initialStatus: "hidden",
    requires: { accepted: ["cybernetic-primer"], strata: { cybernetic: 1 }, qbits: { cybernetic: 1 } },
    grants: {
      bits: 3,
      coherence: 1,
      qbits: { architectural: 3, cybernetic: 1, cathedral: 1 },
      resources: { trace: 1 },
      vector: "framework"
    }
  },
  {
    id: "drunemeton",
    title: "Drunemeton Outer Gate",
    initialStatus: "deferred",
    requires: { accepted: ["frameworks"], complexity: 35, coherence: 5, entanglement: 5, qbits: { cathedral: 1 } },
    grants: {
      bits: 4,
      coherence: 2,
      strata: { cathedral: 1 },
      qbits: { cathedral: 3, regal: 1 },
      resources: { witness: 2 },
      vector: "cathedral"
    }
  },
  {
    id: "cathedral",
    title: "Cathedral / Six Books",
    initialStatus: "deferred",
    requires: { accepted: ["drunemeton"], complexity: 50, coherence: 7, orientation: 5 },
    grants: {
      bits: 6,
      strata: { cathedral: 2 },
      qbits: { cathedral: 6 },
      resources: { trace: 3 },
      vector: "cathedral"
    }
  }
];
