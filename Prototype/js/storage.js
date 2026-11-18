/*
 * Dados de inicio
 * Os dados são guardados no LocalStorage do navegador.
 */
(function () {
  'use strict';

  const STORAGE_KEYS = {
    sponsors: 'animalec_sponsors',
    experts: 'animalec_experts'
  };

  const ANIMALS = [
    { id: 'animal-1', name: 'Lobo-ibérico' },
    { id: 'animal-2', name: 'Lince-ibérico' },
    { id: 'animal-3', name: 'Águia-real' },
    { id: 'animal-4', name: 'Lontra-europeia' },
    { id: 'animal-5', name: 'Urso-pardo' }
  ];

  const INITIAL_DATA = {
    sponsors: [
      {
        id: 'sponsor-1',
        name: 'Associação Natureza Viva',
        email: 'geral@naturezaviva.pt',
        website: 'https://example.com',
        logo: '',
        description: 'Apoio a iniciativas de conservação da natureza.',
        animalIds: ['animal-1', 'animal-2']
      },
      {
        id: 'sponsor-2',
        name: 'Fundação Vida Selvagem',
        email: 'contacto@vidaselvagem.pt',
        website: '',
        logo: '',
        description: 'Entidade de apoio à proteção da fauna.',
        animalIds: ['animal-3']
      }
    ],
    experts: [
      {
        id: 'expert-1',
        name: 'Ana Martins',
        email: 'ana.martins@example.com',
        institution: 'Universidade de Trás-os-Montes e Alto Douro',
        specialty: 'Biologia da conservação',
        taxonomy: 'Canidae',
        photo: '',
        biography: 'Investigadora na área da conservação de mamíferos.',
        animalIds: ['animal-1']
      },
      {
        id: 'expert-2',
        name: 'João Costa',
        email: 'joao.costa@example.com',
        institution: 'Centro de Estudos da Biodiversidade',
        specialty: 'Ecologia e habitats',
        taxonomy: 'Felidae',
        photo: '',
        biography: 'Especialista em ecologia e conservação de felinos.',
        animalIds: ['animal-2']
      }
    ]
  };

  function read(collection) {
    const key = STORAGE_KEYS[collection];
    if (!key) return [];

    try {
      const saved = localStorage.getItem(key);
      if (saved === null) {
        const initial = INITIAL_DATA[collection].map(record => ({ ...record }));
        localStorage.setItem(key, JSON.stringify(initial));
        return initial;
      }
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Não foi possível ler os dados guardados.', error);
      return [];
    }
  }

  function write(collection, records) {
    const key = STORAGE_KEYS[collection];
    if (!key) return false;

    try {
      localStorage.setItem(key, JSON.stringify(records));
      return true;
    } catch (error) {
      console.error('Não foi possível guardar os dados.', error);
      return false;
    }
  }

  function createId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID();
    }
    return `record-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  }

  function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[character]);
  }

  function animalNames(ids) {
    const selectedIds = Array.isArray(ids) ? ids : [];
    return selectedIds
      .map(id => ANIMALS.find(animal => animal.id === id))
      .filter(Boolean)
      .map(animal => animal.name);
  }

  function checkedAnimalIds(container) {
    return Array.from(container.querySelectorAll('input[name="animalIds"]:checked'))
      .map(input => input.value);
  }

  function renderAnimalCheckboxes(container, selectedIds = []) {
    const selected = new Set(selectedIds);
    container.innerHTML = ANIMALS.map(animal => `
      <label class="checkbox-option">
        <input type="checkbox" name="animalIds" value="${escapeHTML(animal.id)}" ${selected.has(animal.id) ? 'checked' : ''}>
        <span>${escapeHTML(animal.name)}</span>
      </label>
    `).join('');
  }

  function showToast(message) {
    let region = document.getElementById('toast-region');
    if (!region) {
      region = document.createElement('div');
      region.id = 'toast-region';
      region.className = 'toast-region';
      region.setAttribute('role', 'status');
      region.setAttribute('aria-live', 'polite');
      document.body.appendChild(region);
    }
    region.textContent = message;
    window.setTimeout(() => {
      if (region) region.textContent = '';
    }, 2500);
  }

  window.AnimalecStorage = {
    animals: ANIMALS,
    read,
    write,
    createId,
    escapeHTML,
    animalNames,
    checkedAnimalIds,
    renderAnimalCheckboxes,
    showToast
  };
})();
