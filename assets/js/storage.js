/* ==================================================
   storage.js — Neodoxent Storage Utilities
   --------------------------------------------------
   Small shared localStorage helpers used by UI modules.
   ================================================== */

window.NEODOXENT_STORAGE = (function(){
  "use strict";

  function getJson(key, fallback){
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value === null || value === undefined ? fallback : value;
    } catch(error){
      return fallback;
    }
  }

  function setJson(key, value){
    localStorage.setItem(key, JSON.stringify(value));
  }

  function remove(key){
    localStorage.removeItem(key);
  }

  return { getJson, setJson, remove };
})();
