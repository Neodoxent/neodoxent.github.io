/* ==================================================
   modules.js — Infotech Interface Layer v1.1
   --------------------------------------------------
   This file defines the unlock grammar for the Meta-Landing.
   It does not manipulate the DOM directly. It describes modules,
   requirements, grants, vector shifts, and presentation states.

   Status meanings:
   - hidden: absent from view until earned
   - veiled: hinted but inaccessible
   - revealed: visible and available for engagement
   - accepted: integrated into the reader's local state
   - deferred: visible as future architecture, but not enterable
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
      vector: "orientation"
    }
  },
  {
    id: "zephyr",
    title: "Zephyr Protocol",
    initialStatus: "hidden",
    requires: {
      accepted: ["welcome"]
    },
    grants: {
      bits: 1,
      strata: { stabilization: 1 },
      qbits: { cognitive: 1 },
      vector: "zephyr"
    }
  },
  {
    id: "aperture",
    title: "Aperture Calibration",
    initialStatus: "hidden",
    requires: {
      accepted: ["zephyr"],
      strata: { stabilization: 1 }
    },
    grants: {
      bits: 2,
      orientation: 1,
      coherence: 1,
      strata: { orientation: 1, stabilization: 1 },
      qbits: { cognitive: 1, symbolic: 1 },
      vector: "aperture"
    }
  },
  {
    id: "cards",
    title: "Card Interface",
    initialStatus: "hidden",
    requires: {
      accepted: ["aperture"],
      strata: { orientation: 2, stabilization: 1 },
      coherence: 1
    },
    grants: {
      bits: 2,
      strata: { semiotic: 1 },
      qbits: { symbolic: 2, poetic: 1 },
      vector: "cardinal"
    }
  },
  {
    id: "glyphs",
    title: "Glyph Interface",
    initialStatus: "hidden",
    requires: {
      accepted: ["cards"],
      strata: { semiotic: 1 },
      qbits: { symbolic: 2 }
    },
    grants: {
      bits: 2,
      strata: { semiotic: 1 },
      qbits: { symbolic: 2, cognitive: 1 },
      vector: "glyphic"
    }
  },
  {
    id: "regalia",
    title: "Regalia Presentation",
    initialStatus: "hidden",
    requires: {
      accepted: ["glyphs"],
      strata: { semiotic: 2 },
      complexity: 12
    },
    grants: {
      bits: 2,
      strata: { regal: 1 },
      qbits: { regal: 2, poetic: 1 },
      vector: "regal"
    }
  },
  {
    id: "atlas",
    title: "Atlas Layer",
    initialStatus: "hidden",
    requires: {
      accepted: ["regalia"],
      strata: { regal: 1 },
      entanglement: 2
    },
    grants: {
      bits: 2,
      entanglement: 1,
      strata: { cartographic: 1 },
      qbits: { architectural: 2 },
      vector: "architect"
    }
  },
  {
    id: "complexity-primer",
    title: "Complexity Primer",
    initialStatus: "hidden",
    requires: {
      accepted: ["atlas"],
      complexity: 15,
      coherence: 2
    },
    grants: {
      bits: 3,
      coherence: 1,
      qbits: { cognitive: 2, architectural: 1 },
      vector: "complexity"
    }
  },
  {
    id: "cybernetic-primer",
    title: "Cybernetic Primer",
    initialStatus: "hidden",
    requires: {
      accepted: ["complexity-primer"],
      coherence: 3,
      qbits: { cybernetic: 1 }
    },
    grants: {
      bits: 3,
      entanglement: 1,
      strata: { cybernetic: 1 },
      qbits: { cybernetic: 3 },
      vector: "cybernetic"
    }
  },
  {
    id: "frameworks",
    title: "Framework Layer",
    initialStatus: "hidden",
    requires: {
      accepted: ["cybernetic-primer"],
      strata: { cybernetic: 1 },
      qbits: { architectural: 2 }
    },
    grants: {
      bits: 3,
      coherence: 1,
      qbits: { architectural: 3, cybernetic: 1 },
      vector: "framework"
    }
  },
  {
    id: "drunemeton",
    title: "Drunemeton Outer Gate",
    initialStatus: "deferred",
    requires: {
      accepted: ["frameworks"],
      complexity: 35,
      coherence: 5,
      entanglement: 5,
      qbits: { cathedral: 1 }
    },
    grants: {
      bits: 4,
      strata: { cathedral: 1 },
      qbits: { cathedral: 3, regal: 1 },
      vector: "cathedral"
    }
  },
  {
    id: "cathedral",
    title: "Cathedral / Six Books",
    initialStatus: "deferred",
    requires: {
      accepted: ["drunemeton"],
      complexity: 50,
      coherence: 7,
      orientation: 5
    },
    grants: {
      bits: 6,
      strata: { cathedral: 2 },
      qbits: { cathedral: 6 },
      vector: "cathedral"
    }
  }
];
